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

        // Calculate game statistics from actions
        const totalTurns = gameState.currentTurn || 1;
        const totalActions = this.actionCounts.get(gameId) || 0;

        // Calculate average turn duration from recorded turn times
        const averageTurnDuration = this.calculateAverageTurnDuration(gameId, totalTurns, duration);

        // Get all actions for this game to calculate detailed stats
        const gameActions = await this.gameActionModel.find({ gameId }).exec();

        // Calculate aggregated statistics
        const stats = this.calculateGameStats(gameActions as unknown as GameActionDocument[]);

        // Determine winner and positions
        const alivePlayers = gameState.players.filter((p) => p.hp > 0);
        const winner = alivePlayers.length === 1 ? alivePlayers[0] : undefined;

        // Count eliminated players
        const playersEliminated = gameState.players.length - alivePlayers.length;

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
                totalDamage: stats.totalDamage,
                totalHealing: stats.totalHealing,
                cardsPlayed: stats.cardsPlayed,
                skillsUsed: stats.skillsUsed,
                attacksPerformed: stats.attacksPerformed,
                effectsApplied: stats.effectsApplied,
                playersEliminated,
            },
            balanceVersion: gameState.balanceVersion,
            startedAt,
            finishedAt,
        };

        const game = new this.gameModel(gameData);
        const savedGame = await game.save();

        // Record game end event
        await this.recordAction(
            gameId,
            totalTurns,
            'system',
            'System',
            'system',
            'game-end',
            {
                duration,
                totalTurns,
                totalActions,
                playersEliminated,
            },
        );

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
        actionType: 'play-card' | 'use-skill' | 'attack' | 'defend' | 'draw-card' | 'end-turn' | 'effect-discard' | 'counterattack' | 'game-start' | 'game-end' | 'player-eliminated',
        actionDetails?: {
            cardId?: string;
            cardName?: string;
            skillId?: string;
            skillName?: string;
            targetId?: string;
            targetName?: string;
            damage?: number;
            heal?: number;
            shield?: number;
            effectsApplied?: Array<{ type: string; duration: number }>;
            effectType?: string;
            cardsDiscarded?: number;
            originalDamage?: number;
            shieldAbsorbed?: number;
            counterDamage?: number;
            isAreaAttack?: boolean;
            targetsCount?: number;
            diceRolls?: number[];
            diceResults?: boolean[];
            finalHp?: number;
            eliminatedPlayerId?: string;
            eliminatedPlayerName?: string;
            duration?: number;
            totalTurns?: number;
            totalActions?: number;
            playersEliminated?: number;
            damageSource?: string;
            attackerId?: string;
            playersCount?: number;
        },
    ): Promise<GameActionDocument> {
        // Increment action count (except for system events)
        if (actionType !== 'game-start' && actionType !== 'game-end') {
            const currentCount = this.actionCounts.get(gameId) || 0;
            this.actionCounts.set(gameId, currentCount + 1);
        }

        const actionData: Partial<GameAction> = {
            gameId,
            turn,
            playerId,
            playerName,
            characterId,
            actionType,
            actionDetails: actionDetails || {},
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

    /**
     * Calculate aggregated game statistics from actions
     */
    private calculateGameStats(actions: GameActionDocument[]): {
        totalDamage: number;
        totalHealing: number;
        cardsPlayed: number;
        skillsUsed: number;
        attacksPerformed: number;
        effectsApplied: number;
    } {
        let totalDamage = 0;
        let totalHealing = 0;
        let cardsPlayed = 0;
        let skillsUsed = 0;
        let attacksPerformed = 0;
        let effectsApplied = 0;

        for (const action of actions) {
            const details = action.actionDetails || {};

            // Count damage
            if (details.damage) {
                totalDamage += details.damage;
            }

            // Count healing
            if (details.heal) {
                totalHealing += details.heal;
            }

            // Count action types
            switch (action.actionType) {
                case 'play-card':
                    cardsPlayed++;
                    if (details.effectsApplied && details.effectsApplied.length > 0) {
                        effectsApplied += details.effectsApplied.length;
                    }
                    break;
                case 'use-skill':
                    skillsUsed++;
                    if (details.effectsApplied && details.effectsApplied.length > 0) {
                        effectsApplied += details.effectsApplied.length;
                    }
                    break;
                case 'attack':
                    attacksPerformed++;
                    break;
            }
        }

        return {
            totalDamage,
            totalHealing,
            cardsPlayed,
            skillsUsed,
            attacksPerformed,
            effectsApplied,
        };
    }

    /**
     * Get character win rates
     */
    async getCharacterWinRates(
        balanceVersion?: string,
        startDate?: string,
        endDate?: string,
    ): Promise<Array<{ characterId: string; characterName: string; gamesPlayed: number; wins: number; winRate: number }>> {
        const query: any = {};
        if (balanceVersion) {
            query.balanceVersion = balanceVersion;
        }
        if (startDate || endDate) {
            query.finishedAt = {};
            if (startDate) {
                query.finishedAt.$gte = new Date(startDate);
            }
            if (endDate) {
                query.finishedAt.$lte = new Date(endDate);
            }
        }

        const games = await this.gameModel.find(query).exec();
        const gameDocs = games as unknown as GameDocument[];
        const characterStats = new Map<string, { gamesPlayed: number; wins: number }>();

        // Count games played and wins per character
        for (const game of gameDocs) {
            for (const player of game.players) {
                const stats = characterStats.get(player.characterId) || { gamesPlayed: 0, wins: 0 };
                stats.gamesPlayed++;
                if (player.isWinner) {
                    stats.wins++;
                }
                characterStats.set(player.characterId, stats);
            }
        }

        // Get character names
        const characterIds = Array.from(characterStats.keys());
        const characters = await this.charactersService.findByIds(characterIds);
        const characterMap = new Map(characters.map((c) => [c.id, c.name]));

        // Build result array
        const result = Array.from(characterStats.entries()).map(([characterId, stats]) => ({
            characterId,
            characterName: characterMap.get(characterId) || characterId,
            gamesPlayed: stats.gamesPlayed,
            wins: stats.wins,
            winRate: stats.gamesPlayed > 0 ? (stats.wins / stats.gamesPlayed) * 100 : 0,
        }));

        // Sort by win rate descending
        result.sort((a, b) => b.winRate - a.winRate);

        return result;
    }

    /**
     * Get card usage statistics
     */
    async getCardUsage(
        balanceVersion?: string,
        startDate?: string,
        endDate?: string,
    ): Promise<Array<{ cardId: string; cardName: string; timesPlayed: number; totalDamage: number; totalHealing: number; avgDamage: number; avgHealing: number }>> {
        const query: any = { actionType: 'play-card' };
        if (balanceVersion) {
            // Get gameIds with this balance version
            const games = await this.gameModel.find({ balanceVersion }).select('gameId').exec();
            query.gameId = { $in: games.map((g: any) => g.gameId) };
        }
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) {
                query.timestamp.$gte = new Date(startDate);
            }
            if (endDate) {
                query.timestamp.$lte = new Date(endDate);
            }
        }

        const actions = await this.gameActionModel.find(query).exec();
        const cardStats = new Map<string, { timesPlayed: number; totalDamage: number; totalHealing: number }>();

        for (const action of actions) {
            const details = action.actionDetails || {};
            const cardId = details.cardId || 'unknown';
            const stats = cardStats.get(cardId) || { timesPlayed: 0, totalDamage: 0, totalHealing: 0 };
            stats.timesPlayed++;
            if (details.damage) {
                stats.totalDamage += details.damage;
            }
            if (details.heal) {
                stats.totalHealing += details.heal;
            }
            cardStats.set(cardId, stats);
        }

        // Build result array
        const result = Array.from(cardStats.entries()).map(([cardId, stats]) => {
            const action = actions.find((a: any) => a.actionDetails?.cardId === cardId);
            return {
                cardId,
                cardName: action?.actionDetails?.cardName || cardId,
                timesPlayed: stats.timesPlayed,
                totalDamage: stats.totalDamage,
                totalHealing: stats.totalHealing,
                avgDamage: stats.timesPlayed > 0 ? stats.totalDamage / stats.timesPlayed : 0,
                avgHealing: stats.timesPlayed > 0 ? stats.totalHealing / stats.timesPlayed : 0,
            };
        });

        // Sort by times played descending
        result.sort((a, b) => b.timesPlayed - a.timesPlayed);

        return result;
    }

    /**
     * Get game duration statistics
     */
    async getGameDurations(
        balanceVersion?: string,
        startDate?: string,
        endDate?: string,
    ): Promise<{ average: number; min: number; max: number; median: number; totalGames: number }> {
        const query: any = {};
        if (balanceVersion) {
            query.balanceVersion = balanceVersion;
        }
        if (startDate || endDate) {
            query.finishedAt = {};
            if (startDate) {
                query.finishedAt.$gte = new Date(startDate);
            }
            if (endDate) {
                query.finishedAt.$lte = new Date(endDate);
            }
        }

        const games = await this.gameModel.find(query).exec();
        if (games.length === 0) {
            return { average: 0, min: 0, max: 0, median: 0, totalGames: 0 };
        }

        const gameDocs = games as unknown as GameDocument[];
        const durations = gameDocs
            .map((g) => g.gameStats?.duration || 0)
            .filter((d) => d > 0)
            .sort((a, b) => a - b);

        if (durations.length === 0) {
            return { average: 0, min: 0, max: 0, median: 0, totalGames: games.length };
        }

        const sum = durations.reduce((a, b) => a + b, 0);
        const average = Math.floor(sum / durations.length);
        const min = durations[0];
        const max = durations[durations.length - 1];
        const median = durations[Math.floor(durations.length / 2)];

        return { average, min, max, median, totalGames: games.length };
    }

    /**
     * Get player statistics
     */
    async getPlayerStats(
        playerId?: string,
        startDate?: string,
        endDate?: string,
    ): Promise<Array<{ playerId: string; playerName: string; gamesPlayed: number; wins: number; winRate: number; avgDamage: number; avgHealing: number }>> {
        const query: any = {};
        if (playerId) {
            query['players.playerId'] = playerId;
        }
        if (startDate || endDate) {
            query.finishedAt = {};
            if (startDate) {
                query.finishedAt.$gte = new Date(startDate);
            }
            if (endDate) {
                query.finishedAt.$lte = new Date(endDate);
            }
        }

        const games = await this.gameModel.find(query).exec();
        const gameDocs = games as unknown as GameDocument[];
        const playerStats = new Map<string, { gamesPlayed: number; wins: number; totalDamage: number; totalHealing: number; damageCount: number; healingCount: number }>();

        // Count games and wins per player
        for (const game of gameDocs) {
            for (const player of game.players) {
                const stats = playerStats.get(player.playerId) || {
                    gamesPlayed: 0,
                    wins: 0,
                    totalDamage: 0,
                    totalHealing: 0,
                    damageCount: 0,
                    healingCount: 0,
                };
                stats.gamesPlayed++;
                if (player.isWinner) {
                    stats.wins++;
                }
                playerStats.set(player.playerId, stats);
            }
        }

        // Get action statistics for damage and healing
        const playerIds = Array.from(playerStats.keys());
        const actionQuery: any = { playerId: { $in: playerIds } };
        if (startDate || endDate) {
            actionQuery.timestamp = {};
            if (startDate) {
                actionQuery.timestamp.$gte = new Date(startDate);
            }
            if (endDate) {
                actionQuery.timestamp.$lte = new Date(endDate);
            }
        }

        const actions = await this.gameActionModel.find(actionQuery).exec();
        for (const action of actions) {
            const stats = playerStats.get(action.playerId);
            if (!stats) continue;

            const details = action.actionDetails || {};
            if (details.damage) {
                stats.totalDamage += details.damage;
                stats.damageCount++;
            }
            if (details.heal) {
                stats.totalHealing += details.heal;
                stats.healingCount++;
            }
        }

        // Build result array
        const result = Array.from(playerStats.entries()).map(([playerId, stats]) => ({
            playerId,
            playerName: gameDocs.find((g) => g.players.some((p) => p.playerId === playerId))?.players.find((p) => p.playerId === playerId)?.playerName || playerId,
            gamesPlayed: stats.gamesPlayed,
            wins: stats.wins,
            winRate: stats.gamesPlayed > 0 ? (stats.wins / stats.gamesPlayed) * 100 : 0,
            avgDamage: stats.damageCount > 0 ? stats.totalDamage / stats.damageCount : 0,
            avgHealing: stats.healingCount > 0 ? stats.totalHealing / stats.healingCount : 0,
        }));

        // Sort by win rate descending
        result.sort((a, b) => b.winRate - a.winRate);

        return result;
    }

    /**
     * Get overall game statistics
     */
    async getOverallStats(
        balanceVersion?: string,
        startDate?: string,
        endDate?: string,
    ): Promise<{
        totalGames: number;
        totalPlayers: number;
        averageGameDuration: number;
        averageTurnsPerGame: number;
        averageActionsPerGame: number;
        totalDamage: number;
        totalHealing: number;
        mostPlayedCharacter: string;
        mostPlayedCard: string;
    }> {
        const query: any = {};
        if (balanceVersion) {
            query.balanceVersion = balanceVersion;
        }
        if (startDate || endDate) {
            query.finishedAt = {};
            if (startDate) {
                query.finishedAt.$gte = new Date(startDate);
            }
            if (endDate) {
                query.finishedAt.$lte = new Date(endDate);
            }
        }

        const games = await this.gameModel.find(query).exec();
        const gameDocs = games as unknown as GameDocument[];
        if (gameDocs.length === 0) {
            return {
                totalGames: 0,
                totalPlayers: 0,
                averageGameDuration: 0,
                averageTurnsPerGame: 0,
                averageActionsPerGame: 0,
                totalDamage: 0,
                totalHealing: 0,
                mostPlayedCharacter: '',
                mostPlayedCard: '',
            };
        }

        const totalGames = gameDocs.length;
        const uniquePlayers = new Set<string>();
        let totalDuration = 0;
        let totalTurns = 0;
        let totalActions = 0;
        let totalDamage = 0;
        let totalHealing = 0;
        const characterCounts = new Map<string, number>();
        const cardCounts = new Map<string, number>();

        for (const game of gameDocs) {
            // Count unique players
            for (const player of game.players) {
                uniquePlayers.add(player.playerId);
                characterCounts.set(player.characterId, (characterCounts.get(player.characterId) || 0) + 1);
            }

            // Aggregate stats
            if (game.gameStats) {
                totalDuration += game.gameStats.duration || 0;
                totalTurns += game.gameStats.totalTurns || 0;
                totalActions += game.gameStats.totalActions || 0;
                totalDamage += game.gameStats.totalDamage || 0;
                totalHealing += game.gameStats.totalHealing || 0;
            }
        }

        // Get most played character
        let mostPlayedCharacter = '';
        let maxCharacterCount = 0;
        for (const [characterId, count] of characterCounts.entries()) {
            if (count > maxCharacterCount) {
                maxCharacterCount = count;
                mostPlayedCharacter = characterId;
            }
        }

        // Get most played card from actions
        const actionQuery: any = { actionType: 'play-card' };
        if (balanceVersion) {
            const gameIds = gameDocs.map((g) => g.gameId);
            actionQuery.gameId = { $in: gameIds };
        }
        if (startDate || endDate) {
            actionQuery.timestamp = {};
            if (startDate) {
                actionQuery.timestamp.$gte = new Date(startDate);
            }
            if (endDate) {
                actionQuery.timestamp.$lte = new Date(endDate);
            }
        }

        const cardActions = await this.gameActionModel.find(actionQuery).exec();
        const cardActionDocs = cardActions as unknown as GameActionDocument[];
        for (const action of cardActionDocs) {
            const cardId = action.actionDetails?.cardId || 'unknown';
            cardCounts.set(cardId, (cardCounts.get(cardId) || 0) + 1);
        }

        let mostPlayedCard = '';
        let maxCardCount = 0;
        for (const [cardId, count] of cardCounts.entries()) {
            if (count > maxCardCount) {
                maxCardCount = count;
                const action = cardActionDocs.find((a) => a.actionDetails?.cardId === cardId);
                mostPlayedCard = action?.actionDetails?.cardName || cardId;
            }
        }

        return {
            totalGames,
            totalPlayers: uniquePlayers.size,
            averageGameDuration: Math.floor(totalDuration / totalGames),
            averageTurnsPerGame: Math.floor(totalTurns / totalGames),
            averageActionsPerGame: Math.floor(totalActions / totalGames),
            totalDamage,
            totalHealing,
            mostPlayedCharacter,
            mostPlayedCard,
        };
    }

    /**
     * Export game data
     */
    async exportData(
        format: 'json' | 'csv' = 'json',
        balanceVersion?: string,
        startDate?: string,
        endDate?: string,
    ): Promise<any> {
        const query: any = {};
        if (balanceVersion) {
            query.balanceVersion = balanceVersion;
        }
        if (startDate || endDate) {
            query.finishedAt = {};
            if (startDate) {
                query.finishedAt.$gte = new Date(startDate);
            }
            if (endDate) {
                query.finishedAt.$lte = new Date(endDate);
            }
        }

        const games = await this.gameModel.find(query).exec();
        const gameDocs = games as unknown as GameDocument[];

        if (format === 'csv') {
            // Simple CSV export
            const headers = ['gameId', 'balanceVersion', 'startedAt', 'finishedAt', 'duration', 'totalTurns', 'totalActions', 'winner', 'players'];
            const rows = gameDocs.map((game) => [
                game.gameId,
                game.balanceVersion,
                game.startedAt.toISOString(),
                game.finishedAt?.toISOString() || '',
                game.gameStats?.duration || 0,
                game.gameStats?.totalTurns || 0,
                game.gameStats?.totalActions || 0,
                game.winner?.playerName || '',
                game.players.map((p) => `${p.playerName}(${p.characterName})`).join(';'),
            ]);

            return {
                format: 'csv',
                data: [headers, ...rows].map((row) => row.join(',')).join('\n'),
            };
        }

        // JSON export
        return {
            format: 'json',
            data: gameDocs.map((game) => ({
                gameId: game.gameId,
                balanceVersion: game.balanceVersion,
                startedAt: game.startedAt,
                finishedAt: game.finishedAt,
                gameStats: game.gameStats,
                players: game.players,
                winner: game.winner,
            })),
        };
    }
}

