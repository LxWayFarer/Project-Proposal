#include <vector>
#include <algorithm>
#include <chrono>
#include <emscripten/bind.h>

using namespace emscripten;

struct GameState {
    std::vector<int> board;
    std::vector<int> instance_to_piece;
    std::vector<std::vector<int>> instance_cells;
    int next_instance_id;
};

class PuzzleEngine {
private:
    int board_size;
    std::vector<int> board;
    std::vector<int> instance_to_piece;
    std::vector<std::vector<int>> instance_cells;
    int next_instance_id;

    std::vector<GameState> undo_stack;
    std::vector<GameState> redo_stack;
    std::vector<int> solution_steps; 

    struct SolverPiece {
        int piece_id;
        std::vector<int> shape;
        std::vector<std::vector<int>> variants;
    };

    std::vector<SolverPiece> solver_pieces;
    std::vector<int> best_board;
    int best_score = 0;
    
    // 效能與超時控制變數
    int theoretical_max_score = 0; 
    unsigned int nodes_searched = 0; 
    std::chrono::time_point<std::chrono::steady_clock> start_time;
    bool time_out = false;
    int max_time_ms = 3000;

    // DLX 資料結構
    struct DLXNode {
        int L, R, U, D;
        int C; 
        int row; 
    };
    std::vector<DLXNode> dlx;
    std::vector<int> col_size;
    
    struct RowData {
        int piece_idx; 
        std::vector<int> cells; 
    };
    std::vector<RowData> row_info;
    std::vector<int> dlx_solution;

    void save_state() {
        undo_stack.push_back({board, instance_to_piece, instance_cells, next_instance_id});
        redo_stack.clear();
    }

    std::vector<int> normalize_shape(const std::vector<int>& shape) {
        int min_x = 999999, min_y = 999999;
        for (size_t i = 0; i < shape.size(); i += 2) {
            min_x = std::min(min_x, shape[i]);
            min_y = std::min(min_y, shape[i + 1]);
        }
        std::vector<int> result;
        for (size_t i = 0; i < shape.size(); i += 2) {
            result.push_back(shape[i] - min_x);
            result.push_back(shape[i + 1] - min_y);
        }
        return result;
    }

    std::vector<int> rotate90(const std::vector<int>& shape) {
        std::vector<int> result;
        for (size_t i = 0; i < shape.size(); i += 2) {
            result.push_back(-shape[i + 1]);
            result.push_back(shape[i]);
        }
        return normalize_shape(result);
    }

    std::vector<int> flip_horizontal(const std::vector<int>& shape) {
        std::vector<int> result;
        for (size_t i = 0; i < shape.size(); i += 2) {
            result.push_back(-shape[i]);
            result.push_back(shape[i + 1]);
        }
        return normalize_shape(result);
    }

    std::vector<std::vector<int>> generate_variants(const std::vector<int>& shape) {
        std::vector<std::vector<int>> variants;
        auto current = normalize_shape(shape);
        for (int flip = 0; flip < 2; flip++) {
            auto s = (flip == 0) ? current : flip_horizontal(current);
            for (int r = 0; r < 4; r++) {
                variants.push_back(s);
                s = rotate90(s);
            }
        }
        std::vector<std::vector<int>> unique_variants;
        for (const auto& var : variants) {
            if (std::find(unique_variants.begin(), unique_variants.end(), var) == unique_variants.end()) {
                unique_variants.push_back(var);
            }
        }
        return unique_variants;
    }

    void dlx_cover(int c) {
        dlx[dlx[c].R].L = dlx[c].L;
        dlx[dlx[c].L].R = dlx[c].R;
        for (int i = dlx[c].D; i != c; i = dlx[i].D) {
            for (int j = dlx[i].R; j != i; j = dlx[j].R) {
                dlx[dlx[j].D].U = dlx[j].U;
                dlx[dlx[j].U].D = dlx[j].D;
                col_size[dlx[j].C]--;
            }
        }
    }

    void dlx_uncover(int c) {
        for (int i = dlx[c].U; i != c; i = dlx[i].U) {
            for (int j = dlx[i].L; j != i; j = dlx[j].L) {
                col_size[dlx[j].C]++;
                dlx[dlx[j].D].U = j;
                dlx[dlx[j].U].D = j;
            }
        }
        dlx[dlx[c].R].L = c;
        dlx[dlx[c].L].R = c;
    }

    bool dlx_search(int depth, int num_empty_cells) {
        if (time_out) return false;
        
        nodes_searched++;
        if ((nodes_searched & 4095) == 0) { 
            auto now = std::chrono::steady_clock::now();
            if (std::chrono::duration_cast<std::chrono::milliseconds>(now - start_time).count() > max_time_ms) {
                time_out = true;
                return false;
            }
        }

        if (dlx[0].R > num_empty_cells || dlx[0].R == 0) {
            int filled_empty_cells = 0;
            std::vector<int> current_board = board; 
            std::vector<int> current_steps;
            int valid_piece_count = 0; 

            for (int i = 0; i < depth; i++) {
                int row_idx = dlx_solution[i];
                const auto& rdata = row_info[row_idx];
                
                if (rdata.piece_idx == -1 || rdata.cells.empty()) continue; 

                valid_piece_count++;
                int p_id = solver_pieces[rdata.piece_idx].piece_id;
                int inst_id = valid_piece_count; 
                
                current_steps.push_back(p_id);
                current_steps.push_back(rdata.cells.size());
                
                for (int cell_idx : rdata.cells) {
                    current_board[cell_idx] = inst_id;
                    current_steps.push_back(cell_idx);
                    filled_empty_cells++; 
                }
            }
            
            int total_score = (board_size * board_size - num_empty_cells) + filled_empty_cells;

            if (total_score > best_score) {
                best_score = total_score;
                best_board = current_board;
                solution_steps = current_steps;
            }

            if (best_score == board_size * board_size || best_score == theoretical_max_score) {
                return true;
            }
            
            return false; 
        }

        int c = dlx[0].R;
        for (int i = dlx[0].R; i != 0 && i <= num_empty_cells; i = dlx[i].R) {
            if (col_size[i] < col_size[c]) c = i;
        }

        if (col_size[c] == 0) return false; 

        dlx_cover(c);
        for (int i = dlx[c].D; i != c; i = dlx[i].D) {
            dlx_solution[depth] = dlx[i].row;
            for (int j = dlx[i].R; j != i; j = dlx[j].R) dlx_cover(dlx[j].C);
            
            if (dlx_search(depth + 1, num_empty_cells)) return true;
            
            for (int j = dlx[i].L; j != i; j = dlx[j].L) dlx_uncover(dlx[j].C);
        }
        dlx_uncover(c);
        return false;
    }

    void add_dlx_row(const std::vector<int>& cols, int piece_idx, const std::vector<int>& board_cells) {
        if (cols.empty()) return;
        int first_node = dlx.size();
        for (size_t i = 0; i < cols.size(); ++i) {
            int c = cols[i];
            int node_idx = dlx.size();
            dlx.push_back({-1, -1, dlx[c].U, c, c, (int)row_info.size()});
            dlx[dlx[c].U].D = node_idx;
            dlx[c].U = node_idx;
            dlx[node_idx].L = (i == 0) ? node_idx + cols.size() - 1 : node_idx - 1;
            dlx[node_idx].R = (i == cols.size() - 1) ? first_node : node_idx + 1;
            col_size[c]++;
        }
        row_info.push_back({piece_idx, board_cells});
    }

public:
    PuzzleEngine(int size) : board_size(size), next_instance_id(1) {
        board.resize(size * size, 0);
        instance_to_piece.push_back(0);
        instance_cells.push_back({});
    }

    bool undo() {
        if (undo_stack.empty()) return false;
        redo_stack.push_back({board, instance_to_piece, instance_cells, next_instance_id});
        auto state = undo_stack.back();
        undo_stack.pop_back();
        board = state.board;
        instance_to_piece = state.instance_to_piece;
        instance_cells = state.instance_cells;
        next_instance_id = state.next_instance_id;
        return true;
    }

    bool redo() {
        if (redo_stack.empty()) return false;
        undo_stack.push_back({board, instance_to_piece, instance_cells, next_instance_id});
        auto state = redo_stack.back();
        redo_stack.pop_back();
        board = state.board;
        instance_to_piece = state.instance_to_piece;
        instance_cells = state.instance_cells;
        next_instance_id = state.next_instance_id;
        return true;
    }

    void toggle_obstacle(int target_x, int target_y) {
        if (target_x < 0 || target_x >= board_size || target_y < 0 || target_y >= board_size) return;
        save_state();
        int index = target_y * board_size + target_x;
        if (board[index] == 0) {
            board[index] = -1; 
        } else if (board[index] == -1) {
            board[index] = 0;
        } else {
            undo_stack.pop_back(); 
        }
    }

    void clear_solver_pieces() {
        solver_pieces.clear();
        best_score = 0;
        best_board.clear();
        solution_steps.clear();
    }

    void register_solver_piece(int piece_id, const std::vector<int>& shape) {
        solver_pieces.push_back({piece_id, shape, generate_variants(shape)});
    }

    int get_best_score() const { return best_score; }

    std::vector<int> get_solution_board() const {
        return best_board.empty() ? std::vector<int>(board_size * board_size, 0) : best_board;
    }

    std::vector<int> get_solution_steps() const {
        return solution_steps;
    }

    void reset_board() {
        save_state();
        std::fill(board.begin(), board.end(), 0);
        instance_to_piece.assign(1, 0);
        instance_cells.assign(1, {});
        next_instance_id = 1;
        undo_stack.clear();
        redo_stack.clear();
    }

    std::vector<int> get_board_state() const { return board; }

    bool check_placement(const std::vector<int>& piece_offsets, int target_x, int target_y) {
        for (size_t i = 0; i < piece_offsets.size(); i += 2) {
            int x = target_x + piece_offsets[i], y = target_y + piece_offsets[i + 1];
            if (x < 0 || x >= board_size || y < 0 || y >= board_size || board[y * board_size + x] != 0) return false;
        }
        return true;
    }

    bool place_piece(int piece_id, const std::vector<int>& piece_offsets, int target_x, int target_y) {
        if (!check_placement(piece_offsets, target_x, target_y)) return false;
        save_state();
        int instance_id = next_instance_id++;
        instance_to_piece.push_back(piece_id);
        instance_cells.push_back({});
        for (size_t i = 0; i < piece_offsets.size(); i += 2) {
            int index = (target_y + piece_offsets[i + 1]) * board_size + (target_x + piece_offsets[i]);
            board[index] = instance_id;
            instance_cells[instance_id].push_back(index);
        }
        return true;
    }

    void remove_piece(int cell_index) {
        if (cell_index < 0 || cell_index >= (int)board.size()) return;
        int instance_id = board[cell_index];
        if (instance_id <= 0 || instance_id >= (int)instance_cells.size()) return;
        
        save_state();
        for (int index : instance_cells[instance_id]) board[index] = 0;
        instance_cells[instance_id].clear();
        if (instance_id < (int)instance_to_piece.size()) instance_to_piece[instance_id] = 0;
    }

    int get_piece_id_at(int cell_index) const {
        if (cell_index < 0 || cell_index >= (int)board.size()) return 0;
        int instance_id = board[cell_index];
        return (instance_id <= 0 || instance_id >= (int)instance_to_piece.size()) ? 0 : instance_to_piece[instance_id];
    }

    void solve_best(int time_limit_ms) {
        best_score = 0;
        best_board.clear();
        solution_steps.clear();
        time_out = false;
        max_time_ms = time_limit_ms;
        nodes_searched = 0; 
        start_time = std::chrono::steady_clock::now();

        dlx.clear();
        col_size.clear();
        row_info.clear();

        std::vector<int> empty_cells;
        std::vector<int> cell_to_col(board_size * board_size, -1);
        for (int i = 0; i < board_size * board_size; ++i) {
            if (board[i] == 0) {
                empty_cells.push_back(i);
                cell_to_col[i] = empty_cells.size(); 
            }
        }
        
        int num_empty = empty_cells.size();
        int num_pieces = solver_pieces.size();
        int total_cols = num_empty + num_pieces;

        int total_piece_cells = 0;
        for (const auto& p : solver_pieces) {
            total_piece_cells += p.shape.size() / 2;
        }
        theoretical_max_score = (board_size * board_size - num_empty) + std::min(num_empty, total_piece_cells);

        dlx.resize(total_cols + 1);
        col_size.assign(total_cols + 1, 0);
        for (int i = 0; i <= total_cols; ++i) {
            dlx[i] = {i - 1, i + 1, i, i, i, -1};
        }
        dlx[0].L = total_cols;
        dlx[total_cols].R = 0;

        for (size_t p = 0; p < solver_pieces.size(); ++p) {
            const auto& piece = solver_pieces[p];
            int piece_col = num_empty + 1 + p;

            for (const auto& variant : piece.variants) {
                for (int y = 0; y < board_size; y++) {
                    for (int x = 0; x < board_size; x++) {
                        std::vector<int> covered_cols;
                        std::vector<int> covered_cells;
                        bool can_place = true;

                        for (size_t i = 0; i < variant.size(); i += 2) {
                            int px = x + variant[i];
                            int py = y + variant[i + 1];
                            if (px < 0 || px >= board_size || py < 0 || py >= board_size) {
                                can_place = false; break;
                            }
                            int idx = py * board_size + px;
                            if (cell_to_col[idx] == -1) {
                                can_place = false; break; 
                            }
                            covered_cols.push_back(cell_to_col[idx]);
                            covered_cells.push_back(idx);
                        }

                        if (can_place) {
                            covered_cols.push_back(piece_col);
                            add_dlx_row(covered_cols, p, covered_cells);
                        }
                    }
                }
            }
            
            add_dlx_row({piece_col}, p, {});
        }

        for (int i = 0; i < num_empty; ++i) {
            int cell_col = i + 1; 
            add_dlx_row({cell_col}, -1, {}); 
        }

        dlx_solution.resize(row_info.size(), 0);
        dlx_search(0, num_empty);
    }
};

EMSCRIPTEN_BINDINGS(puzzle_module) {
    emscripten::register_vector<int>("VectorInt");
    emscripten::class_<PuzzleEngine>("PuzzleEngine")
        .constructor<int>()
        .function("get_board_state", &PuzzleEngine::get_board_state)
        .function("reset_board", &PuzzleEngine::reset_board)
        .function("place_piece", &PuzzleEngine::place_piece)
        .function("remove_piece", &PuzzleEngine::remove_piece)
        .function("get_piece_id_at", &PuzzleEngine::get_piece_id_at)
        .function("clear_solver_pieces", &PuzzleEngine::clear_solver_pieces)
        .function("register_solver_piece", &PuzzleEngine::register_solver_piece)
        .function("solve_best", &PuzzleEngine::solve_best)
        .function("get_best_score", &PuzzleEngine::get_best_score)
        .function("get_solution_board", &PuzzleEngine::get_solution_board)
        .function("undo", &PuzzleEngine::undo)
        .function("redo", &PuzzleEngine::redo)
        .function("toggle_obstacle", &PuzzleEngine::toggle_obstacle)
        .function("get_solution_steps", &PuzzleEngine::get_solution_steps);
}