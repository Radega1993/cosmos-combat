import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { Game, GameSchema } from '../database/schemas/game.schema';
import { GameAction, GameActionSchema } from '../database/schemas/game-action.schema';
import { CharactersModule } from '../characters/characters.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Game.name, schema: GameSchema },
            { name: GameAction.name, schema: GameActionSchema },
        ]),
        CharactersModule,
        AuthModule,
    ],
    controllers: [AnalyticsController],
    providers: [AnalyticsService],
    exports: [AnalyticsService],
})
export class AnalyticsModule { }

