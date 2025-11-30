export enum Player {
  None = 0,
  Black = 1,
  White = 2,
}

export enum GameStatus {
  Idle = 'idle',
  Playing = 'playing',
  Finished = 'finished',
}

export enum Difficulty {
  Novice = 'novice',
  Easy = 'easy',
  Medium = 'medium',
  Hard = 'hard',
  Expert = 'expert',
}

export enum Language {
  EN = 'en',
  CN = 'cn',
}

export interface BoardState {
  grid: Player[][];
  lastMove: { row: number; col: number } | null;
  winner: Player | null;
}

export interface MoveResult {
  row: number;
  col: number;
  evaluation: number; // 0-100, where 50 is neutral, >50 favors current player
  analysis: string;
}

export interface GameConfig {
  playerColor: Player.Black | Player.White; // Human plays Black or White
  difficulty: Difficulty;
  language: Language;
}