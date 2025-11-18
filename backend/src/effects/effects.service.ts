import { Injectable } from '@nestjs/common';
import { GameStateService } from '../game/game-state.service';
import { GameBalance, GameBalanceDocument } from '../database/schemas/game-balance.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

export interface Effect {
    type: string;
    duration: number;
    value?: number;
}

export interface EffectResult {
    damage?: number;
    actionsReduced?: number;
    cardsToDiscard?: number;
    gameEnded?: boolean;
}

@Injectable()
export class EffectsService {
    constructor(
        private gameStateService: GameStateService,
        @InjectModel(GameBalance.name)
        private gameBalanceModel: Model<GameBalanceDocument>,
    ) { }

    /**
     * Apply start-of-turn effects
     * Returns damage dealt, actions reduced, cards to discard, and if game ended
     */
    async applyStartOfTurnEffects(
        gameId: string,
        playerId: string,
        balanceVersion: string,
    ): Promise<{ result: EffectResult; gameEnded: boolean }> {
        const player = this.gameStateService.getPlayerState(gameId, playerId);
        if (!player) {
            return { result: {}, gameEnded: false };
        }

        const balance = await this.gameBalanceModel.findOne({ version: balanceVersion, isActive: true }).exec();
        if (!balance) {
            return { result: {}, gameEnded: false };
        }

        const result: EffectResult = {};
        let totalDamage = 0;
        let totalActionsReduced = 0;
        let totalCardsToDiscard = 0;

        // Process each effect type
        for (const effect of player.status.effects) {
            const effectConfig = balance.effects[effect.type];
            if (!effectConfig) continue;

            // Burn effect - damage at start of turn
            if (effect.type === 'burn') {
                const damage = effectConfig.damagePerTurn || effect.value || 0;
                totalDamage += damage;

                // Burn also discards a card
                if (effectConfig.discardCard) {
                    totalCardsToDiscard += 1;
                }
            }

            // Paralysis, Freeze, and Action Reduction - reduce actions
            if (effect.type === 'paralysis' || effect.type === 'freeze' || effect.type === 'action-reduction') {
                const actionsReduced = effectConfig.actionsReduced || effect.value || 1;
                totalActionsReduced += actionsReduced;
            }
        }

        result.damage = totalDamage;
        result.actionsReduced = totalActionsReduced;
        result.cardsToDiscard = totalCardsToDiscard;

        return { result, gameEnded: false };
    }

    /**
     * Apply end-of-turn effects
     */
    async applyEndOfTurnEffects(
        gameId: string,
        playerId: string,
        balanceVersion: string,
    ): Promise<EffectResult> {
        // Currently no end-of-turn effects, but structure is ready
        return {};
    }

    /**
     * Check if player has immunity to an effect type
     */
    hasImmunity(player: any, effectType: string): boolean {
        // Check character attributes for immunities
        // This would need character data, but for now we'll handle it in GameService
        return false;
    }

    /**
     * Check if effect can be cured with a roll
     */
    canCureWithRoll(effectType: string): boolean {
        return effectType === 'paralysis' || effectType === 'freeze';
    }

    /**
     * Attempt to cure an effect with a roll (1-6, needs 6)
     */
    attemptCure(effectType: string): boolean {
        if (!this.canCureWithRoll(effectType)) {
            return false;
        }
        // Roll a die (1-6)
        const roll = Math.floor(Math.random() * 6) + 1;
        return roll === 6;
    }

    /**
     * Get effect description for UI
     */
    getEffectDescription(effectType: string, balanceVersion: string): string {
        const descriptions: Record<string, string> = {
            burn: 'Quemadura: Descarta una carta al inicio de tu turno',
            paralysis: 'Parálisis: Pierdes 1 punto de acción. Puedes curar con una tirada de 6',
            freeze: 'Congelación: Pierdes 1 punto de acción. Puedes curar con una tirada de 6',
        };
        return descriptions[effectType] || `Efecto: ${effectType}`;
    }
}


