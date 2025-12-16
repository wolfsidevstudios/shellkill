import { create } from 'zustand';
import { GameStatus, GameMode, RemotePlayerData } from './types';

interface GameStore {
  status: GameStatus;
  gameMode: GameMode;
  score: number;
  health: number;
  ammo: number;
  maxAmmo: number;
  isReloading: boolean;
  hitMarkerOpacity: number;
  
  // Multiplayer State
  roomId: string | null;
  isHost: boolean;
  peers: Record<string, RemotePlayerData>;
  
  // Actions
  setStatus: (status: GameStatus) => void;
  setGameMode: (mode: GameMode) => void;
  addScore: (points: number) => void;
  setHealth: (hp: number) => void;
  takeDamage: (amount: number) => void;
  shootAmmo: () => boolean;
  reload: () => void;
  resetGame: () => void;
  triggerHitMarker: () => void;
  
  // Network Actions
  setRoomId: (id: string | null) => void;
  setIsHost: (isHost: boolean) => void;
  updatePeer: (id: string, data: Partial<RemotePlayerData>) => void;
  removePeer: (id: string) => void;
}

export const useStore = create<GameStore>((set, get) => ({
  status: GameStatus.MENU,
  gameMode: 'SOLO',
  score: 0,
  health: 100,
  ammo: 30,
  maxAmmo: 30,
  isReloading: false,
  hitMarkerOpacity: 0,
  
  roomId: null,
  isHost: false,
  peers: {},

  setStatus: (status) => set({ status }),
  setGameMode: (gameMode) => set({ gameMode }),
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
  triggerHitMarker: () => {
    set({ hitMarkerOpacity: 1 });
    setTimeout(() => {
      set({ hitMarkerOpacity: 0 });
    }, 100);
  },
  
  setRoomId: (roomId) => set({ roomId }),
  setIsHost: (isHost) => set({ isHost }),
  updatePeer: (id, data) => set((state) => ({
    peers: {
      ...state.peers,
      [id]: { ...(state.peers[id] || { 
          id, 
          position: [0, 10, 0], 
          rotation: [0, 0, 0], 
          health: 100, 
          isDead: false 
      }), ...data }
    }
  })),
  removePeer: (id) => set((state) => {
    const newPeers = { ...state.peers };
    delete newPeers[id];
    return { peers: newPeers };
  }),

  resetGame: () => set({
    status: GameStatus.PLAYING,
    score: 0,
    health: 100,
    ammo: 30,
    isReloading: false,
    hitMarkerOpacity: 0
  })
}));