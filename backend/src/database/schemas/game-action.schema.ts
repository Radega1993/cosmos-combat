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
        enum: ['play-card', 'use-skill', 'attack', 'defend', 'draw-card', 'end-turn', 'effect-discard', 'counterattack', 'game-start', 'game-end', 'player-eliminated'],
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
            shield: { type: Number },
            effectsApplied: {
                type: [
                    {
                        type: { type: String },
                        duration: { type: Number },
                    },
                ],
            },
            effectType: { type: String },
            cardsDiscarded: { type: Number },
            originalDamage: { type: Number },
            shieldAbsorbed: { type: Number },
            counterDamage: { type: Number },
            isAreaAttack: { type: Boolean },
            targetsCount: { type: Number },
            diceRolls: { type: [Number] },
            diceResults: { type: [Boolean] },
            finalHp: { type: Number },
            eliminatedPlayerId: { type: String },
            eliminatedPlayerName: { type: String },
            damageSource: { type: String },
            attackerId: { type: String },
            playersCount: { type: Number },
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
        shield?: number;
        effectsApplied?: Array<{
            type: string;
            duration: number;
        }>;
        effectType?: string;
        cardsDiscarded?: number;
        originalDamage?: number;
        shieldAbsorbed?: number;
        counterDamage?: number;
        isAreaAttack?: boolean;
        targetsCount?: number;
        diceRolls?: number[];
        diceResults?: boolean[];
        finalHp?: number;
        eliminatedPlayerId?: string;
        eliminatedPlayerName?: string;
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

