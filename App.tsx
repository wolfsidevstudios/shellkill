import React, { Suspense } from 'react';
import { GameScene } from './components/GameScene';
import { MenuScene } from './components/MenuScene';
import { NetworkManager } from './components/NetworkManager';
import { UI } from './components/UI';
import { useStore } from './store';
import { GameStatus } from './types';

const App: React.FC = () => {
  const status = useStore((state) => state.status);

  return (
    <div className="w-full h-full relative bg-gray-900 overflow-hidden font-sans select-none">
      <NetworkManager />
      <UI />
      
      <Suspense fallback={
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white z-50">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
                <div className="font-bold tracking-widest animate-pulse">CRACKING EGGS...</div>
            </div>
        </div>
      }>
        {status === GameStatus.MENU || status === GameStatus.MULTIPLAYER_LOBBY ? (
           <div className="absolute inset-0 z-0">
               <MenuScene />
           </div>
        ) : (
            <GameScene />
        )}
      </Suspense>
    </div>
  );
};

export default App;