import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { LobbyService } from '../lobby/lobby.service';
import { GameService } from '../game/game.service';

@WebSocketGateway({
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true,
    },
    namespace: '/',
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(GameGateway.name);

    constructor(
        private readonly lobbyService: LobbyService,
        private readonly gameService: GameService,
    ) { }

    async handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    async handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
        // TODO: Handle player disconnection from game
    }

    @SubscribeMessage('lobby:create-game')
    async handleCreateGame(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { playerName: string; gameMode?: 'random' | 'select' },
    ) {
        try {
            const gameMode = data.gameMode || 'random';
            const gameSession = await this.lobbyService.createGame(data.playerName, client.id, gameMode);
            client.join(gameSession.gameId);
            client.emit('lobby:game-created', {
                gameId: gameSession.gameId,
                playerId: gameSession.players[0].playerId,
                game: gameSession,
            });
            this.logger.log(`Game created: ${gameSession.gameId} by ${data.playerName} (mode: ${gameMode})`);
        } catch (error) {
            client.emit('error', { message: error.message });
            this.logger.error(`Error creating game: ${error.message}`);
        }
    }

    @SubscribeMessage('lobby:join-game')
    async handleJoinGame(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { gameId: string; playerName: string },
    ) {
        try {
            const gameSession = await this.lobbyService.joinGame(data.gameId, data.playerName, client.id);
            client.join(data.gameId);
            client.emit('lobby:game-joined', {
                gameId: gameSession.gameId,
                playerId: gameSession.players.find((p) => p.socketId === client.id)?.playerId,
                game: gameSession,
            });
            // Notify other players
            client.to(data.gameId).emit('lobby:player-joined', {
                player: gameSession.players.find((p) => p.socketId === client.id),
                game: gameSession,
            });
            this.logger.log(`Player ${data.playerName} joined game ${data.gameId}`);
        } catch (error) {
            client.emit('error', { message: error.message });
            this.logger.error(`Error joining game: ${error.message}`);
        }
    }

    @SubscribeMessage('lobby:list-games')
    async handleListGames(@ConnectedSocket() client: Socket) {
        try {
            const games = await this.lobbyService.listAvailableGames();
            client.emit('lobby:games-list', games);
        } catch (error) {
            client.emit('error', { message: error.message });
            this.logger.error(`Error listing games: ${error.message}`);
        }
    }

    @SubscribeMessage('lobby:select-character')
    async handleSelectCharacter(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { gameId: string; playerId: string; characterId: string },
    ) {
        try {
            const gameSession = await this.lobbyService.selectCharacter(
                data.gameId,
                data.playerId,
                data.characterId,
            );
            // Notify all players in the game
            this.server.to(data.gameId).emit('lobby:character-selected', {
                playerId: data.playerId,
                characterId: data.characterId,
                game: gameSession,
            });
            this.logger.log(`Player ${data.playerId} selected character ${data.characterId}`);
        } catch (error) {
            client.emit('error', { message: error.message });
            this.logger.error(`Error selecting character: ${error.message}`);
        }
    }

    @SubscribeMessage('lobby:set-ready')
    async handleSetReady(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { gameId: string; playerId: string; isReady: boolean },
    ) {
        try {
            const gameSession = await this.lobbyService.setPlayerReady(
                data.gameId,
                data.playerId,
                data.isReady,
            );
            // Notify all players in the game
            this.server.to(data.gameId).emit('lobby:player-ready', {
                playerId: data.playerId,
                isReady: data.isReady,
                game: gameSession,
            });
            this.logger.log(`Player ${data.playerId} set ready: ${data.isReady}`);
        } catch (error) {
            client.emit('error', { message: error.message });
            this.logger.error(`Error setting ready: ${error.message}`);
        }
    }

    @SubscribeMessage('lobby:leave-game')
    async handleLeaveGame(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { gameId: string; playerId: string },
    ) {
        try {
            const gameSession = await this.lobbyService.removePlayer(data.gameId, data.playerId);
            client.leave(data.gameId);
            if (gameSession) {
                // Notify remaining players
                this.server.to(data.gameId).emit('lobby:player-left', {
                    playerId: data.playerId,
                    game: gameSession,
                });
            } else {
                // Game was deleted
                this.server.to(data.gameId).emit('lobby:game-closed');
            }
            this.logger.log(`Player ${data.playerId} left game ${data.gameId}`);
        } catch (error) {
            client.emit('error', { message: error.message });
            this.logger.error(`Error leaving game: ${error.message}`);
        }
    }

    @SubscribeMessage('game:start')
    async handleStartGame(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { gameId: string },
    ) {
        try {
            const gameState = await this.gameService.startGame(data.gameId);
            // Notify all players in the game
            this.server.to(data.gameId).emit('game:started', {
                gameState,
            });
            this.logger.log(`Game ${data.gameId} started`);

            // Also emit turn started event since startGame calls startTurn
            this.server.to(data.gameId).emit('game:turn-started', {
                gameState,
            });
        } catch (error) {
            client.emit('error', { message: error.message });
            this.logger.error(`Error starting game: ${error.message}`);
        }
    }

    @SubscribeMessage('game:end-turn')
    async handleEndTurn(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { gameId: string; playerId: string },
    ) {
        try {
            const gameState = await this.gameService.endTurn(data.gameId);
            // Notify all players
            this.server.to(data.gameId).emit('game:turn-ended', {
                gameState,
            });
            // Notify new turn started
            this.server.to(data.gameId).emit('game:turn-started', {
                gameState,
            });
            this.logger.log(`Turn ended in game ${data.gameId}`);
        } catch (error) {
            client.emit('error', { message: error.message });
            this.logger.error(`Error ending turn: ${error.message}`);
        }
    }

    @SubscribeMessage('game:play-card')
    async handlePlayCard(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { gameId: string; playerId: string; cardId: string; targetId?: string },
    ) {
        try {
            const result = await this.gameService.playCard(
                data.gameId,
                data.playerId,
                data.cardId,
                data.targetId,
            );
            if (result.success) {
                // Check if game ended
                if (result.gameState?.phase === 'finished') {
                    // Notify all players that game finished
                    this.server.to(data.gameId).emit('game:finished', {
                        gameState: result.gameState,
                    });
                    this.logger.log(`Game ${data.gameId} finished - Winner: ${result.gameState.players.find((p: any) => p.hp > 0)?.playerName}`);
                } else {
                    // Notify all players
                    this.server.to(data.gameId).emit('game:action-performed', {
                        type: 'play-card',
                        playerId: data.playerId,
                        cardId: data.cardId,
                        gameState: result.gameState,
                    });
                    this.logger.log(`Player ${data.playerId} played card ${data.cardId}`);
                }
            } else {
                client.emit('error', { message: result.message });
            }
        } catch (error) {
            client.emit('error', { message: error.message });
            this.logger.error(`Error playing card: ${error.message}`);
        }
    }

    @SubscribeMessage('game:attack')
    async handleAttack(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { gameId: string; attackerId: string; targetId: string },
    ) {
        try {
            const result = await this.gameService.performAttack(
                data.gameId,
                data.attackerId,
                data.targetId,
            );
            if (result.success) {
                // Check if game ended
                if (result.gameState?.phase === 'finished') {
                    // Notify all players that game finished
                    this.server.to(data.gameId).emit('game:finished', {
                        gameState: result.gameState,
                    });
                    this.logger.log(`Game ${data.gameId} finished - Winner: ${result.gameState.players.find((p: any) => p.hp > 0)?.playerName}`);
                } else {
                    // Notify all players
                    this.server.to(data.gameId).emit('game:action-performed', {
                        type: 'attack',
                        attackerId: data.attackerId,
                        targetId: data.targetId,
                        gameState: result.gameState,
                    });
                    this.logger.log(`Player ${data.attackerId} attacked ${data.targetId}`);
                }
            } else {
                client.emit('error', { message: result.message });
            }
        } catch (error) {
            client.emit('error', { message: error.message });
            this.logger.error(`Error performing attack: ${error.message}`);
        }
    }

    @SubscribeMessage('game:get-state')
    async handleGetState(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { gameId: string },
    ) {
        try {
            const gameState = await this.gameService.getGameState(data.gameId);
            client.emit('game:state', { gameState });
        } catch (error) {
            client.emit('error', { message: error.message });
            this.logger.error(`Error getting game state: ${error.message}`);
        }
    }

}

