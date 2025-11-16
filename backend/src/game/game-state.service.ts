import { Injectable } from '@nestjs/common';
import { GameState, PlayerGameState } from './game.service';

/**
 * Service to manage in-memory game state during active gameplay
 * This provides fast access to game state without database queries
 */
@Injectable()
export class GameStateService {
    private gameStates: Map<string, GameState> = new Map();

    /**
     * Store game state in memory
     */
    setGameState(gameId: string, state: GameState): void {
        this.gameStates.set(gameId, state);
    }

    /**
     * Get game state from memory
     */
    getGameState(gameId: string): GameState | undefined {
        return this.gameStates.get(gameId);
    }

    /**
     * Get player state from game
     */
    getPlayerState(gameId: string, playerId: string): PlayerGameState | undefined {
        const gameState = this.getGameState(gameId);
        return gameState?.players.find((p) => p.playerId === playerId);
    }

    /**
     * Update player state
     */
    updatePlayerState(gameId: string, playerId: string, updates: Partial<PlayerGameState>): void {
        const gameState = this.getGameState(gameId);
        if (!gameState) return;

        const playerIndex = gameState.players.findIndex((p) => p.playerId === playerId);
        if (playerIndex === -1) return;

        gameState.players[playerIndex] = {
            ...gameState.players[playerIndex],
            ...updates,
        };
    }

    /**
     * Remove game state (when game ends)
     */
    removeGameState(gameId: string): void {
        this.gameStates.delete(gameId);
    }

    /**
     * Check if it's a player's turn
     */
    isPlayerTurn(gameId: string, playerId: string): boolean {
        const gameState = this.getGameState(gameId);
        return gameState?.currentPlayerId === playerId;
    }

    /**
     * Get current turn player
     */
    getCurrentPlayer(gameId: string): PlayerGameState | undefined {
        const gameState = this.getGameState(gameId);
        if (!gameState?.currentPlayerId) return undefined;
        return this.getPlayerState(gameId, gameState.currentPlayerId);
    }
}

