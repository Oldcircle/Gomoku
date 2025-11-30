import React from 'react';
import { BOARD_SIZE } from '../constants';
import { Player } from '../types';

interface BoardProps {
  grid: Player[][];
  lastMove: { row: number; col: number } | null;
  onCellClick: (row: number, col: number) => void;
  disabled: boolean;
}

const Board: React.FC<BoardProps> = ({ grid, lastMove, onCellClick, disabled }) => {
  // Determine star points based on board size
  // 15x15 uses [3, 7, 11]
  // 19x19 uses [3, 9, 15]
  const starPoints = BOARD_SIZE === 19 ? [3, 9, 15] : [3, 7, 11];

  return (
    <div className="relative p-4 rounded-lg shadow-2xl bg-[#5d4037] border-4 border-[#3e2723]">
      {/* The Board Wood Texture Container */}
      <div 
        className="wood-texture relative shadow-inner rounded w-[320px] h-[320px] sm:w-[450px] sm:h-[450px] md:w-[600px] md:h-[600px] mx-auto grid"
        style={{
          gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
        }}
      >
        {/* Grid Lines Rendering - Absolute Overlay to avoid layout shifts */}
        <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: BOARD_SIZE }).map((_, i) => (
                <React.Fragment key={i}>
                    {/* Horizontal Line */}
                    <div 
                        className="absolute bg-neutral-800/80 h-[1px] w-full transform -translate-y-1/2"
                        style={{ top: `${(i / BOARD_SIZE) * 100 + (100 / BOARD_SIZE / 2)}%`, left: 0 }} 
                    />
                    {/* Vertical Line */}
                    <div 
                        className="absolute bg-neutral-800/80 w-[1px] h-full transform -translate-x-1/2"
                        style={{ left: `${(i / BOARD_SIZE) * 100 + (100 / BOARD_SIZE / 2)}%`, top: 0 }} 
                    />
                </React.Fragment>
            ))}
             {/* Star points (Hoshi) */}
             {starPoints.map(r => starPoints.map(c => (
                 <div 
                    key={`${r}-${c}`}
                    className="absolute w-2 h-2 bg-neutral-900 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-sm"
                    style={{ 
                        top: `${(r / BOARD_SIZE) * 100 + (100 / BOARD_SIZE / 2)}%`, 
                        left: `${(c / BOARD_SIZE) * 100 + (100 / BOARD_SIZE / 2)}%` 
                    }}
                 />
             )))}
        </div>

        {/* Cells and Stones */}
        {grid.map((row, r) =>
          row.map((cell, c) => {
            const isLastMove = lastMove?.row === r && lastMove?.col === c;
            
            return (
              <div
                key={`${r}-${c}`}
                onClick={() => !disabled && cell === Player.None && onCellClick(r, c)}
                className={`
                  relative z-10 flex items-center justify-center cursor-pointer
                  hover:bg-black/5 transition-colors duration-200
                `}
              >
                {cell !== Player.None && (
                  <div
                    className={`
                      w-[85%] h-[85%] rounded-full transition-all duration-300 transform scale-100
                      ${cell === Player.Black ? 'stone-black' : 'stone-white'}
                      ${isLastMove ? 'ring-2 ring-red-500 ring-offset-1 ring-offset-transparent' : ''}
                    `}
                  >
                    {/* Highlight Dot for Last Move */}
                    {isLastMove && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className={`w-2 h-2 rounded-full ${cell === Player.Black ? 'bg-red-500' : 'bg-red-600'} shadow-sm animate-pulse`}></div>
                        </div>
                    )}
                  </div>
                )}
                {/* Phantom stone on hover for UX */}
                {!disabled && cell === Player.None && (
                    <div className="w-[60%] h-[60%] rounded-full bg-black/20 opacity-0 hover:opacity-100 absolute pointer-events-none transition-opacity"></div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Board;