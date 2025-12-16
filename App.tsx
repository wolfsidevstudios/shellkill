import React, { Suspense } from 'react';
import { GameScene } from './components/GameScene';
import { UI } from './components/UI';
import { useStore } from './store';
import { GameStatus } from './types';

const App: React.FC = () => {
  const status = useStore((state) => state.status);

  return (
    <div className="w-full h-full relative bg-blue-300 overflow-hidden">
      <UI />
      {status !== GameStatus.MENU && (
        <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center text-white font-bold bg-blue-500">Loading Eggs...</div>}>
            <GameScene />
        </Suspense>
      )}
      {status === GameStatus.MENU && (
         /* Render a blurred background scene or image if desired, but for performance we just show the UI overlay over the color bg */
         <div className="w-full h-full bg-[url('https://picsum.photos/1920/1080?blur=5')] bg-cover bg-center" />
      )}
    </div>
  );
};

export default App;