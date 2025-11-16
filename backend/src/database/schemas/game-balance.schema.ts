import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GameBalanceDocument = GameBalance & Document;

@Schema({ timestamps: true })
export class GameBalance {
    @Prop({ required: true })
    version: string;

    @Prop({
        type: {
            startingHandSize: { type: Number, required: true },
            maxHandSize: { type: Number, required: true },
            cardsPerTurn: { type: Number, required: true },
            actionsPerTurn: { type: Number, required: true },
            minPlayers: { type: Number, required: true },
            maxPlayers: { type: Number, required: true },
        },
        required: true,
    })
    game: {
        startingHandSize: number;
        maxHandSize: number;
        cardsPerTurn: number;
        actionsPerTurn: number;
        minPlayers: number;
        maxPlayers: number;
    };

    @Prop({ type: Map, of: Object, default: {} })
    characters: Record<string, {
        maxHp: number;
        baseAttack: number;
        baseDefense: number;
        baseSpeed: number;
    }>;

    @Prop({ type: Map, of: Object, default: {} })
    effects: Record<string, {
        damagePerTurn?: number;
        actionsReduced?: number;
        actionsAdded?: number;
        maxActions?: number;
        absorption?: number;
        damageAbsorption?: number;
        damageReduction?: number;
        damageReflected?: number;
        damageBonus?: number;
        discardCard?: boolean;
        cannotPlayCards?: boolean;
        dodgeBonus?: number;
        curable?: boolean;
        requiresRoll?: boolean;
        rollThreshold?: number;
        maxDuration: number;
        stackable: boolean;
    }>;

    @Prop({
        type: {
            minDamage: { type: Number, required: true },
            criticalHitMultiplier: { type: Number, required: true },
            criticalHitChance: { type: Number, required: true },
        },
        required: true,
    })
    combat: {
        minDamage: number;
        criticalHitMultiplier: number;
        criticalHitChance: number;
    };

    @Prop({
        type: {
            defaultCost: { type: Number, required: true },
            maxCost: { type: Number, required: true },
        },
        required: true,
    })
    cards: {
        defaultCost: number;
        maxCost: number;
    };

    @Prop({
        type: {
            defaultCooldown: { type: Number, required: true },
            minCooldown: { type: Number, required: true },
            maxCooldown: { type: Number, required: true },
        },
        required: true,
    })
    skills: {
        defaultCooldown: number;
        minCooldown: number;
        maxCooldown: number;
    };

    @Prop({ default: false })
    isActive: boolean;
}

export const GameBalanceSchema = SchemaFactory.createForClass(GameBalance);

// Create unique index on version
GameBalanceSchema.index({ version: 1 }, { unique: true });
// Only one active balance at a time
GameBalanceSchema.index({ isActive: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

