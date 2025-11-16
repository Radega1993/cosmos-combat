import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CharacterSchema } from './schemas/character.schema';
import { CardSchema } from './schemas/card.schema';
import { SkillSchema } from './schemas/skill.schema';
import { GameBalanceSchema } from './schemas/game-balance.schema';
import { GameSchema } from './schemas/game.schema';
import { GameActionSchema } from './schemas/game-action.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'Character', schema: CharacterSchema },
            { name: 'Card', schema: CardSchema },
            { name: 'Skill', schema: SkillSchema },
            { name: 'GameBalance', schema: GameBalanceSchema },
            { name: 'Game', schema: GameSchema },
            { name: 'GameAction', schema: GameActionSchema },
        ]),
    ],
    exports: [MongooseModule],
})
export class DatabaseModule { }

