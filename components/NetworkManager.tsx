import React, { useEffect, useRef } from 'react';
import Peer, { DataConnection } from 'peerjs';
import { useStore } from '../store';
import { GameStatus } from '../types';
import * as THREE from 'three';

// Generate a random 4-letter room code
const generateRoomId = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No O, 0, I, 1
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const NetworkManager: React.FC = () => {
  const { 
    gameMode, 
    isHost, 
    roomId, 
    setRoomId, 
    setStatus, 
    updatePeer, 
    removePeer 
  } = useStore();
  
  const peerRef = useRef<Peer | null>(null);
  const connectionsRef = useRef<DataConnection[]>([]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
      connectionsRef.current = [];
    };
  }, []);

  // Initialize Network
  useEffect(() => {
    if (gameMode !== 'MULTIPLAYER' || peerRef.current) return;

    if (isHost) {
      const newRoomId = generateRoomId();
      // Prefix with eggcombat- to namespace it on public peerjs server
      const peer = new Peer(`eggcombat-${newRoomId}`);
      
      peer.on('open', (id) => {
        console.log('Host created room:', newRoomId);
        setRoomId(newRoomId);
        setStatus(GameStatus.PLAYING);
      });

      peer.on('connection', (conn) => {
        console.log('Peer connected:', conn.peer);
        connectionsRef.current.push(conn);
        
        conn.on('data', (data: any) => {
            handleData(data, conn.peer);
            // As host, broadcast to others
            broadcast(data, conn.peer);
        });
        
        conn.on('close', () => removePeer(conn.peer));
      });
      
      peer.on('error', (err) => {
        console.error('Peer error:', err);
        // Retry ID generation if taken? For now just log
      });

      peerRef.current = peer;

    } else if (roomId) {
      // Client joining
      const peer = new Peer(); // Auto ID
      
      peer.on('open', () => {
        setStatus(GameStatus.CONNECTING);
        const conn = peer.connect(`eggcombat-${roomId}`);
        
        conn.on('open', () => {
          console.log('Connected to host');
          connectionsRef.current.push(conn);
          setStatus(GameStatus.PLAYING);
        });

        conn.on('data', (data: any) => handleData(data, 'host'));
        conn.on('close', () => {
            console.log('Host disconnected');
            setStatus(GameStatus.MENU);
        });
        
        peerRef.current = peer;
      });
    }
  }, [gameMode, isHost, roomId, setStatus, setRoomId, removePeer]);

  const handleData = (data: any, senderId: string) => {
    if (data.type === 'move') {
      updatePeer(data.id, { 
        position: data.pos, 
        rotation: data.rot 
      });
    }
    if (data.type === 'hit') {
        // Handle getting shot by someone else
        // Ideally verified by host, but naive trust for now
    }
  };

  const broadcast = (data: any, excludeId?: string) => {
    connectionsRef.current.forEach(conn => {
      if (conn.peer !== excludeId && conn.open) {
        conn.send(data);
      }
    });
  };

  // Listen for local player updates to broadcast
  useEffect(() => {
    const handleLocalMove = (e: CustomEvent) => {
      if (!peerRef.current || connectionsRef.current.length === 0) return;
      
      const payload = {
        type: 'move',
        id: peerRef.current.id,
        pos: e.detail.pos,
        rot: e.detail.rot
      };

      // Send to all connected peers
      connectionsRef.current.forEach(conn => {
        if (conn.open) conn.send(payload);
      });
    };

    window.addEventListener('local-player-move', handleLocalMove as any);
    return () => window.removeEventListener('local-player-move', handleLocalMove as any);
  }, []);

  return null;
};