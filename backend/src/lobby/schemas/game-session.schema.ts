import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GameSessionDocument = GameSession & Document;

export type GamePhase = 'lobby' | 'setup' | 'playing' | 'finished';

@Schema({ timestamps: true })
export class GameSession {
    @Prop({ required: true })
    gameId: string;

    @Prop({
        type: [
            {
                playerId: { type: String, required: true },
                playerName: { type: String, required: true },
                characterId: { type: String },
                socketId: { type: String, required: true },
                isReady: { type: Boolean, default: false },
                joinedAt: { type: Date, default: Date.now },
            },
        ],
        default: [],
    })
    players: Array<{
        playerId: string;
        playerName: string;
        characterId?: string;
        socketId: string;
        isReady: boolean;
        joinedAt: Date;
    }>;

    @Prop({ required: true, enum: ['lobby', 'setup', 'playing', 'finished'], default: 'lobby' })
    phase: GamePhase;

    @Prop({ default: 2 })
    minPlayers: number;

    @Prop({ default: 6 })
    maxPlayers: number;

    @Prop()
    currentTurn?: number;

    @Prop()
    currentPlayerId?: string;

    @Prop({ type: [String], default: [] })
    turnOrder: string[];

    @Prop()
    winner?: string;

    @Prop()
    startedAt?: Date;

    @Prop()
    finishedAt?: Date;

    @Prop({ required: true, default: '1.0.0' })
    balanceVersion: string;

    @Prop({ required: true, enum: ['random', 'select'], default: 'random' })
    gameMode: 'random' | 'select';
}

export const GameSessionSchema = SchemaFactory.createForClass(GameSession);

// Create unique index on gameId
GameSessionSchema.index({ gameId: 1 }, { unique: true });
// Index for active games
GameSessionSchema.index({ phase: 1 });

