import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameService } from './game.service';
import { GameStateService } from './game-state.service';
import { LobbyModule } from '../lobby/lobby.module';
import { CharactersModule } from '../characters/characters.module';
import { CardsModule } from '../cards/cards.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { GameSession, GameSessionSchema } from '../lobby/schemas/game-session.schema';
import { GameBalance, GameBalanceSchema } from '../database/schemas/game-balance.schema';
import { Card, CardSchema } from '../database/schemas/card.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: GameSession.name, schema: GameSessionSchema },
            { name: GameBalance.name, schema: GameBalanceSchema },
            { name: Card.name, schema: CardSchema },
        ]),
        LobbyModule,
        CharactersModule,
        CardsModule,
        AnalyticsModule,
    ],
    providers: [GameService, GameStateService],
    exports: [GameService, GameStateService],
})
export class GameModule { }

