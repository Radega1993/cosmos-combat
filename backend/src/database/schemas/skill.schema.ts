import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SkillDocument = Skill & Document;

export type SkillType = 'attack' | 'defense' | 'utility';
export type TargetType = 'single' | 'area' | 'self' | 'all';

@Schema({ timestamps: true })
export class Skill {
    @Prop({ required: true })
    id: string;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    character: string;

    @Prop({ required: true, enum: ['attack', 'defense', 'utility'] })
    type: SkillType;

    @Prop()
    damage?: number;

    @Prop()
    heal?: number;

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

    @Prop({ required: true })
    cooldown: number;

    @Prop()
    cost?: number;

    @Prop({
        required: true,
        enum: ['single', 'area', 'self', 'all'],
    })
    targetType: TargetType;

    @Prop({ required: true })
    description: string;

    @Prop({ default: true })
    isActive: boolean;
}

export const SkillSchema = SchemaFactory.createForClass(Skill);

// Create unique index on id
SkillSchema.index({ id: 1 }, { unique: true });
// Indexes
SkillSchema.index({ character: 1 });
SkillSchema.index({ isActive: 1 });

