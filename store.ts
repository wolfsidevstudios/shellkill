import { create } from 'zustand';
import { GameStatus } from './types';

interface GameStore {
  status: GameStatus;
  score: number;
  health: number;
  ammo: number;
  maxAmmo: number;
  isReloading: boolean;
  
  // Actions
  setStatus: (status: GameStatus) => void;
  addScore: (points: number) => void;
  setHealth: (hp: number) => void;
  takeDamage: (amount: number) => void;
  shootAmmo: () => boolean; // returns true if shot fired
  reload: () => void;
  resetGame: () => void;
}

export const useStore = create<GameStore>((set, get) => ({
  status: GameStatus.MENU,
  score: 0,
  health: 100,
  ammo: 30,
  maxAmmo: 30,
  isReloading: false,

  setStatus: (status) => set({ status }),
  addScore: (points) => set((state) => ({ score: state.score + points })),
  setHealth: (health) => set({ health }),
  takeDamage: (amount) => {
    const { health, status } = get();
    if (status !== GameStatus.PLAYING) return;
    
    const newHealth = Math.max(0, health - amount);
    set({ health: newHealth });
    
    if (newHealth <= 0) {
      set({ status: GameStatus.GAME_OVER });
    }
  },
  shootAmmo: () => {
    const { ammo, isReloading } = get();
    if (ammo > 0 && !isReloading) {
      set({ ammo: ammo - 1 });
      return true;
    }
    return false;
  },
  reload: () => {
    const { isReloading } = get();
    if (isReloading) return;
    set({ isReloading: true });
    setTimeout(() => {
      set({ ammo: get().maxAmmo, isReloading: false });
    }, 1500);
  },
  resetGame: () => set({
    status: GameStatus.PLAYING,
    score: 0,
    health: 100,
    ammo: 30,
    isReloading: false
  })
}));