import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EffectsService } from './effects.service';
import { GameBalance, GameBalanceSchema } from '../database/schemas/game-balance.schema';
import { GameModule } from '../game/game.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: GameBalance.name, schema: GameBalanceSchema },
        ]),
        forwardRef(() => GameModule),
    ],
    providers: [EffectsService],
    exports: [EffectsService],
})
export class EffectsModule { }

