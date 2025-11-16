import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { LobbyService } from './lobby.service';

@Controller('lobby')
export class LobbyController {
    constructor(private readonly lobbyService: LobbyService) { }

    @Get('games')
    async listGames() {
        return await this.lobbyService.listAvailableGames();
    }

    @Get('games/:gameId')
    async getGame(@Param('gameId') gameId: string) {
        return await this.lobbyService.getGame(gameId);
    }
}

