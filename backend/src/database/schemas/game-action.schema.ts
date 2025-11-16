import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GameActionDocument = GameAction & Document;

@Schema({ timestamps: true })
export class GameAction {
    @Prop({ required: true })
    gameId: string;

    @Prop({ required: true })
    turn: number;

    @Prop({ required: true })
    playerId: string;

    @Prop({ required: true })
    playerName: string;

    @Prop({ required: true })
    characterId: string;

    @Prop({
        required: true,
        enum: ['play-card', 'use-skill', 'attack', 'defend', 'draw-card', 'end-turn'],
    })
    actionType: string;

    @Prop({
        type: {
            cardId: { type: String },
            cardName: { type: String },
            skillId: { type: String },
            skillName: { type: String },
            targetId: { type: String },
            targetName: { type: String },
            damage: { type: Number },
            heal: { type: Number },
            effectsApplied: {
                type: [
                    {
                        type: { type: String },
                        duration: { type: Number },
                    },
                ],
            },
        },
    })
    actionDetails?: {
        cardId?: string;
        cardName?: string;
        skillId?: string;
        skillName?: string;
        targetId?: string;
        targetName?: string;
        damage?: number;
        heal?: number;
        effectsApplied?: Array<{
            type: string;
            duration: number;
        }>;
    };

    @Prop({ required: true })
    timestamp: Date;
}

export const GameActionSchema = SchemaFactory.createForClass(GameAction);

// Indexes for common queries
GameActionSchema.index({ gameId: 1 });
GameActionSchema.index({ playerId: 1 });
GameActionSchema.index({ characterId: 1 });
GameActionSchema.index({ actionType: 1 });
GameActionSchema.index({ timestamp: 1 });
// Compound indexes for common queries
GameActionSchema.index({ gameId: 1, timestamp: 1 });
GameActionSchema.index({ playerId: 1, timestamp: -1 });
GameActionSchema.index({ characterId: 1, actionType: 1 });

