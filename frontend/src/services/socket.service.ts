import { io, Socket } from 'socket.io-client';
import { GameSession } from '../types/game.types';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';

class SocketService {
    private socket: Socket | null = null;

    connect(): Socket {
        if (this.socket?.connected) {
            return this.socket;
        }

        this.socket = io(WS_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        this.socket.on('connect', () => {
            console.log('✅ Connected to server');
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Disconnected from server');
        });

        this.socket.on('error', (error: { message: string }) => {
            console.error('Socket error:', error);
        });

        return this.socket;
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    getSocket(): Socket | null {
        return this.socket;
    }

    // Lobby events
    createGame(playerName: string, gameMode: 'random' | 'select' = 'random', callback: (data: { gameId: string; playerId: string; game: GameSession }) => void): void {
        this.socket?.emit('lobby:create-game', { playerName, gameMode });
        this.socket?.on('lobby:game-created', callback);
    }

    joinGame(gameId: string, playerName: string, callback: (data: { gameId: string; playerId: string; game: GameSession }) => void): void {
        this.socket?.emit('lobby:join-game', { gameId, playerName });
        this.socket?.on('lobby:game-joined', callback);
    }

    listGames(callback: (games: GameSession[]) => void): void {
        this.socket?.emit('lobby:list-games');
        this.socket?.on('lobby:games-list', callback);
    }

    selectCharacter(gameId: string, playerId: string, characterId: string): void {
        this.socket?.emit('lobby:select-character', { gameId, playerId, characterId });
    }

    setReady(gameId: string, playerId: string, isReady: boolean): void {
        this.socket?.emit('lobby:set-ready', { gameId, playerId, isReady });
    }

    leaveGame(gameId: string, playerId: string): void {
        this.socket?.emit('lobby:leave-game', { gameId, playerId });
    }

    // Event listeners
    onPlayerJoined(callback: (data: { player: any; game: GameSession }) => void): void {
        this.socket?.on('lobby:player-joined', callback);
    }

    onPlayerLeft(callback: (data: { playerId: string; game: GameSession }) => void): void {
        this.socket?.on('lobby:player-left', callback);
    }

    onCharacterSelected(callback: (data: { playerId: string; characterId: string; game: GameSession }) => void): void {
        this.socket?.on('lobby:character-selected', callback);
    }

    onPlayerReady(callback: (data: { playerId: string; isReady: boolean; game: GameSession }) => void): void {
        this.socket?.on('lobby:player-ready', callback);
    }

    onGameClosed(callback: () => void): void {
        this.socket?.on('lobby:game-closed', callback);
    }

    onGameStarted(callback: (data: { gameState: any }) => void): void {
        this.socket?.on('game:started', callback);
    }

    startGame(gameId: string): void {
        this.socket?.emit('game:start', { gameId });
    }

    endTurn(gameId: string, playerId: string): void {
        this.socket?.emit('game:end-turn', { gameId, playerId });
    }

    playCard(gameId: string, playerId: string, cardId: string, targetId?: string): void {
        this.socket?.emit('game:play-card', { gameId, playerId, cardId, targetId });
    }

    attack(gameId: string, attackerId: string, targetId: string): void {
        this.socket?.emit('game:attack', { gameId, attackerId, targetId });
    }

    getGameState(gameId: string): void {
        this.socket?.emit('game:get-state', { gameId });
    }

    onTurnStarted(callback: (data: { gameState: any }) => void): void {
        this.socket?.on('game:turn-started', callback);
    }

    onTurnEnded(callback: (data: { gameState: any }) => void): void {
        this.socket?.on('game:turn-ended', callback);
    }

    onActionPerformed(callback: (data: { type: string; gameState: any;[key: string]: any }) => void): void {
        this.socket?.on('game:action-performed', callback);
    }

    onGameState(callback: (data: { gameState: any }) => void): void {
        this.socket?.on('game:state', callback);
    }

    onGameFinished(callback: (data: { gameState: any }) => void): void {
        this.socket?.on('game:finished', callback);
    }

    onError(callback: (error: { message: string }) => void): void {
        this.socket?.on('error', callback);
    }

    // Remove listeners
    off(event: string): void {
        this.socket?.off(event);
    }
}

export const socketService = new SocketService();

