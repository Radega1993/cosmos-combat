import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PresetDocument = Preset & Document;

@Schema({ timestamps: true })
export class Preset {
    @Prop({ required: true })
    name: string;

    @Prop()
    description?: string;

    @Prop({ required: true })
    createdBy: string; // User ID

    @Prop({
        type: {
            characters: { type: Map, of: Object, default: {} },
            cards: { type: Map, of: Object, default: {} },
            skills: { type: Map, of: Object, default: {} },
            balance: { type: Object, default: {} },
        },
        required: true,
    })
    configuration: {
        characters: Record<string, any>;
        cards: Record<string, any>;
        skills: Record<string, any>;
        balance: any;
    };

    @Prop({ default: false })
    isDefault: boolean;

    @Prop({ default: true })
    isActive: boolean;
}

export const PresetSchema = SchemaFactory.createForClass(Preset);

// Create unique index on name + createdBy
PresetSchema.index({ name: 1, createdBy: 1 }, { unique: true });
// Index for active presets
PresetSchema.index({ isActive: 1 });
// Index for default presets
PresetSchema.index({ isDefault: 1 });

