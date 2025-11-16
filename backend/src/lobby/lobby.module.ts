import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LobbyController } from './lobby.controller';
import { LobbyService } from './lobby.service';
import { GameSession, GameSessionSchema } from './schemas/game-session.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: GameSession.name, schema: GameSessionSchema },
        ]),
    ],
    controllers: [LobbyController],
    providers: [LobbyService],
    exports: [LobbyService],
})
export class LobbyModule { }

