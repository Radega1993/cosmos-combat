/**
 * Turn management interfaces
 */

export enum TurnPhase {
    START = 'start',
    MAIN = 'main',
    END = 'end',
}

export interface TurnState {
    phase: TurnPhase;
    actionsRemaining: number;
    actionsPerTurn: number;
}

export interface ActionResult {
    success: boolean;
    message?: string;
    gameState?: any;
}

