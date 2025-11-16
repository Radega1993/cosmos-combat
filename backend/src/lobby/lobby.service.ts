import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { GameSession, GameSessionDocument } from './schemas/game-session.schema';

@Injectable()
export class LobbyService {
    constructor(
        @InjectModel(GameSession.name)
        private gameSessionModel: Model<GameSessionDocument>,
    ) { }

    async createGame(playerName: string, socketId: string, gameMode: 'random' | 'select' = 'random'): Promise<GameSessionDocument> {
        const gameId = uuidv4();
        const playerId = uuidv4();

        const gameSession = new this.gameSessionModel({
            gameId,
            players: [
                {
                    playerId,
                    playerName,
                    socketId,
                    isReady: false,
                    joinedAt: new Date(),
                },
            ],
            phase: 'lobby',
            minPlayers: 2,
            maxPlayers: 6,
            balanceVersion: '1.0.0',
            gameMode,
        });

        return (await gameSession.save()) as unknown as GameSessionDocument;
    }

    async joinGame(gameId: string, playerName: string, socketId: string): Promise<GameSessionDocument> {
        const gameSession = await this.gameSessionModel.findOne({ gameId, phase: 'lobby' });

        if (!gameSession) {
            throw new NotFoundException(`Game ${gameId} not found or already started`);
        }

        if (gameSession.players.length >= gameSession.maxPlayers) {
            throw new BadRequestException('Game is full');
        }

        // Check if player name already exists in this game
        const playerExists = gameSession.players.some((p) => p.playerName === playerName);
        if (playerExists) {
            throw new BadRequestException('Player name already taken in this game');
        }

        const playerId = uuidv4();
        gameSession.players.push({
            playerId,
            playerName,
            socketId,
            isReady: false,
            joinedAt: new Date(),
        });

        return (await gameSession.save()) as unknown as GameSessionDocument;
    }

    async getGame(gameId: string): Promise<GameSessionDocument> {
        const gameSession = await this.gameSessionModel.findOne({ gameId });

        if (!gameSession) {
            throw new NotFoundException(`Game ${gameId} not found`);
        }

        return gameSession as unknown as GameSessionDocument;
    }

    async updatePlayerSocket(gameId: string, playerId: string, socketId: string): Promise<void> {
        await this.gameSessionModel.updateOne(
            { gameId, 'players.playerId': playerId },
            { $set: { 'players.$.socketId': socketId } },
        );
    }

    async removePlayer(gameId: string, playerId: string): Promise<GameSessionDocument | null> {
        const gameSession = await this.getGame(gameId);

        gameSession.players = gameSession.players.filter((p) => p.playerId !== playerId);

        // If no players left, delete the game
        if (gameSession.players.length === 0) {
            await this.gameSessionModel.deleteOne({ gameId });
            return null;
        }

        return (await gameSession.save()) as unknown as GameSessionDocument;
    }

    async listAvailableGames(): Promise<GameSession[]> {
        return await this.gameSessionModel
            .find({
                phase: 'lobby',
                $expr: { $lt: [{ $size: '$players' }, '$maxPlayers'] },
            })
            .select('gameId players phase')
            .limit(20)
            .exec();
    }

    async setPlayerReady(gameId: string, playerId: string, isReady: boolean): Promise<GameSessionDocument> {
        const gameSession = await this.getGame(gameId);

        const player = gameSession.players.find((p) => p.playerId === playerId);
        if (!player) {
            throw new NotFoundException('Player not found in game');
        }

        player.isReady = isReady;

        return (await gameSession.save()) as unknown as GameSessionDocument;
    }

    async selectCharacter(gameId: string, playerId: string, characterId: string): Promise<GameSessionDocument> {
        const gameSession = await this.getGame(gameId);

        const player = gameSession.players.find((p) => p.playerId === playerId);
        if (!player) {
            throw new NotFoundException('Player not found in game');
        }

        // Check if character is already taken
        const characterTaken = gameSession.players.some(
            (p) => p.playerId !== playerId && p.characterId === characterId,
        );
        if (characterTaken) {
            throw new BadRequestException('Character already selected by another player');
        }

        player.characterId = characterId;

        return (await gameSession.save()) as unknown as GameSessionDocument;
    }
}

