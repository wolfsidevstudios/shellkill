export type Vector3Array = [number, number, number];

export interface PlayerState {
  id: string;
  position: Vector3Array;
  rotation: number;
  health: number;
  isDead: boolean;
  score: number;
  ammo: number;
}

export interface BotConfig {
  id: string;
  name: string;
  startPos: Vector3Array;
  color: string;
}

export enum GameStatus {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}