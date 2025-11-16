export type GamePhase = 'lobby' | 'setup' | 'playing' | 'finished';

export interface Player {
    playerId: string;
    playerName: string;
    characterId?: string;
    socketId: string;
    isReady: boolean;
    joinedAt: Date;
}

export interface GameSession {
    gameId: string;
    players: Player[];
    phase: GamePhase;
    minPlayers: number;
    maxPlayers: number;
    currentTurn?: number;
    currentPlayerId?: string;
    turnOrder: string[];
    winner?: string;
    startedAt?: Date;
    finishedAt?: Date;
    balanceVersion: string;
    gameMode: 'random' | 'select';
}

export interface Character {
    id: string;
    name: string;
    description: string;
    maxHp: number;
    baseStats: {
        attack: number;
        defense: number;
        speed: number;
        dodge?: number;
        accuracy?: number;
    };
    attributes?: {
        fireResistance?: number;
        coldResistance?: number;
        physicalResistance?: number;
        paralysisImmunity?: boolean;
    };
    skills: string[];
    deck: string[];
    isActive: boolean;
}

export interface Card {
    id: string;
    name: string;
    type: 'attack' | 'defense' | 'utility' | 'skill';
    cost: number;
    damage?: number;
    heal?: number;
    defense?: number;
    shield?: number;
    effects?: Array<{
        type: string;
        duration: number;
        value?: number;
    }>;
    targetType: 'single' | 'area' | 'self' | 'all';
    description: string;
    isActive: boolean;
}

export interface PlayerGameState {
    playerId: string;
    playerName: string;
    characterId: string;
    hp: number;
    maxHp: number;
    hand: string[];
    deck: string[];
    discard: string[];
    status: {
        effects: Array<{
            type: string;
            duration: number;
            value?: number;
        }>;
        shields: number;
        cooldowns: Record<string, number>;
    };
}

export interface GameState {
    gameId: string;
    phase: 'lobby' | 'setup' | 'playing' | 'finished';
    players: PlayerGameState[];
    currentTurn?: number;
    currentPlayerId?: string;
    turnOrder: string[];
    balanceVersion: string;
    turnState?: {
        phase: 'start' | 'main' | 'end';
        actionsRemaining: number;
        actionsPerTurn: number;
    };
    actionsRemaining?: number;
    sharedDeck: string[]; // Shared deck for all players
    sharedDiscard: string[]; // Shared discard pile for all players
    gameStats?: {
        totalTurns: number;
        totalActions: number;
        duration: number;
        averageTurnDuration: number;
    };
}

