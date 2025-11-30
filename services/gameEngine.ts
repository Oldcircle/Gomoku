import { Player, MoveResult, Difficulty, Language } from "../types";
import { BOARD_SIZE } from "../constants";

// --- Game Engine Configuration ---

// Shape Scores (Heuristics)
// The engine prioritizes creating these shapes or blocking opponent from creating them.
const SCORES = {
  WIN: 1000000,       // 5 in a row
  LIVE_FOUR: 100000,  // 011110 (Guaranteed win next turn)
  DEAD_FOUR: 10000,   // 211110 or 011112 (Opponent must block)
  LIVE_THREE: 9000,   // 01110 (Threat to become Live Four)
  DEAD_THREE: 1000,   // 21110
  LIVE_TWO: 500,      // 0110
  DEAD_TWO: 100,      // 2110
  ONE: 10
};

// --- Pattern Matching Helpers ---

// We convert board lines to strings to use simple substring matching for patterns.
// 0 = empty, 1 = self, 2 = opponent (relative to the evaluator)
const PATTERNS = {
  WIN: ["11111"],
  LIVE_FOUR: ["011110"],
  DEAD_FOUR: [
    "211110", "011112", // Blocked one side
    "10111", "11011", "11101" // Gap fours
  ],
  LIVE_THREE: [
    "01110", // Standard Live 3
    "010110", "011010" // Split 3s that are very strong
  ],
  DEAD_THREE: [
    "211100", "001112", "210110", "011012", "211010", "010112"
  ],
  LIVE_TWO: ["001100", "011000", "000110", "01010"],
};

// --- Core Logic ---

// Get all relevant lines (rows, cols, diagonals) from the board
// This function constructs string representations of the board for pattern matching
const getBoardLines = (grid: Player[][], player: Player, opponent: Player): string[] => {
  const lines: string[] = [];
  const pStr = "1";
  const oStr = "2";
  const eStr = "0";

  const getChar = (val: number) => {
    if (val === player) return pStr;
    if (val === opponent) return oStr;
    return eStr;
  };

  // Horizontal
  for (let r = 0; r < BOARD_SIZE; r++) {
    let line = "";
    for (let c = 0; c < BOARD_SIZE; c++) line += getChar(grid[r][c]);
    lines.push(line);
  }

  // Vertical
  for (let c = 0; c < BOARD_SIZE; c++) {
    let line = "";
    for (let r = 0; r < BOARD_SIZE; r++) line += getChar(grid[r][c]);
    lines.push(line);
  }

  // Diagonal \
  for (let k = 0; k < BOARD_SIZE * 2; k++) {
    let line = "";
    for (let j = 0; j <= k; j++) {
      const i = k - j;
      if (i < BOARD_SIZE && j < BOARD_SIZE) {
        line += getChar(grid[i][j]);
      }
    }
    if (line.length >= 5) lines.push(line);
  }

  // Diagonal /
  for (let k = 0; k < BOARD_SIZE * 2; k++) {
    let line = "";
    for (let j = 0; j <= k; j++) {
      const i = k - j;
      const invJ = BOARD_SIZE - 1 - j;
      if (i < BOARD_SIZE && invJ >= 0) {
        line += getChar(grid[i][invJ]);
      }
    }
    if (line.length >= 5) lines.push(line);
  }

  return lines;
};

// Evaluate a single string line for patterns
const evaluateLineString = (line: string): number => {
  let score = 0;

  // Check patterns in descending order of value
  for (const p of PATTERNS.WIN) if (line.includes(p)) return SCORES.WIN;
  
  for (const p of PATTERNS.LIVE_FOUR) if (line.includes(p)) score += SCORES.LIVE_FOUR;
  for (const p of PATTERNS.DEAD_FOUR) if (line.includes(p)) score += SCORES.DEAD_FOUR;
  for (const p of PATTERNS.LIVE_THREE) if (line.includes(p)) score += SCORES.LIVE_THREE;
  for (const p of PATTERNS.DEAD_THREE) if (line.includes(p)) score += SCORES.DEAD_THREE;
  for (const p of PATTERNS.LIVE_TWO) if (line.includes(p)) score += SCORES.LIVE_TWO;

  return score;
};

// Evaluate point: Estimate the value of playing at (r,c) for 'player'
// This is used for heuristic sorting of moves
const evaluatePoint = (grid: Player[][], r: number, c: number, player: Player, opponent: Player): number => {
  let score = 0;
  
  // Directions: Horizontal, Vertical, Diag1, Diag2
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
  
  for (const [dr, dc] of directions) {
    // Construct local line (radius 4)
    let line = "";
    // Look back 4 steps to forward 4 steps
    for (let k = -4; k <= 4; k++) {
       const nr = r + dr * k;
       const nc = c + dc * k;
       if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) {
         line += "2"; // Treat border as opponent (blocker)
       } else if (nr === r && nc === c) {
         line += "1"; // The move itself
       } else if (grid[nr][nc] === player) {
         line += "1";
       } else if (grid[nr][nc] === opponent) {
         line += "2";
       } else {
         line += "0";
       }
    }
    score += evaluateLineString(line);
  }
  return score;
};

// Full Board Evaluation
const evaluateBoard = (grid: Player[][], player: Player, opponent: Player): number => {
  const lines = getBoardLines(grid, player, opponent);
  let totalScore = 0;

  for (const line of lines) {
    // My Score
    totalScore += evaluateLineString(line);
    
    // Opponent Score (Inverted)
    // We construct the inverse string where 1->2 and 2->1 to reuse evaluateLineString
    // Or simpler: pass logic to check '2' patterns.
    // For performance, we'll just swap logic visually:
    // We already have '1' as self in the line string.
    // We need to check if '2' forms patterns.
    
    // Convert line to opponent perspective: 1->2, 2->1
    const oppLine = line.replace(/1/g, "x").replace(/2/g, "1").replace(/x/g, "2");
    const oppScore = evaluateLineString(oppLine);
    
    // Defense Weight: It's often more important to block than to build, unless we have a kill.
    totalScore -= oppScore * 1.2; 
  }

  return totalScore;
};

export const checkWin = (grid: Player[][], lastRow: number, lastCol: number, player: Player): boolean => {
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (const [dr, dc] of directions) {
    let count = 1;
    for (let i = 1; i < 5; i++) {
      const r = lastRow + dr * i, c = lastCol + dc * i;
      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE || grid[r][c] !== player) break;
      count++;
    }
    for (let i = 1; i < 5; i++) {
      const r = lastRow - dr * i, c = lastCol - dc * i;
      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE || grid[r][c] !== player) break;
      count++;
    }
    if (count >= 5) return true;
  }
  return false;
};

export const isBoardFull = (grid: Player[][]): boolean => {
    return grid.every(row => row.every(cell => cell !== Player.None));
};

// --- Move Generation ---

const getCandidates = (grid: Player[][], player: Player, opponent: Player): {r: number, c: number, score: number}[] => {
  const candidates: {r: number, c: number, score: number}[] = [];
  const considered = new Set<string>();

  // Only consider cells within distance 2 of existing stones
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (grid[r][c] !== Player.None) {
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && grid[nr][nc] === Player.None) {
              const key = `${nr},${nc}`;
              if (!considered.has(key)) {
                considered.add(key);
                
                // Heuristic sort score:
                // Attack Score (What if I play here?) + Defense Score (What if opponent plays here?)
                const attack = evaluatePoint(grid, nr, nc, player, opponent);
                const defense = evaluatePoint(grid, nr, nc, opponent, player);
                
                candidates.push({ r: nr, c: nc, score: attack + defense });
              }
            }
          }
        }
      }
    }
  }

  // If empty board, return center
  if (candidates.length === 0) return [{ r: 9, c: 9, score: 0 }];

  // Sort descending by heuristic score
  return candidates.sort((a, b) => b.score - a.score);
};

// --- Minimax with Alpha-Beta ---

const minimax = (
  grid: Player[][],
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  player: Player,
  opponent: Player,
  startTime: number,
  timeLimit: number
): { score: number, move?: {r: number, c: number} } => {

  if (Date.now() - startTime > timeLimit) {
    return { score: evaluateBoard(grid, player, opponent) }; 
  }

  // Generate candidates
  const allCandidates = getCandidates(grid, player, opponent);
  
  // Pruning: Only look at top N moves to keep performance high
  // Dynamic branching factor based on depth could be added here
  const branchingFactor = depth > 2 ? 8 : 15;
  const candidates = allCandidates.slice(0, branchingFactor);

  if (candidates.length === 0 || depth === 0) {
    return { score: evaluateBoard(grid, player, opponent) };
  }

  if (maximizing) {
    let maxEval = -Infinity;
    let bestMove = candidates[0];
    
    for (const cand of candidates) {
      grid[cand.r][cand.c] = player;
      
      // Quick Win Check
      if (checkWin(grid, cand.r, cand.c, player)) {
        grid[cand.r][cand.c] = Player.None;
        return { score: SCORES.WIN, move: cand };
      }

      const evalResult = minimax(grid, depth - 1, alpha, beta, false, player, opponent, startTime, timeLimit);
      grid[cand.r][cand.c] = Player.None;

      if (evalResult.score > maxEval) {
        maxEval = evalResult.score;
        bestMove = cand;
      }
      alpha = Math.max(alpha, evalResult.score);
      if (beta <= alpha) break;
    }
    return { score: maxEval, move: bestMove };
  } else {
    let minEval = Infinity;
    let bestMove = candidates[0];

    for (const cand of candidates) {
      grid[cand.r][cand.c] = opponent;

      // Quick Loss Check
      if (checkWin(grid, cand.r, cand.c, opponent)) {
        grid[cand.r][cand.c] = Player.None;
        return { score: -SCORES.WIN, move: cand };
      }

      const evalResult = minimax(grid, depth - 1, alpha, beta, true, player, opponent, startTime, timeLimit);
      grid[cand.r][cand.c] = Player.None;

      if (evalResult.score < minEval) {
        minEval = evalResult.score;
        bestMove = cand;
      }
      beta = Math.min(beta, evalResult.score);
      if (beta <= alpha) break;
    }
    return { score: minEval, move: bestMove };
  }
};

// --- Analysis Translation ---

const getAnalysisText = (score: number, lang: Language, aiColor: Player): string => {
  const t = (cn: string, en: string) => (lang === Language.CN ? cn : en);
  const absScore = Math.abs(score);
  const isWinning = score > 0;

  if (absScore >= SCORES.WIN) return isWinning ? t("绝杀！无法阻挡。", "Checkmate! Unstoppable.") : t("哎呀，被绝杀了。", "Ouch, checkmate.");
  if (absScore >= SCORES.LIVE_FOUR) return isWinning ? t("我有四连，胜券在握。", "I have a Live Four. Victory is near.") : t("当心！你漏掉了四连。", "Warning! You have a Live Four.");
  if (absScore >= SCORES.DEAD_FOUR) return isWinning ? t("正在逼迫你防守。", "Forcing your defense.") : t("必须防守！我有冲四。", "Must defend! I have a threat.");
  if (absScore >= SCORES.LIVE_THREE) return isWinning ? t("活三成型，局势不错。", "Live Three formed. Good position.") : t("小心我的活三。", "Watch out for my Live Three.");
  if (absScore > SCORES.LIVE_TWO) return isWinning ? t("正在布局中。", "Developing position.") : t("双方势均力敌。", "Position is contested.");
  
  return t("局势胶着。", "Balanced game.");
};

// --- Main AI Entry Point ---

export const getAIMove = async (
  grid: number[][],
  difficulty: Difficulty,
  aiColor: Player,
  lang: Language = Language.EN
): Promise<MoveResult> => {
  const opponent = aiColor === Player.Black ? Player.White : Player.Black;
  
  // Difficulty Settings
  // Depth: How many moves ahead to look
  // Randomness: Probability of picking a sub-optimal move (to simulate human error)
  let depth = 2;
  let timeLimit = 500;
  let randomness = 0;

  switch (difficulty) {
    case Difficulty.Novice:
      depth = 1; // Pure heuristic
      randomness = 0.3;
      timeLimit = 200;
      break;
    case Difficulty.Easy:
      depth = 2; 
      randomness = 0.15;
      timeLimit = 500;
      break;
    case Difficulty.Medium:
      depth = 4; // Standard Minimax
      randomness = 0.05;
      timeLimit = 1000;
      break;
    case Difficulty.Hard:
      depth = 4; // Same depth, but wider search implicitly via time/less randomness
      randomness = 0;
      timeLimit = 1500;
      break;
    case Difficulty.Expert:
      depth = 6; // Deep search
      randomness = 0;
      timeLimit = 3000;
      break;
  }

  // Small UI delay
  await new Promise(resolve => setTimeout(resolve, 50));

  // Clone grid for safety
  const gridClone = grid.map(r => [...r]);

  // Run AI
  const result = minimax(
    gridClone, 
    depth, 
    -Infinity, 
    Infinity, 
    true, 
    aiColor, 
    opponent, 
    Date.now(), 
    timeLimit
  );

  // Apply randomness for lower difficulties
  if (Math.random() < randomness) {
    // Pick a random decent move instead of best
    const candidates = getCandidates(gridClone, aiColor, opponent).slice(0, 5);
    if (candidates.length > 0) {
       const randomMove = candidates[Math.floor(Math.random() * candidates.length)];
       result.move = randomMove;
       result.score = result.score * 0.8; // Reduce confidence
    }
  }

  // Calculate Advantage Percentage (0-100)
  // Win Score is 1,000,000. 
  // Let's map log scale to 0-100.
  const rawScore = result.score;
  const sign = Math.sign(rawScore);
  
  // Log10(1,000,000) = 6. 
  // Map 0 -> 50%
  // 6 -> 100%
  const logVal = Math.log10(Math.abs(rawScore) + 1);
  const normalized = Math.min(logVal / 6, 1); // 0 to 1
  
  let winProb = 50 + (sign * normalized * 50);
  
  // Invert if AI is White (Score is from AI perspective. +Score = AI Good. 
  // If AI is White, +Score means White Advantage.
  // The UI expects "Black Win Prob". 
  // So if AI (White) has +Score, Black Prob is 100 - X.
  
  let blackWinProb = 50;
  if (aiColor === Player.Black) {
      blackWinProb = winProb;
  } else {
      blackWinProb = 100 - winProb;
  }
  
  blackWinProb = Math.max(0, Math.min(100, blackWinProb));

  return {
    row: result.move?.r ?? -1,
    col: result.move?.c ?? -1,
    evaluation: blackWinProb,
    analysis: getAnalysisText(rawScore, lang, aiColor)
  };
};
