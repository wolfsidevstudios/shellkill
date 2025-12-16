import React from 'react';
import { useStore } from '../store';
import { GameStatus } from '../types';

export const UI: React.FC = () => {
  const { 
    status, 
    health, 
    ammo, 
    maxAmmo, 
    score, 
    setStatus, 
    resetGame,
    isReloading
  } = useStore();

  if (status === GameStatus.MENU) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-yellow-100 bg-opacity-90 z-50">
        <h1 className="text-6xl font-black text-orange-500 mb-4 drop-shadow-md">EGG COMBAT</h1>
        <h2 className="text-2xl font-bold text-gray-700 mb-8">SHELL SCRAMBLE</h2>
        <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col gap-4 w-96 text-center border-4 border-orange-200">
          <p className="text-gray-600 mb-4">WASD to Move • SPACE to Jump • CLICK to Shoot • R to Reload</p>
          <button 
            onClick={() => {
                setStatus(GameStatus.PLAYING);
                resetGame();
            }}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-xl text-xl transition-transform hover:scale-105"
          >
            PLAY NOW
          </button>
        </div>
      </div>
    );
  }

  if (status === GameStatus.GAME_OVER) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900 bg-opacity-90 z-50 text-white">
        <h1 className="text-6xl font-black mb-4">CRACKED!</h1>
        <p className="text-2xl mb-8">You were scrambled.</p>
        <p className="text-xl mb-8">Final Score: {score}</p>
        <button 
          onClick={() => {
              setStatus(GameStatus.PLAYING);
              resetGame();
          }}
          className="bg-white text-red-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-full text-xl"
        >
          RESPAWN
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* HUD - Top Left */}
      <div className="absolute top-4 left-4 flex gap-4">
        <div className="bg-black bg-opacity-50 p-3 rounded-lg text-white font-mono">
            <div className="text-xs text-gray-300">SCORE</div>
            <div className="text-2xl font-bold text-yellow-400">{score}</div>
        </div>
      </div>

      {/* Crosshair (via CSS in index.html, but strictly requested via React here if needed, keeping CSS approach for performance center div) */}
      <div id="crosshair">
        <div className="crosshair-line crosshair-h"></div>
        <div className="crosshair-line crosshair-v"></div>
      </div>

      {/* HUD - Bottom */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-8 items-end">
        {/* Health */}
        <div className="flex flex-col items-center">
            <div className="w-64 h-8 bg-gray-800 rounded-full border-2 border-white overflow-hidden relative">
                <div 
                    className="h-full bg-green-500 transition-all duration-300" 
                    style={{ width: `${health}%`, backgroundColor: health < 30 ? '#ef4444' : '#22c55e' }}
                />
                <div className="absolute inset-0 flex items-center justify-center font-bold text-white text-sm shadow-black drop-shadow-md">
                    {health} HP
                </div>
            </div>
        </div>

        {/* Ammo */}
        <div className="flex flex-col items-center">
             <div className="text-6xl font-black text-white drop-shadow-lg italic font-mono" style={{ opacity: isReloading ? 0.5 : 1 }}>
                {isReloading ? 'RELOADING' : `${ammo} / ${maxAmmo}`}
             </div>
             <div className="text-sm text-gray-200 font-bold bg-black bg-opacity-40 px-2 rounded">AMMO</div>
        </div>
      </div>
      
      {/* Damage Overlay */}
      {health < 30 && (
        <div className="absolute inset-0 border-[20px] border-red-500 opacity-30 animate-pulse pointer-events-none"></div>
      )}
    </div>
  );
};