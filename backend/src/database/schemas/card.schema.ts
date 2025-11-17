import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CardDocument = Card & Document;

export type CardType = 'attack' | 'defense' | 'utility' | 'skill';
export type TargetType = 'single' | 'area' | 'self' | 'all';

@Schema({ timestamps: true })
export class Card {
    @Prop({ required: true })
    id: string;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true, enum: ['attack', 'defense', 'utility', 'skill'] })
    type: CardType;

    @Prop({ default: 0 })
    cost: number;

    @Prop()
    damage?: number;

    @Prop()
    heal?: number;

    @Prop()
    defense?: number;

    @Prop()
    shield?: number;

    @Prop({
        type: [
            {
                type: { type: String, required: true },
                duration: { type: Number, required: true },
                value: { type: Number },
            },
        ],
        default: [],
    })
    effects?: Array<{
        type: string;
        duration: number;
        value?: number;
    }>;

    @Prop({
        required: true,
        enum: ['single', 'area', 'self', 'all'],
    })
    targetType: TargetType;

    @Prop({ required: true })
    description: string;

    @Prop()
    image?: string;

    @Prop({ default: true })
    isActive: boolean;
}

export const CardSchema = SchemaFactory.createForClass(Card);

// Create unique index on id
CardSchema.index({ id: 1 }, { unique: true });
// Indexes
CardSchema.index({ type: 1 });
CardSchema.index({ isActive: 1 });

