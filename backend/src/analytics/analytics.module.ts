import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsService } from './analytics.service';
import { Game, GameSchema } from '../database/schemas/game.schema';
import { GameAction, GameActionSchema } from '../database/schemas/game-action.schema';
import { CharactersModule } from '../characters/characters.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Game.name, schema: GameSchema },
            { name: GameAction.name, schema: GameActionSchema },
        ]),
        CharactersModule,
    ],
    providers: [AnalyticsService],
    exports: [AnalyticsService],
})
export class AnalyticsModule { }

