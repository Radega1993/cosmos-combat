import { Module } from '@nestjs/common';
import { LobbyModule } from '../lobby/lobby.module';
import { GameModule } from '../game/game.module';
import { GameGateway } from './game.gateway';

@Module({
    imports: [LobbyModule, GameModule],
    providers: [GameGateway],
})
export class GatewayModule { }

