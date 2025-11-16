import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CharacterDocument = Character & Document;

@Schema({ timestamps: true })
export class Character {
    @Prop({ required: true })
    id: string;

    @Prop({ required: true })
    name: string;

    @Prop()
    description: string;

    @Prop({ required: true })
    maxHp: number;

    @Prop({
        type: {
            attack: { type: Number, required: true },
            defense: { type: Number, required: true },
            speed: { type: Number, required: true },
            dodge: { type: Number, default: 0 },
            accuracy: { type: Number, default: 0 },
        },
        required: true,
    })
    baseStats: {
        attack: number;
        defense: number;
        speed: number;
        dodge?: number;
        accuracy?: number;
    };

    @Prop({
        type: {
            fireResistance: { type: Number, default: 0 },
            coldResistance: { type: Number, default: 0 },
            physicalResistance: { type: Number, default: 0 },
            paralysisImmunity: { type: Boolean, default: false },
        },
        default: {},
    })
    attributes?: {
        fireResistance?: number;
        coldResistance?: number;
        physicalResistance?: number;
        paralysisImmunity?: boolean;
    };

    @Prop({ type: [String], default: [] })
    skills: string[];

    @Prop({ type: [String], default: [] })
    deck: string[];

    @Prop({ default: true })
    isActive: boolean;
}

export const CharacterSchema = SchemaFactory.createForClass(Character);

// Create unique index on id
CharacterSchema.index({ id: 1 }, { unique: true });
// Index for active characters
CharacterSchema.index({ isActive: 1 });

