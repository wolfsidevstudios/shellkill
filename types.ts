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
  GAME_OVER = 'GAME_OVER',
  MULTIPLAYER_LOBBY = 'MULTIPLAYER_LOBBY',
  CONNECTING = 'CONNECTING'
}

export type GameMode = 'SOLO' | 'MULTIPLAYER';

export interface RemotePlayerData {
  id: string;
  position: Vector3Array;
  rotation: [number, number, number]; // Euler
  health: number;
  isDead: boolean;
}