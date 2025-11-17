import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GameDocument = Game & Document;

@Schema({ timestamps: true })
export class Game {
    @Prop({ required: true })
    gameId: string;

    @Prop({
        type: [
            {
                playerId: { type: String, required: true },
                playerName: { type: String, required: true },
                characterId: { type: String, required: true },
                characterName: { type: String, required: true },
                finalHp: { type: Number, required: true },
                maxHp: { type: Number, required: true },
                position: { type: Number, required: true },
                isWinner: { type: Boolean, required: true },
            },
        ],
        required: true,
    })
    players: Array<{
        playerId: string;
        playerName: string;
        characterId: string;
        characterName: string;
        finalHp: number;
        maxHp: number;
        position: number;
        isWinner: boolean;
    }>;

    @Prop({
        type: {
            playerId: { type: String, required: true },
            playerName: { type: String, required: true },
            characterId: { type: String, required: true },
            finalHp: { type: Number, required: true },
        },
    })
    winner?: {
        playerId: string;
        playerName: string;
        characterId: string;
        finalHp: number;
    };

    @Prop({
        type: {
            totalTurns: { type: Number, required: true },
            totalActions: { type: Number, required: true },
            duration: { type: Number, required: true },
            averageTurnDuration: { type: Number, required: true },
            totalDamage: { type: Number },
            totalHealing: { type: Number },
            cardsPlayed: { type: Number },
            skillsUsed: { type: Number },
            attacksPerformed: { type: Number },
            effectsApplied: { type: Number },
            playersEliminated: { type: Number },
        },
    })
    gameStats?: {
        totalTurns: number;
        totalActions: number;
        duration: number;
        averageTurnDuration: number;
        totalDamage?: number;
        totalHealing?: number;
        cardsPlayed?: number;
        skillsUsed?: number;
        attacksPerformed?: number;
        effectsApplied?: number;
        playersEliminated?: number;
    };

    @Prop({ required: true })
    balanceVersion: string;

    @Prop({ required: true })
    startedAt: Date;

    @Prop()
    finishedAt?: Date;
}

export const GameSchema = SchemaFactory.createForClass(Game);

// Create unique index on gameId
GameSchema.index({ gameId: 1 }, { unique: true });
// Index for queries by finished date
GameSchema.index({ finishedAt: -1 });
// Index for balance version queries
GameSchema.index({ balanceVersion: 1 });
// Index for winner character analysis
GameSchema.index({ 'winner.characterId': 1 });
// Compound index for analytics queries
GameSchema.index({ balanceVersion: 1, finishedAt: -1 });

