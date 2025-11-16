import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Game, GameDocument } from '../database/schemas/game.schema';
import { GameAction, GameActionDocument } from '../database/schemas/game-action.schema';
import { GameState, PlayerGameState } from '../game/game.service';
import { CharactersService } from '../characters/characters.service';

/**
 * Service for saving game results and statistics to MongoDB
 */
@Injectable()
export class AnalyticsService {
    private actionCounts: Map<string, number> = new Map();
    private turnStartTimes: Map<string, Map<number, Date>> = new Map();

    constructor(
        @InjectModel(Game.name)
        private gameModel: Model<GameDocument>,
        @InjectModel(GameAction.name)
        private gameActionModel: Model<GameActionDocument>,
        private charactersService: CharactersService,
    ) { }

    /**
     * Save a completed game to MongoDB
     */
    async saveGame(gameState: GameState, gameSession: any): Promise<GameDocument> {
        const gameId = gameState.gameId;
        const startedAt = gameSession.startedAt || new Date();
        const finishedAt = new Date();
        const duration = Math.floor((finishedAt.getTime() - startedAt.getTime()) / 1000); // seconds

        // Get character names
        const characterIds = gameState.players.map((p) => p.characterId);
        const characters = await this.charactersService.findByIds(characterIds);
        const characterMap = new Map(characters.map((c) => [c.id, c.name]));

        // Calculate game statistics
        const totalTurns = gameState.currentTurn || 1;
        const totalActions = this.actionCounts.get(gameId) || 0;

        // Calculate average turn duration from recorded turn times
        const averageTurnDuration = this.calculateAverageTurnDuration(gameId, totalTurns, duration);

        // Determine winner and positions
        const alivePlayers = gameState.players.filter((p) => p.hp > 0);
        const winner = alivePlayers.length === 1 ? alivePlayers[0] : undefined;

        // Sort players by final HP (descending) to determine positions
        const sortedPlayers = [...gameState.players].sort((a, b) => b.hp - a.hp);

        // Build players array with positions
        const playersData = sortedPlayers.map((player, index) => {
            const position = index + 1;
            const isWinner = winner?.playerId === player.playerId;

            return {
                playerId: player.playerId,
                playerName: player.playerName,
                characterId: player.characterId,
                characterName: characterMap.get(player.characterId) || player.characterId,
                finalHp: player.hp,
                maxHp: player.maxHp,
                position,
                isWinner,
            };
        });

        // Create game document
        const gameData: Partial<Game> = {
            gameId,
            players: playersData,
            winner: winner
                ? {
                    playerId: winner.playerId,
                    playerName: winner.playerName,
                    characterId: winner.characterId,
                    finalHp: winner.hp,
                }
                : undefined,
            gameStats: {
                totalTurns,
                totalActions,
                duration,
                averageTurnDuration,
            },
            balanceVersion: gameState.balanceVersion,
            startedAt,
            finishedAt,
        };

        const game = new this.gameModel(gameData);
        const savedGame = await game.save();

        // Clean up tracking data
        this.actionCounts.delete(gameId);
        this.turnStartTimes.delete(gameId);

        return savedGame as unknown as GameDocument;
    }

    /**
     * Record a game action for analytics
     */
    async recordAction(
        gameId: string,
        turn: number,
        playerId: string,
        playerName: string,
        characterId: string,
        actionType: 'play-card' | 'use-skill' | 'attack' | 'defend' | 'draw-card' | 'end-turn' | 'effect-discard' | 'counterattack',
        actionDetails: {
            cardId?: string;
            cardName?: string;
            skillId?: string;
            skillName?: string;
            targetId?: string;
            targetName?: string;
            damage?: number;
            heal?: number;
            effectsApplied?: Array<{ type: string; duration: number }>;
            effectType?: string;
            cardsDiscarded?: number;
            originalDamage?: number;
        },
    ): Promise<GameActionDocument> {
        // Increment action count
        const currentCount = this.actionCounts.get(gameId) || 0;
        this.actionCounts.set(gameId, currentCount + 1);

        const actionData: Partial<GameAction> = {
            gameId,
            turn,
            playerId,
            playerName,
            characterId,
            actionType,
            actionDetails,
            timestamp: new Date(),
        };

        const action = new this.gameActionModel(actionData);
        const savedAction = await action.save();

        return savedAction as unknown as GameActionDocument;
    }

    /**
     * Record turn start time for duration calculation
     */
    recordTurnStart(gameId: string, turn: number): void {
        if (!this.turnStartTimes.has(gameId)) {
            this.turnStartTimes.set(gameId, new Map());
        }
        this.turnStartTimes.get(gameId)?.set(turn, new Date());
    }

    /**
     * Calculate average turn duration
     * Uses recorded turn start times if available, otherwise estimates from total duration
     */
    private calculateAverageTurnDuration(gameId: string, totalTurns: number, totalDuration: number): number {
        if (totalTurns === 0) return 0;

        // Try to calculate from recorded turn times
        const turnTimes = this.turnStartTimes.get(gameId);
        if (turnTimes && turnTimes.size > 1) {
            // Calculate average from recorded times
            const times = Array.from(turnTimes.values());
            let totalTurnDuration = 0;
            for (let i = 1; i < times.length; i++) {
                const turnDuration = (times[i].getTime() - times[i - 1].getTime()) / 1000;
                totalTurnDuration += turnDuration;
            }
            return Math.floor(totalTurnDuration / (times.length - 1));
        }

        // Fallback to simple division
        return Math.floor(totalDuration / totalTurns);
    }

    /**
     * Get game statistics for a specific game
     */
    async getGameStats(gameId: string): Promise<GameDocument | null> {
        const game = await this.gameModel.findOne({ gameId }).exec();
        return game as unknown as GameDocument | null;
    }

    /**
     * Get all actions for a game
     */
    async getGameActions(gameId: string): Promise<GameActionDocument[]> {
        const actions = await this.gameActionModel.find({ gameId }).sort({ timestamp: 1 }).exec();
        return actions as unknown as GameActionDocument[];
    }
}

