import React, { useEffect, useState } from 'react';
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
    setGameMode,
    setIsHost,
    setRoomId,
    roomId,
    resetGame,
    isReloading,
    hitMarkerOpacity
  } = useStore();

  const [displayHitMarker, setDisplayHitMarker] = useState(0);
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => {
    if (hitMarkerOpacity > 0) {
        setDisplayHitMarker(1);
        const timer = setTimeout(() => setDisplayHitMarker(0), 150);
        return () => clearTimeout(timer);
    }
  }, [hitMarkerOpacity]);

  // --- HOME / MENU SCREEN ---
  if (status === GameStatus.MENU) {
    return (
      <div className="absolute inset-0 flex flex-col items-start justify-center p-20 z-50 pointer-events-none">
        <div className="pointer-events-auto bg-white/10 backdrop-blur-md border border-white/20 p-12 rounded-3xl shadow-2xl max-w-lg animate-fade-in-up">
            <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 to-orange-600 mb-2 drop-shadow-sm italic transform -skew-x-6">
                EGG COMBAT
            </h1>
            <h2 className="text-3xl font-bold text-white mb-8 tracking-widest uppercase">Shell Scramble</h2>
            
            <div className="flex flex-col gap-4">
                <button 
                    onClick={() => {
                        setGameMode('SOLO');
                        setStatus(GameStatus.PLAYING);
                        resetGame();
                    }}
                    className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-black py-4 px-8 rounded-xl text-2xl shadow-lg transition-all transform hover:scale-105 hover:shadow-orange-500/50"
                >
                    PLAY SOLO
                </button>
                
                <button 
                    onClick={() => {
                        setStatus(GameStatus.MULTIPLAYER_LOBBY);
                    }}
                    className="bg-gray-800 hover:bg-gray-700 text-white font-black py-4 px-8 rounded-xl text-2xl shadow-lg transition-all transform hover:scale-105 border border-gray-600"
                >
                    MULTIPLAYER
                </button>
                
                <div className="flex gap-4">
                    <button className="flex-1 bg-gray-800/80 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg backdrop-blur-sm transition-colors border border-gray-600">
                        LOADOUT
                    </button>
                    <button className="flex-1 bg-gray-800/80 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg backdrop-blur-sm transition-colors border border-gray-600">
                        SETTINGS
                    </button>
                </div>
            </div>
            
            <div className="mt-8 text-white/70 text-sm font-mono border-t border-white/10 pt-4">
                <p>CONTROLS:</p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                    <span>WASD - Move</span>
                    <span>SPACE - Jump</span>
                    <span>LMB - Fire</span>
                    <span>R - Reload</span>
                </div>
            </div>
        </div>

        {/* Version / Credits */}
        <div className="absolute bottom-4 right-4 text-white/50 text-xs">
            v1.3.0 • EggEngine • P2P
        </div>
      </div>
    );
  }

  // --- MULTIPLAYER LOBBY ---
  if (status === GameStatus.MULTIPLAYER_LOBBY) {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-auto bg-black/40 backdrop-blur-sm">
         <div className="bg-gray-900 border border-white/20 p-8 rounded-3xl shadow-2xl max-w-2xl w-full text-white animate-fade-in-up">
            <h2 className="text-4xl font-black mb-8 text-center text-yellow-400">MULTIPLAYER</h2>
            
            <div className="grid grid-cols-2 gap-8">
                {/* HOST GAME */}
                <div className="bg-white/5 p-6 rounded-xl border border-white/10 flex flex-col items-center">
                    <h3 className="text-xl font-bold mb-4">HOST GAME</h3>
                    <p className="text-sm text-gray-400 text-center mb-6">Create a private server and invite friends via code.</p>
                    <button 
                        onClick={() => {
                            setGameMode('MULTIPLAYER');
                            setIsHost(true);
                            setRoomId(null); // Will be generated
                            resetGame();
                            // Status update handled by NetworkManager when open
                        }}
                        className="bg-green-600 hover:bg-green-500 w-full py-3 rounded-lg font-bold transition-colors"
                    >
                        CREATE MATCH
                    </button>
                </div>

                {/* JOIN GAME */}
                <div className="bg-white/5 p-6 rounded-xl border border-white/10 flex flex-col items-center">
                    <h3 className="text-xl font-bold mb-4">JOIN GAME</h3>
                    <p className="text-sm text-gray-400 text-center mb-6">Enter a room code to join an existing match.</p>
                    <input 
                        type="text" 
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        placeholder="ENTER CODE (e.g. A2B4)"
                        className="bg-black/50 border border-gray-600 rounded px-4 py-2 w-full text-center font-mono text-xl mb-4 focus:outline-none focus:border-yellow-400"
                        maxLength={4}
                    />
                    <button 
                         onClick={() => {
                            if (joinCode.length === 4) {
                                setGameMode('MULTIPLAYER');
                                setIsHost(false);
                                setRoomId(joinCode);
                                resetGame();
                                // Status update handled by NetworkManager
                            }
                        }}
                        disabled={joinCode.length !== 4}
                        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed w-full py-3 rounded-lg font-bold transition-colors"
                    >
                        JOIN MATCH
                    </button>
                </div>
            </div>
            
            <div className="mt-8 border-t border-white/10 pt-4">
                 <h3 className="text-lg font-bold mb-4">SERVER BROWSER</h3>
                 <div className="bg-black/30 rounded-lg h-32 overflow-y-auto p-2 space-y-2">
                     {/* Mock Server List */}
                     <div className="flex justify-between items-center bg-white/5 p-2 rounded hover:bg-white/10 cursor-pointer">
                         <span className="font-mono text-sm text-green-400">NA-EAST-1 (Public)</span>
                         <span className="text-xs text-gray-400">12/16 Players • EggMatch</span>
                     </div>
                     <div className="flex justify-between items-center bg-white/5 p-2 rounded hover:bg-white/10 cursor-pointer">
                         <span className="font-mono text-sm text-yellow-400">EU-WEST-2 (Pro)</span>
                         <span className="text-xs text-gray-400">15/16 Players • Free For All</span>
                     </div>
                     <div className="flex justify-between items-center bg-white/5 p-2 rounded hover:bg-white/10 cursor-pointer opacity-50">
                         <span className="font-mono text-sm text-red-400">ASIA-SOUTH (Full)</span>
                         <span className="text-xs text-gray-400">16/16 Players • Team Deathmatch</span>
                     </div>
                 </div>
            </div>

            <button 
                onClick={() => setStatus(GameStatus.MENU)}
                className="mt-8 text-gray-400 hover:text-white underline w-full text-center"
            >
                Back to Main Menu
            </button>
         </div>
      </div>
    );
  }

  // --- CONNECTING SCREEN ---
  if (status === GameStatus.CONNECTING) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
             <div className="text-white text-2xl font-bold animate-pulse">Connecting to Server...</div>
        </div>
      );
  }

  // --- GAME OVER SCREEN ---
  if (status === GameStatus.GAME_OVER) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-50 text-white">
        <h1 className="text-8xl font-black mb-4 text-red-500 drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] transform -rotate-6">CRACKED!</h1>
        <p className="text-3xl mb-8 font-light tracking-wide">You were scrambled.</p>
        
        <div className="bg-white/10 p-8 rounded-2xl border border-white/20 mb-8 text-center min-w-[300px]">
            <p className="text-sm text-gray-400 uppercase tracking-widest mb-2">Final Score</p>
            <p className="text-6xl font-bold text-yellow-400 font-mono">{score}</p>
        </div>

        <div className="flex gap-4">
            <button 
            onClick={() => {
                setStatus(GameStatus.PLAYING);
                resetGame();
            }}
            className="bg-white text-black hover:bg-gray-200 font-black py-4 px-10 rounded-full text-xl shadow-lg transition-transform hover:scale-105"
            >
            RESPAWN
            </button>
            <button 
            onClick={() => {
                setStatus(GameStatus.MENU);
                setIsHost(false);
                setRoomId(null);
                setGameMode('SOLO');
            }}
            className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold py-4 px-10 rounded-full text-xl transition-colors"
            >
            LEAVE
            </button>
        </div>
      </div>
    );
  }

  // --- HUD ---
  return (
    <div className="absolute inset-0 pointer-events-none">
      
      {/* Top Bar (Score) */}
      <div className="absolute top-0 w-full p-6 flex justify-between items-start">
        <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg">
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Score</div>
            <div className="text-3xl font-mono font-bold text-yellow-400 leading-none">{score.toString().padStart(6, '0')}</div>
        </div>
        
        <div className="flex flex-col items-end gap-1 opacity-80">
            {roomId && (
                <div className="bg-blue-600/80 px-3 py-1 rounded text-white font-bold text-sm mb-1">
                    ROOM CODE: {roomId}
                </div>
            )}
            <div className="text-xs text-green-400 font-mono">Connected</div>
        </div>
      </div>

      {/* Crosshair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
        {/* Hit Marker */}
        <div 
            className="absolute transition-opacity duration-75 ease-out"
            style={{ opacity: displayHitMarker }}
        >
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="red" strokeWidth="3">
                <line x1="10" y1="10" x2="30" y2="30" />
                <line x1="30" y1="10" x2="10" y2="30" />
            </svg>
        </div>
        
        {/* Reticle */}
        <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_2px_black]"></div>
        <div className="absolute w-6 h-6 border border-white/50 rounded-full"></div>
      </div>

      {/* Bottom Status Bar */}
      <div className="absolute bottom-0 w-full p-8 flex justify-between items-end bg-gradient-to-t from-black/60 to-transparent h-32">
        
        {/* Health */}
        <div className="flex items-end gap-4">
            <div className="text-5xl">❤️</div>
            <div className="flex flex-col gap-1 w-64">
                <div className="flex justify-between text-white font-bold text-lg">
                    <span>HEALTH</span>
                    <span>{health}%</span>
                </div>
                <div className="h-4 bg-gray-900/80 rounded-full overflow-hidden border border-white/20">
                    <div 
                        className="h-full transition-all duration-300 ease-out"
                        style={{ 
                            width: `${health}%`, 
                            backgroundColor: health > 50 ? '#10B981' : health > 25 ? '#F59E0B' : '#EF4444',
                            boxShadow: '0 0 10px rgba(255,255,255,0.3)'
                        }}
                    />
                </div>
            </div>
        </div>

        {/* Ammo */}
        <div className="flex items-end gap-4">
             <div className="flex flex-col items-end">
                 <div className="text-sm text-gray-400 font-bold mb-1">ASSAULT RIFLE</div>
                 <div className={`text-6xl font-black italic tracking-tighter ${isReloading ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                    {isReloading ? 'RLD' : ammo}
                    <span className="text-3xl text-gray-500 not-italic ml-2 font-normal">/ {maxAmmo}</span>
                 </div>
             </div>
             <div className="text-5xl opacity-80">🥚</div>
        </div>
      </div>
      
      {/* Damage Vignette */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
            background: 'radial-gradient(circle, transparent 60%, rgba(220, 38, 38, 0.4) 100%)',
            opacity: health < 40 ? (100 - health) / 60 : 0
        }}
      />
    </div>
  );
};