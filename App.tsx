import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import Board from './components/Board';
import GameControls from './components/GameControls';
import AdvantageMonitor from './components/AdvantageMonitor';
import { BoardState, Difficulty, GameConfig, GameStatus, Language, Player } from './types';
import { BOARD_SIZE, INITIAL_GRID, TRANSLATIONS } from './constants';
import { checkWin, isBoardFull, getAIMove } from './services/gameEngine';

const App: React.FC = () => {
  // Game State
  const [grid, setGrid] = useState<number[][]>(INITIAL_GRID);
  const [status, setStatus] = useState<GameStatus>(GameStatus.Idle);
  const [currentPlayer, setCurrentPlayer] = useState<Player>(Player.Black);
  const [lastMove, setLastMove] = useState<{ row: number; col: number } | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);
  const [history, setHistory] = useState<Array<{ row: number; col: number; player: Player }>>([]);
  
  // Evaluation State
  const [evaluation, setEvaluation] = useState<number>(50); // 50 is even
  const [analysis, setAnalysis] = useState<string>("");

  // Config
  const [config, setConfig] = useState<GameConfig>({
    playerColor: Player.Black,
    difficulty: Difficulty.Medium,
    language: Language.CN, // Default to Chinese style
  });

  const t = TRANSLATIONS[config.language];
  const isPlayerTurn = currentPlayer === config.playerColor;

  // Sound effects refs (using simple AudioContext or HTML5 Audio would be better, but keeping it simple/visual for now)
  
  // Logic to handle making a move
  const makeMove = useCallback((r: number, c: number, player: Player) => {
    setGrid(prev => {
      const newGrid = prev.map(row => [...row]);
      newGrid[r][c] = player;
      return newGrid;
    });
    setLastMove({ row: r, col: c });
    setHistory(prev => [...prev, { row: r, col: c, player }]);

    // Check Win
    // We need the *latest* grid, but React state is async. 
    // We can use the mutated local copy `newGrid` logic here effectively by just checking against what we know.
    // However, to be safe, we'll do it in a useEffect or immediately here using a temporary grid.
    const tempGrid = grid.map(row => [...row]);
    tempGrid[r][c] = player;

    if (checkWin(tempGrid, r, c, player)) {
      setWinner(player);
      setStatus(GameStatus.Finished);
      // Generate final analysis based on winner
      if (player === config.playerColor) {
         setAnalysis(config.language === Language.CN ? "精彩的胜利！" : "Excellent victory!");
         setEvaluation(player === Player.Black ? 100 : 0);
      } else {
         setAnalysis(config.language === Language.CN ? "AI 找到了致胜一手。" : "AI found a winning path.");
         setEvaluation(player === Player.Black ? 100 : 0);
      }
      return true;
    } 
    
    if (isBoardFull(tempGrid)) {
      setWinner(null);
      setStatus(GameStatus.Finished);
      setAnalysis(config.language === Language.CN ? "平局。" : "Draw game.");
      setEvaluation(50);
      return true;
    }

    // Switch Turn
    setCurrentPlayer(player === Player.Black ? Player.White : Player.Black);
    return false;
  }, [grid, config.playerColor, config.language]);


  // AI Turn Effect
  useEffect(() => {
    if (status === GameStatus.Playing && !isPlayerTurn && !winner) {
      const playAI = async () => {
        const aiColor = config.playerColor === Player.Black ? Player.White : Player.Black;
        
        // Call local algorithm engine
        const result = await getAIMove(grid, config.difficulty, aiColor, config.language);
        
        // Update Monitor
        setEvaluation(result.evaluation);
        setAnalysis(result.analysis);

        if (result.row >= 0) {
            makeMove(result.row, result.col, aiColor);
        }
      };

      playAI();
    }
  }, [status, isPlayerTurn, winner, grid, config, makeMove]);

  const handleCellClick = (r: number, c: number) => {
    if (status !== GameStatus.Playing || !isPlayerTurn || grid[r][c] !== Player.None) return;
    
    // Player Move
    makeMove(r, c, config.playerColor);
  };

  const startNewGame = () => {
    setGrid(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0)));
    setStatus(GameStatus.Playing);
    setLastMove(null);
    setWinner(null);
    setCurrentPlayer(Player.Black); // Black always starts
    setEvaluation(50);
    setAnalysis(t.waiting);
    setHistory([]);
    
    // If player chose White, AI (Black) needs to move immediately via the useEffect
  };

  const undoLastMove = () => {
    setHistory(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setGrid(g => {
        const ng = g.map(row => [...row]);
        ng[last.row][last.col] = Player.None;
        return ng;
      });
      const newHist = prev.slice(0, -1);
      const prevLast = newHist[newHist.length - 1] || null;
      setLastMove(prevLast ? { row: prevLast.row, col: prevLast.col } : null);
      setWinner(null);
      setStatus(GameStatus.Playing);
      setCurrentPlayer(last.player);
      setEvaluation(50);
      setAnalysis(t.waiting);
      return newHist;
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8">
      
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-800 mb-2 drop-shadow-md">
          {t.title}
        </h1>
        <div className="flex items-center justify-center gap-2 text-stone-600 font-serif italic">
          <div className="h-[1px] w-12 bg-stone-400"></div>
          <span className="text-lg">Ink & Stone</span>
          <div className="h-[1px] w-12 bg-stone-400"></div>
        </div>
      </header>

      <main className="flex flex-col xl:flex-row gap-8 xl:gap-16 items-start justify-center w-full max-w-7xl">
        
        {/* Left Panel: Board & Status */}
        <div className="flex flex-col items-center gap-6 order-2 xl:order-1">
          {/* Status Badge */}
          <div className={`
            px-6 py-2 rounded-full font-serif font-bold text-lg shadow-sm border
            ${status === GameStatus.Finished 
              ? 'bg-red-100 text-red-800 border-red-200' 
              : isPlayerTurn 
                ? 'bg-green-100 text-green-800 border-green-200' 
                : 'bg-stone-200 text-stone-600 border-stone-300'}
          `}>
             {status === GameStatus.Finished 
                ? (winner ? `${winner === config.playerColor ? t.playerTurn.replace("Turn", "") : "AI"} ${t.winner}` : t.draw)
                : (isPlayerTurn ? t.playerTurn : t.aiTurn)
             }
          </div>

          <Board 
            grid={grid} 
            lastMove={lastMove} 
            onCellClick={handleCellClick}
            disabled={status !== GameStatus.Playing || !isPlayerTurn}
          />
          
          <AdvantageMonitor 
            evaluation={evaluation} 
            analysis={analysis} 
            lang={config.language} 
          />
        </div>

        {/* Right Panel: Controls */}
        <div className="order-1 xl:order-2 w-full max-w-sm">
        <GameControls 
          config={config} 
          onConfigChange={(newConf) => setConfig(p => ({ ...p, ...newConf }))}
          onNewGame={startNewGame}
          isPlaying={status === GameStatus.Playing}
          onUndo={undoLastMove}
          canUndo={history.length > 0}
        />
           
           {/* Decorative footer for sidebar */}
           <div className="mt-8 p-4 text-center opacity-60">
             <div className="text-4xl mb-2">🎍</div>
             <p className="text-xs font-serif text-stone-600">
               {config.language === Language.CN 
                 ? "静心思考，落子无悔" 
                 : "Think calmly, move with purpose"}
             </p>
           </div>
        </div>

      </main>
    </div>
  );
};

export default App;
