import React, { useEffect, useState } from 'react';

interface PuzzlePiece {
  id: number;
  name: string;
  size: number;
  shape: number[];
  grid: number[][];
  solverId?: number;
}

const ALL_PIECES: PuzzlePiece[] = [
  { id: 101, name: "1格單元塊", size: 1, shape: [0, 0], grid: [[1]] },
  { id: 201, name: "2格短直條", size: 2, shape: [0, 0, 1, 0], grid: [[1, 1]] },
  { id: 301, name: "3格標準直條", size: 3, shape: [0, 0, 1, 0, 2, 0], grid: [[1, 1, 1]] },
  { id: 302, name: "3格小L形", size: 3, shape: [0, 0, 1, 0, 1, 1], grid: [[1, 1], [0, 1]] },
  { id: 401, name: "4格長直條(I)", size: 4, shape: [0, 0, 1, 0, 2, 0, 3, 0], grid: [[1, 1, 1, 1]] },
  { id: 402, name: "4格正方形(O)", size: 4, shape: [0, 0, 1, 0, 0, 1, 1, 1], grid: [[1, 1], [1, 1]] },
  { id: 403, name: "4格拐角L形", size: 4, shape: [0, 0, 1, 0, 2, 0, 0, 1], grid: [[1, 1, 1], [1, 0, 0]] },
  { id: 404, name: "4格閃電Z形", size: 4, shape: [0, 0, 1, 0, 1, 1, 2, 1], grid: [[1, 1, 0], [0, 1, 1]] },
  { id: 405, name: "4格凸字T形", size: 4, shape: [0, 0, 1, 0, 2, 0, 1, 1], grid: [[1, 1, 1], [0, 1, 0]] },
  { id: 501, name: "5格超長直條", size: 5, shape: [0, 0, 1, 0, 2, 0, 3, 0, 4, 0], grid: [[1, 1, 1, 1, 1]] },
  { id: 502, name: "5格大十字(X)", size: 5, shape: [1, 0, 0, 1, 1, 1, 2, 1, 1, 2], grid: [[0, 1, 0], [1, 1, 1], [0, 1, 0]] },
  { id: 503, name: "5格長凸T形", size: 5, shape: [0, 0, 1, 0, 2, 0, 1, 1, 1, 2], grid: [[1, 1, 1], [0, 1, 0], [0, 1, 0]] },
  { id: 504, name: "5格大V形", size: 5, shape: [0, 0, 0, 1, 0, 2, 1, 2, 2, 2], grid: [[1, 0, 0], [1, 0, 0], [1, 1, 1]] },
  { id: 505, name: "5格馬蹄U形", size: 5, shape: [0, 0, 2, 0, 0, 1, 1, 1, 2, 1], grid: [[1, 0, 1], [1, 1, 1]] },
  { id: 509, name: "5格大L形", size: 5, shape: [0, 0, 0, 1, 0, 2, 0, 3, 1, 3], grid: [[1, 0], [1, 0], [1, 0], [1, 1]] },
  { id: 511, name: "5格階梯N形", size: 5, shape: [0, 0, 0, 1, 1, 1, 1, 2, 1, 3], grid: [[1, 0], [1, 1], [0, 1], [0, 1]] }
];

const COLOR_PALETTE = [
  'bg-gradient-to-br from-rose-400 to-rose-600 border-rose-300 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)]',
  'bg-gradient-to-br from-orange-400 to-orange-600 border-orange-300 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)]',
  'bg-gradient-to-br from-amber-400 to-amber-600 border-amber-300 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)]',
  'bg-gradient-to-br from-yellow-300 to-yellow-500 border-yellow-200 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)]',
  'bg-gradient-to-br from-lime-400 to-lime-600 border-lime-300 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)]',
  'bg-gradient-to-br from-green-400 to-green-600 border-green-300 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)]',
  'bg-gradient-to-br from-emerald-400 to-emerald-600 border-emerald-300 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)]',
  'bg-gradient-to-br from-teal-400 to-teal-600 border-teal-300 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)]',
  'bg-gradient-to-br from-cyan-400 to-cyan-600 border-cyan-300 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)]',
  'bg-gradient-to-br from-sky-400 to-sky-600 border-sky-300 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)]',
  'bg-gradient-to-br from-blue-400 to-blue-600 border-blue-300 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)]',
  'bg-gradient-to-br from-indigo-400 to-indigo-600 border-indigo-300 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)]',
  'bg-gradient-to-br from-violet-400 to-violet-600 border-violet-300 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)]',
  'bg-gradient-to-br from-purple-400 to-purple-600 border-purple-300 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)]',
  'bg-gradient-to-br from-fuchsia-400 to-fuchsia-600 border-fuchsia-300 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)]',
  'bg-gradient-to-br from-pink-400 to-pink-600 border-pink-300 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)]'
];

const PREVIEW_COLORS: Record<number, string> = {
  101: COLOR_PALETTE[0], 201: COLOR_PALETTE[1], 301: COLOR_PALETTE[2], 302: COLOR_PALETTE[3],
  401: COLOR_PALETTE[4], 402: COLOR_PALETTE[5], 403: COLOR_PALETTE[6], 404: COLOR_PALETTE[7],
  405: COLOR_PALETTE[8], 501: COLOR_PALETTE[9], 502: COLOR_PALETTE[10], 503: COLOR_PALETTE[11],
  504: COLOR_PALETTE[12], 505: COLOR_PALETTE[13], 509: COLOR_PALETTE[14], 511: COLOR_PALETTE[15],
};

const PieceGeometry = {
  normalize: (shape: number[]): number[] => {
    let minX = Infinity, minY = Infinity;
    for (let i = 0; i < shape.length; i += 2) {
      if (shape[i] < minX) minX = shape[i];
      if (shape[i+1] < minY) minY = shape[i+1];
    }
    return shape.map((val, i) => (i % 2 === 0 ? val - minX : val - minY));
  },
  rotateShapeClockwise: (shape: number[]): number[] => {
    const rotated = [];
    for (let i = 0; i < shape.length; i += 2) rotated.push(-shape[i + 1], shape[i]);
    return PieceGeometry.normalize(rotated);
  },
  flipShapeHorizontal: (shape: number[]): number[] => {
    const flipped = [];
    for (let i = 0; i < shape.length; i += 2) flipped.push(-shape[i], shape[i + 1]);
    return PieceGeometry.normalize(flipped);
  },
  rotateGridClockwise: (grid: number[][]): number[][] => {
    const r = grid.length, c = grid[0].length;
    const newGrid = Array.from({ length: c }, () => Array(r).fill(0));
    for (let i = 0; i < r; i++) {
      for (let j = 0; j < c; j++) newGrid[j][r - 1 - i] = grid[i][j];
    }
    return newGrid;
  },
  flipGridHorizontal: (grid: number[][]): number[][] => grid.map(row => [...row].reverse())
};

export default function App() {
  const [wasmModule, setWasmModule] = useState<any>(null);
  const [wasmEngine, setWasmEngine] = useState<any>(null);
  const [boardSize, setBoardSize] = useState<number>(6);
  const [boardState, setBoardState] = useState<number[]>([]);
  const [cellColors, setCellColors] = useState<string[]>([]);
  
  const [message, setMessage] = useState<string>('遊戲準備就緒，請開始拼圖');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [currentSelectedTransform, setCurrentSelectedTransform] = useState<PuzzlePiece>(ALL_PIECES[0]);
  const [draggingPiece, setDraggingPiece] = useState<PuzzlePiece | null>(null);
  const [hoverCell, setHoverCell] = useState<number | null>(null);
  const [placedCounts, setPlacedCounts] = useState<{ [key: number]: number }>({});
  const [mode, setMode] = useState<'user' | 'system'>('user');
  const [solverPieces, setSolverPieces] = useState<PuzzlePiece[]>([]);
  const [solving, setSolving] = useState(false);
  const [calcTimeLimit, setCalcTimeLimit] = useState<number>(3);
  
  const [isObstacleMode, setIsObstacleMode] = useState(false);
  const [animatedCells, setAnimatedCells] = useState<number[]>([]);

  const getTabButtonStyle = (isActive: boolean) => `
    py-2 rounded-lg text-xs font-bold transition-all border
    ${isActive ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-lg' : 'bg-slate-900 border-slate-700 text-slate-500 opacity-60 hover:opacity-100'}
  `;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const loadWasm = async () => {
      try {
        if (document.getElementById("puzzle-wasm")) return;
        const script = document.createElement("script");
        script.id = "puzzle-wasm";
        script.src = "/wasm/puzzle_engine.js";
        script.onload = async () => {
          try {
            // @ts-ignore
            const Module = await window.Module({
              locateFile: (path: string) => path.endsWith(".wasm") ? "/wasm/puzzle_engine.wasm" : path
            });
            setWasmModule(Module);
            setMessage("✅ WASM DLX 核心載入成功");
          } catch (err) {
            setMessage("❌ WASM 初始化失敗");
          }
        };
        document.body.appendChild(script);
      } catch (err) {
        setMessage("❌ WASM 載入異常");
      }
    };
    loadWasm();
  }, []);

  useEffect(() => {
    if (!wasmModule) return;
    if (wasmEngine && typeof wasmEngine.delete === 'function') wasmEngine.delete(); 
    
    const engine = new wasmModule.PuzzleEngine(boardSize);
    setWasmEngine(engine);
    syncFromEngine(engine);
    setSolverPieces([]);
    setMessage(`棋盤已重設為 ${boardSize}×${boardSize}`);
  }, [wasmModule, boardSize]);

  useEffect(() => {
    const newColors = Array(boardSize * boardSize).fill('');
    boardState.forEach((val, i) => {
        if (val > 0) newColors[i] = COLOR_PALETTE[val % COLOR_PALETTE.length];
    });
    setCellColors(newColors);

    const rawCounts: Record<number, number> = {};
    boardState.forEach(val => {
        if (val > 0 && val < 9999000) rawCounts[val] = (rawCounts[val] || 0) + 1;
    });

    const actualCounts: Record<number, number> = {};
    for (const [valStr, totalCells] of Object.entries(rawCounts)) {
        const val = parseInt(valStr, 10);
        const baseId = val >= 10000 ? Math.floor(val / 100) : val;
        const pieceById = ALL_PIECES.find(p => p.id === baseId);
        
        if (pieceById) {
           actualCounts[pieceById.id] = Math.round(totalCells / pieceById.size);
        } else {
            const pieceBySize = ALL_PIECES.find(p => p.size === totalCells);
            if (pieceBySize) {
                actualCounts[pieceBySize.id] = (actualCounts[pieceBySize.id] || 0) + 1;
            }
        }
    }
    setPlacedCounts(actualCounts);
  }, [boardState, boardSize]);

  const convertVectorToArray = (vector: any) => {
    if (!vector) return [];
    const arr = [];
    for (let i = 0; i < vector.size(); i++) arr.push(vector.get(i));
    return arr;
  };

  const syncFromEngine = (engine = wasmEngine) => {
    if (!engine) return;
    const vec = engine.get_board_state();
    const arr = convertVectorToArray(vec);
    vec.delete();
    setBoardState(arr); 
  };

  const handleUndo = () => {
    if (!wasmEngine) return;
    if (typeof wasmEngine.undo === 'function') {
      const success = wasmEngine.undo();
      syncFromEngine();
      setMessage(success ? "↩️ 已復原上一步" : "⚠️ 已經是最早的紀錄了");
    }
  };

  const handleRedo = () => {
    if (!wasmEngine) return;
    if (typeof wasmEngine.redo === 'function') {
      const success = wasmEngine.redo();
      syncFromEngine();
      setMessage(success ? "↪️ 已重做下一步" : "⚠️ 已經是最新的紀錄了");
    }
  };

  const rotateSelectedPiece = () => {
    setCurrentSelectedTransform(prev => ({
      ...prev,
      shape: PieceGeometry.rotateShapeClockwise(prev.shape),
      grid: PieceGeometry.rotateGridClockwise(prev.grid)
    }));
  };

  const flipSelectedPiece = () => {
    setCurrentSelectedTransform(prev => ({
      ...prev,
      shape: PieceGeometry.flipShapeHorizontal(prev.shape),
      grid: PieceGeometry.flipGridHorizontal(prev.grid)
    }));
  };

  // ✅ 修復缺失的 canPlacePiece 函數，防止 React 渲染黑屏
  const canPlacePiece = (piece: PuzzlePiece, baseX: number, baseY: number) => {
    for (let i = 0; i < piece.shape.length; i += 2) {
      const x = baseX + piece.shape[i];
      const y = baseY + piece.shape[i + 1];
      if (x < 0 || x >= boardSize || y < 0 || y >= boardSize) return false;
      if (boardState[y * boardSize + x] !== 0) return false;
    }
    return true;
  };

  const placePieceAt = (x: number, y: number) => {
    if (!wasmEngine || !wasmModule) return;
    let pieceVector: any = null;
    try {
      pieceVector = new wasmModule.VectorInt();
      currentSelectedTransform.shape.forEach((val: number) => pieceVector.push_back(val));
      const success = wasmEngine.place_piece(currentSelectedTransform.id, pieceVector, x, y);

      if (success) {
        syncFromEngine();
        setMessage(`👍 成功置入 [${currentSelectedTransform.name}]`);
      } else {
        setMessage(`❌ 碰撞或越界，放置失敗`);
      }
    } finally {
      if (pieceVector?.delete) pieceVector.delete();
    }
  };

  const handleCellClick = (index: number) => {
    if (!wasmEngine || solving) return;
    const cx = index % boardSize;
    const cy = Math.floor(index / boardSize);
    
    if (isObstacleMode) {
        if (boardState[index] > 0) {
            setMessage("⚠️ 該位置已有拼圖，無法放置黑洞障礙物");
            return;
        }
        if (typeof wasmEngine.toggle_obstacle === 'function') {
            wasmEngine.toggle_obstacle(cx, cy);
            syncFromEngine();
            setMessage(boardState[index] === -1 ? "🕳️ 已放置障礙" : "🧹 已移除障礙");
        }
        return;
    }

    if (mode === 'system') return; 

    if (boardState[index] <= 0) return;
    wasmEngine.remove_piece(index);
    syncFromEngine();
    setMessage(`🗑️ 已移除拼圖`);
  };

  const handleHint = () => {
    setMessage("💡 此版本引擎尚不支援單步提示功能");
  };

  const handleSolveWithAnimation = () => {
    if(!wasmEngine || !wasmModule) return;

    if (solverPieces.length === 0) {
        setMessage(`⚠️ 請至少選擇一塊拼圖加入待求解清單！`);
        return;
    }

    // ==========================================
    // 🧹 新增：在運算前清除畫面上「已放置的拼圖」
    // ==========================================
    // 找出盤面上所有大於 0 的格子（拼圖）並歸零，但保留小於 0 的格子（障礙物）
    const cleanBoardState = boardState.map(cell => (cell > 0 ? 0 : cell));
    
    // 1. 更新前端畫面狀態
    setBoardState(cleanBoardState); 

    // 2. 如果你的 C++ 引擎會記憶上一次的盤面，
    // 請在這裡呼叫你將前端盤面同步給 WASM 的函式（例如你原本寫的 syncBoardToEngine 等），
    // 讓 C++ 引擎知道拼圖已經被清空了！
    // ==========================================

    setSolving(true);
    setMessage(`⚙️ DLX 將進行最高 ${calcTimeLimit} 秒的最佳解搜尋...`);

    setTimeout(() => {
      try {
        if (typeof wasmEngine.clear_solver_pieces === 'function') wasmEngine.clear_solver_pieces();
        
        solverPieces.forEach(piece => {
          if (typeof wasmEngine.register_solver_piece === 'function') {
            const vec = new wasmModule.VectorInt();
            piece.shape.forEach(v => vec.push_back(v));
            wasmEngine.register_solver_piece(piece.solverId || piece.id, vec);
            vec.delete();
          }
        });
        
        // 呼叫 C++ 底層的 DLX 演算法
        wasmEngine.solve_best(calcTimeLimit * 1000);
        
        const finalVec = (typeof wasmEngine.get_solution_board === 'function') 
            ? wasmEngine.get_solution_board() 
            : wasmEngine.get_board_state();
            
        const finalArr = convertVectorToArray(finalVec);
        finalVec.delete();
        
        const newPieces: {val: number, indices: number[]}[] = [];
        const visited = new Set<number>();
        
        let allowedSingles = solverPieces.filter(p => p.size === 1).length;

        for (let i = 0; i < finalArr.length; i++) {
          const val = finalArr[i];
          // 👇 修正：改用 cleanBoardState 判斷，避免讀到 React 尚未更新的舊 state
          if (val > 0 && val < 9999000 && cleanBoardState[i] <= 0 && !visited.has(i)) {
            const comp = [];
            const q = [i];
            visited.add(i);
            
            while (q.length > 0) {
              const curr = q.shift()!;
              comp.push(curr);
              const x = curr % boardSize, y = Math.floor(curr / boardSize);
              const neighbors = [ {nx: x+1, ny: y}, {nx: x-1, ny: y}, {nx: x, ny: y+1}, {nx: x, ny: y-1} ];
              
              for (const {nx, ny} of neighbors) {
                if (nx >= 0 && nx < boardSize && ny >= 0 && ny < boardSize) {
                  const ni = ny * boardSize + nx;
                  // 👇 修正：同樣改用 cleanBoardState
                  if (finalArr[ni] === val && !visited.has(ni) && cleanBoardState[ni] <= 0) {
                    visited.add(ni);
                    q.push(ni);
                  }
                }
              }
            }
            
            if (comp.length === 1) {
                if (allowedSingles > 0) {
                    allowedSingles--;
                    newPieces.push({val, indices: comp});
                }
            } else {
                newPieces.push({val, indices: comp});
            }
          }
        }

        if (newPieces.length > 0) {
          let step = 0;
          // 👇 修正：動畫的基底要從乾淨的盤面開始播放
          let currentArr = [...cleanBoardState];
          
          const timer = setInterval(() => {
            if (step >= newPieces.length) {
              clearInterval(timer);
              setSolving(false);
              setAnimatedCells([]); 
              const realScore = newPieces.reduce((acc, p) => acc + p.indices.length, 0);
              setMessage(`✅ 演算與動畫展示完畢！實際覆蓋 ${realScore} 格`);
              return;
            }
            
            const piece = newPieces[step];
            piece.indices.forEach(idx => { currentArr[idx] = piece.val; });
            
            setBoardState([...currentArr]);
            setAnimatedCells(piece.indices); 
            step++;
          }, 350);
        } else {
          setSolving(false);
          setMessage(`✅ 演算完畢，找不到可行解或無新拼圖加入`);
        }
      } catch (error) {
          console.error("WASM 運算例外錯誤:", error);
          setSolving(false);
          setMessage(`❌ 演算過程發生錯誤，請重整頁面`);
      }
    }, 50);
  };

  // ✅ 新增：用來分組顯示系統模式清單的陣列
  const groupedSolverPieces = Object.values(
    solverPieces.reduce((acc, piece, index) => {
      if (!acc[piece.id]) acc[piece.id] = { ...piece, count: 0, indices: [] };
      acc[piece.id].count += 1;
      acc[piece.id].indices.push(index);
      return acc;
    }, {} as Record<number, PuzzlePiece & { count: number, indices: number[] }>)
  ).sort((a, b) => a.id - b.id);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center p-6 select-none font-sans">
      <style>
        {`
          @keyframes popIn {
            0% { transform: scale(0.85); opacity: 0.5; }
            100% { transform: scale(1); opacity: 1; }
          }
          .animate-pop-in {
            animation: popIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }
        `}
      </style>
      
      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
          遊戲拼圖系統模擬
        </h1>
        <div className="text-xs text-slate-400 bg-slate-950 px-4 py-1.5 rounded-full border border-slate-800 tracking-wider">
          B14705019 期末專案
        </div>
      </header>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <div className="lg:col-span-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800 shadow-xl min-h-[550px] flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-sky-400 mb-4 pb-2 border-b border-slate-800 tracking-tight">📊 盤面統計</h2>
            
            <div className="mb-4">
              <h3 className="text-[11px] font-bold text-slate-500 tracking-widest uppercase mb-2">系統模式</h3>
              <div className="grid grid-cols-2 gap-2">
                <button disabled={solving} onClick={() => { setMode('user'); setMessage('👤 已切換至使用者模式'); }} className={getTabButtonStyle(mode === 'user')}>使用者模式</button>
                <button disabled={solving} onClick={() => {
                  setMode('system');
                  if (wasmEngine) {
                    wasmEngine.reset_board();
                    syncFromEngine();
                  }
                  setMessage('🤖 已切換至系統模式，請選取拼圖清單');
                }} className={getTabButtonStyle(mode === 'system')}>系統模式</button>
              </div>
            </div>

            <div className="mb-4 p-3 bg-slate-900 rounded-lg border border-slate-800/60 text-xs space-y-2 shadow-inner">
              <div className="flex justify-between"><span className="text-slate-400">總格子數:</span><span className="font-bold text-slate-200">{boardSize * boardSize} 格</span></div>
              <div className="flex justify-between"><span className="text-purple-400">障礙:</span><span className="font-bold text-purple-400">{boardState.filter(v => v === -1).length} 格</span></div>
              <div className="flex justify-between"><span className="text-emerald-400">已鋪格子:</span><span className="font-bold text-emerald-400">{boardState.filter(v => v > 0).length} 格</span></div>
              <div className="flex justify-between"><span className="text-amber-400">當前覆蓋率:</span><span className="font-bold text-amber-400">
                {(() => {
                  const total = boardSize * boardSize;
                  const obs = boardState.filter(v => v === -1).length;
                  const placed = boardState.filter(v => v > 0).length;
                  const usable = total - obs;
                  return usable > 0 ? `${((placed / usable) * 100).toFixed(1)}%` : '0.0%';
                })()}
              </span></div>
            </div>

            {mode === 'system' && (
              <div className="mb-4 bg-slate-900 p-3 rounded-lg border border-slate-800 shadow-inner">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-slate-400 font-bold tracking-wide">⏱️ 演算時間上限</span>
                  <span className="text-purple-400 font-extrabold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">{calcTimeLimit} 秒</span>
                </div>
                <input 
                  type="range" min="1" max="15" 
                  value={calcTimeLimit} 
                  disabled={solving}
                  onChange={(e) => setCalcTimeLimit(parseInt(e.target.value, 10))} 
                  className="w-full accent-purple-500 h-1.5 cursor-pointer" 
                />
                <button 
                  onClick={handleSolveWithAnimation} 
                  disabled={solving}
                  className="mt-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 disabled:opacity-50 text-white text-xs font-bold shadow-lg transition-all w-full">
                  開始計算並展示動畫
                </button>
              </div>
            )}
          </div>

          <div className="flex-grow overflow-hidden flex flex-col mt-2 min-h-[140px]">
            {mode === 'user' ? (
              <>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">📥 使用者已放入：</h3>
                <ul className="space-y-1 overflow-y-auto text-xs pr-1 flex-grow max-h-[140px]">
                  {ALL_PIECES.filter(p => (placedCounts[p.id] || 0) > 0).length === 0 ? (
                    <li className="text-[10px] text-slate-600 text-center py-4 italic">棋盤目前為空</li>
                  ) : (
                    ALL_PIECES.filter(p => (placedCounts[p.id] || 0) > 0).map(p => (
                      <li key={p.id} className="flex justify-between p-2 rounded-md bg-slate-900 border border-slate-800/80 shadow-sm animate-pop-in">
                        <span className="text-slate-300 font-medium truncate w-3/4">{p.name}</span>
                        <span className="text-emerald-400 font-black">{placedCounts[p.id]} 個</span>
                      </li>
                    ))
                  )}
                </ul>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center mb-1.5">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">📋 系統待求解池：</h3>
                  {solverPieces.length > 0 && (
                    <button onClick={() => setSolverPieces([])} className="text-[10px] text-rose-400 hover:underline">清空</button>
                  )}
                </div>
                
                {/* ✅ 套用使用者模式的分組呈現方式，並包含移除單一方塊功能 */}
                <ul className="space-y-1 overflow-y-auto text-xs pr-1 flex-grow max-h-[140px]">
                  {groupedSolverPieces.length === 0 ? (
                    <li className="text-[10px] text-slate-600 text-center py-4 italic">點擊右側方塊加入清單</li>
                  ) : (
                    groupedSolverPieces.map(p => (
                      <li key={p.id} className="flex justify-between items-center p-2 rounded-md bg-slate-900 border border-slate-800/80 shadow-sm animate-pop-in">
                        <span className="text-slate-300 font-medium truncate w-3/4">{p.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-purple-400 font-black">{p.count} 個</span>
                          <button 
                            onClick={() => {
                              const targetIdx = p.indices[p.indices.length - 1];
                              setSolverPieces(prev => prev.filter((_, i) => i !== targetIdx));
                            }} 
                            className="text-rose-400 hover:text-rose-300 font-bold ml-1 px-1"
                          >✕</button>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </>
            )}
          </div>

          <div className="mt-4 p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1.5 leading-relaxed shadow-inner">
            <h4 className="font-bold text-sky-400 text-xs mb-1 flex items-center gap-1">📖 系統使用說明</h4>
            <p>• <span className="text-slate-200 font-medium">使用者模式：</span>從右側選取拼圖，可在中央棋盤上拖曳並落子；點擊盤面已放置的方塊可將其移除。</p>
            <p>• <span className="text-slate-200 font-medium">系統模式：</span>點擊右側方塊將其加入待求解清單，設定時間上限後，點擊「開始計算並展示動畫」，核心將透過DLX演算法計算最佳率。</p>
            <p>• <span className="text-slate-200 font-medium">障礙模式：</span>啟用後，不分模式皆可在棋盤上任意點擊放置/清除障礙物。</p>
            <p>• <span className="text-slate-200 font-medium">方塊調整：</span>選取方塊後，可點擊右側上方的旋轉與翻轉按鈕來改變形狀。</p>
          </div>

        </div>

        <div className="lg:col-span-5 flex flex-col items-center relative z-20">
          <div className="w-full mb-3 p-3 bg-slate-950/50 rounded-xl border border-slate-800 shadow-md">
            <div className="flex justify-between items-center mb-1.5 text-xs text-slate-300">
              <span>調整棋盤大小:</span>
              <span className="text-emerald-400 font-extrabold bg-slate-900 px-2 py-0.5 rounded border border-slate-700">{boardSize}×{boardSize}</span>
            </div>
            <input type="range" min="2" max="10" value={boardSize} disabled={solving} onChange={(e) => setBoardSize(parseInt(e.target.value, 10))} className="w-full accent-emerald-500 h-1.5 cursor-pointer" />
          </div>

          <div className="w-full flex gap-2 mb-3">
            <button disabled={solving} onClick={handleUndo} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-xs font-bold border border-slate-700 transition-colors">↩️ 復原</button>
            <button disabled={solving} onClick={handleRedo} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-xs font-bold border border-slate-700 transition-colors">重做 ↪️</button>
            
            <button disabled={solving} onClick={() => { setIsObstacleMode(!isObstacleMode); setMessage(isObstacleMode ? "關閉障礙物模式" : "🕳️ 已開啟障礙物模式，點擊棋盤放置障礙"); }} className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors disabled:opacity-50 ${isObstacleMode ? 'bg-purple-500/20 border-purple-400 text-purple-300' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'}`}>
              🕳️ 障礙: {isObstacleMode ? '開' : '關'}
            </button>
            {mode === 'user' && (
              <button disabled={solving} onClick={handleHint} className="flex-1 py-2 bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/50 disabled:opacity-50 rounded-lg text-xs font-bold transition-colors shadow-[0_0_10px_rgba(245,158,11,0.25)]">
                💡 提示
              </button>
            )}
          </div>

          <div className="text-xs font-bold text-amber-300 mb-3 bg-slate-950 border-2 border-slate-700 px-4 py-2 rounded-xl w-full text-center h-12 flex items-center justify-center shadow-lg tracking-wide">
            {solving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-amber-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                系統正在搜尋或展示最佳解，請稍候...
              </span>
            ) : message}
          </div>

          <div className="grid gap-1 p-3 bg-slate-950 rounded-2xl shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] border border-slate-800 w-full aspect-square" style={{ gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))` }}>
            {Array.from({ length: boardSize * boardSize }).map((_, index) => {
              const x = index % boardSize, y = Math.floor(index / boardSize);
              const cellValue = boardState[index] || 0;
              let isGhost = false, ghostValid = true;

              if (draggingPiece && draggingPiece.shape && hoverCell !== null && !isObstacleMode && !solving) {
                const hoverX = hoverCell % boardSize, hoverY = Math.floor(hoverCell / boardSize);
                for (let i = 0; i < draggingPiece.shape.length; i += 2) {
                  const ghostX = hoverX + draggingPiece.shape[i], ghostY = hoverY + draggingPiece.shape[i + 1];
                  if (ghostX < 0 || ghostX >= boardSize || ghostY < 0 || ghostY >= boardSize) {
                    isGhost = true; ghostValid = false; continue;
                  }
                  if (ghostY * boardSize + ghostX === index) {
                    isGhost = true; ghostValid = canPlacePiece(draggingPiece, hoverX, hoverY);
                  }
                }
              }

              const assignedColor = cellColors[index];
              let cellStyle = 'bg-slate-800 hover:bg-slate-700 border-slate-900/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)] transition-all duration-150 transform';
              let cellContent = null;

              if (cellValue === -1) {
                  cellStyle = 'bg-black border-slate-800 shadow-[inset_0_0_20px_rgba(0,0,0,1)] z-10 flex items-center justify-center opacity-90 animate-pop-in';
                  cellContent = <span className="text-xl drop-shadow-[0_0_5px_rgba(139,92,246,0.6)]">🕳️</span>;
              } else if (cellValue > 0) {
                  cellStyle += ` ${assignedColor} z-10 animate-pop-in scale-100`;
                  if (animatedCells.includes(index)) {
                      cellStyle += ' shadow-[0_0_15px_rgba(255,255,255,0.4)] z-30 scale-105';
                  }
              } else if (isGhost) {
                  cellStyle = ghostValid 
                    ? 'bg-emerald-500/30 border-2 border-dashed border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.45)] z-20 animate-pulse' 
                    : 'bg-rose-500/30 border-2 border-dashed border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.45)] z-20';
              }

              return (
                <div
                  key={index}
                  onDragOver={(e) => { 
                    if (!isObstacleMode && !solving) { e.preventDefault(); setHoverCell(index); }
                  }}
                  onDrop={(e) => { 
                    if (!isObstacleMode && !solving) {
                      e.preventDefault(); 
                      if (draggingPiece) placePieceAt(x, y); 
                      setDraggingPiece(null); 
                      setHoverCell(null); 
                    }
                  }}
                  onClick={() => handleCellClick(index)}
                  className={`aspect-square rounded border pointer-events-auto cursor-pointer ${cellStyle} ${solving ? 'cursor-default' : ''}`}
                >
                  {cellContent}
                </div>
              );
            })}
          </div>

          <button disabled={solving} onClick={() => {
            if (wasmEngine) {
              wasmEngine.reset_board();
              syncFromEngine();
              setMessage('🧹 棋盤已重設清空。');
            }
          }} className="mt-4 px-6 py-2 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-700 disabled:opacity-50 rounded-lg text-xs font-semibold shadow-lg hover:shadow-rose-600/30 transition-all active:scale-95">
            清空棋盤
          </button>
        </div>

        <div className="lg:col-span-4 bg-slate-950/60 p-4 rounded-xl border border-sky-400/30 shadow-2xl min-h-[400px]">
          <h2 className="text-base font-bold text-sky-400 mb-1 tracking-tight">🧩 選擇拼圖塊</h2>
          <p className="text-xs text-slate-500 mb-3 tracking-wide">
            {mode === 'user' ? '拖曳下方方塊即可落子' : '點擊下方方塊加入左下角待解清單'}
          </p>
          
          <div className="grid grid-cols-2 gap-2.5 mb-5 p-2.5 bg-slate-900 rounded-xl border border-slate-800">
            <button disabled={solving} onClick={rotateSelectedPiece} className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-950 hover:bg-slate-800 disabled:opacity-50 border-2 border-slate-700 hover:border-sky-500 rounded-lg text-xs font-semibold text-sky-300 transition-all shadow-md active:scale-95 active:bg-slate-700 group">
              <span className="text-base group-hover:scale-110 transition-transform">🔄</span>順時針旋轉
            </button>
            <button disabled={solving} onClick={flipSelectedPiece} className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-950 hover:bg-slate-800 disabled:opacity-50 border-2 border-slate-700 hover:border-amber-500 rounded-lg text-xs font-semibold text-amber-300 transition-all shadow-md active:scale-95 active:bg-slate-700 group">
              <span className="text-base group-hover:scale-110 transition-transform">↕️</span>左右鏡像翻轉
            </button>
          </div>

          <div className="space-y-4 max-h-[440px] overflow-y-auto pr-1 text-slate-300">
            {[1, 2, 3, 4, 5].map(size => {
              const piecesInGroup = ALL_PIECES.filter(p => p.size === size);
              if (piecesInGroup.length === 0) return null;

              return (
                <div key={size} className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 shadow-md">
                  <span className="text-[11px] font-bold text-slate-500 block mb-2 tracking-widest uppercase">{size} 格系列</span>
                  <div className="grid grid-cols-2 gap-3">
                    {piecesInGroup.map(piece => {
                      const isSelected = currentSelectedTransform.id === piece.id;
                      const pieceToDisplay = isSelected ? currentSelectedTransform : piece;
                      const pieceColorClass = PREVIEW_COLORS[piece.id] || 'bg-amber-500';

                      return (
                        <button
                          key={piece.id}
                          // ✅ 關鍵修改：draggable 變數現在會檢查模式，只有在使用者模式下才允許拖曳
                          draggable={mode === 'user' && !isObstacleMode && !solving}
                          onDragStart={(e) => {
                            // 防止誤觸檢查
                            if (mode !== 'user' || isObstacleMode || solving) {
                              e.preventDefault(); return;
                            }
                            const img = new Image();
                            img.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
                            e.dataTransfer.setDragImage(img, 0, 0);
                            const selectedPiece = isSelected ? currentSelectedTransform : piece;
                            setDraggingPiece(selectedPiece);
                            setCurrentSelectedTransform(selectedPiece);
                          }}
                          onDrag={(e) => {
                            if (e.clientX !== 0 || e.clientY !== 0) {
                              setMousePos({ x: e.clientX, y: e.clientY });
                            }
                          }}
                          onDragEnd={() => { setDraggingPiece(null); }}
                          onClick={() => {
                            if (solving) return;
                            if (mode === 'system') {
                              const uniqueSolverId = piece.id * 100 + solverPieces.length;
                              const pieceToAdd = { ...piece, solverId: uniqueSolverId };
                              setSolverPieces(prev => [...prev, pieceToAdd]);
                              setMessage(`➕ 已將 [${pieceToAdd.name}] 加入求解清單`);
                              return;
                            }
                            setCurrentSelectedTransform(piece);
                          }}
                          className={`p-2 rounded-xl border-2 transition-all duration-150 ${draggingPiece?.id === piece.id ? 'opacity-40 scale-95' : ''} ${isSelected && mode === 'user' ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-bold shadow-[0_0_15px_rgba(245,158,11,0.25)]' : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400 shadow-inner'}`}
                        >
                          <div className="flex flex-col gap-0.5 items-center justify-center flex-grow mb-2.5">
                            {pieceToDisplay.grid.map((row, rIdx) => (
                              <div key={rIdx} className="flex gap-0.5">
                                {row.map((cell, cIdx) => (
                                  <div key={cIdx} className={`w-2.5 h-2.5 rounded-sm transition-colors duration-150 ${cell === 1 ? pieceColorClass : 'bg-slate-700 group-hover:bg-slate-600'}`} />
                                ))}
                              </div>
                            ))}
                          </div>
                          <span className="text-[10px] text-center font-medium leading-tight truncate w-full tracking-wide pointer-events-none">{pieceToDisplay.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {draggingPiece && (
        <div className="fixed pointer-events-none z-[9999] transition-none" style={{ left: mousePos.x + 16, top: mousePos.y + 16 }}>
          <div className="flex flex-col gap-0.5">
            {draggingPiece.grid.map((row, rIdx) => (
              <div key={rIdx} className="flex gap-0.5">
                {row.map((cell, cIdx) => (
                  <div key={cIdx} className={`w-10 h-10 rounded-sm transition-all ${cell ? 'border-2 border-dashed border-emerald-400 bg-emerald-400/30 backdrop-blur-[2px] animate-pulse' : 'border-transparent bg-transparent'}`} />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}