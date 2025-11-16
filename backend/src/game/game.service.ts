import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GameSession, GameSessionDocument } from '../lobby/schemas/game-session.schema';
import { GameBalance, GameBalanceDocument } from '../database/schemas/game-balance.schema';
import { Card, CardDocument } from '../database/schemas/card.schema';
import { CharactersService } from '../characters/characters.service';
import { CardsService } from '../cards/cards.service';
import { SkillsService } from '../skills/skills.service';
import { EffectsService } from '../effects/effects.service';
import { LobbyService } from '../lobby/lobby.service';
import { GameStateService } from './game-state.service';
import { TurnPhase, TurnState, ActionResult } from './interfaces/turn.interface';
import { AnalyticsService } from '../analytics/analytics.service';

export interface PlayerGameState {
    playerId: string;
    playerName: string;
    characterId: string;
    hp: number;
    maxHp: number;
    hand: string[]; // Card IDs
    deck: string[]; // Card IDs
    discard: string[]; // Card IDs
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
    turnState?: TurnState;
    actionsRemaining?: number;
    sharedDeck: string[]; // Shared deck for all players
    sharedDiscard: string[]; // Shared discard pile for all players
}

@Injectable()
export class GameService {
    constructor(
        @InjectModel(GameSession.name)
        private gameSessionModel: Model<GameSessionDocument>,
        @InjectModel(GameBalance.name)
        private gameBalanceModel: Model<GameBalanceDocument>,
        @InjectModel(Card.name)
        private cardModel: Model<CardDocument>,
        private charactersService: CharactersService,
        private cardsService: CardsService,
        private skillsService: SkillsService,
        private effectsService: EffectsService,
        private lobbyService: LobbyService,
        private gameStateService: GameStateService,
        private analyticsService: AnalyticsService,
    ) { }

    async startGame(gameId: string): Promise<GameState> {
        const gameSession = await this.lobbyService.getGame(gameId);

        // Validate all players are ready
        const playersNotReady = gameSession.players.filter((p) => !p.isReady);
        if (playersNotReady.length > 0) {
            throw new BadRequestException('All players must be ready before starting');
        }

        // Handle character assignment based on game mode
        if (gameSession.gameMode === 'random') {
            // Assign random characters to players who don't have one
            await this.assignRandomCharacters(gameSession);
        } else {
            // Validate all players have selected characters in select mode
            const playersWithoutCharacter = gameSession.players.filter((p) => !p.characterId);
            if (playersWithoutCharacter.length > 0) {
                throw new BadRequestException('All players must select a character before starting');
            }
        }

        // Get balance configuration
        const balance = await this.gameBalanceModel.findOne({ isActive: true });
        if (!balance) {
            throw new NotFoundException('No active game balance found');
        }

        // Get all characters
        const characterIds = gameSession.players.map((p) => p.characterId).filter(Boolean) as string[];
        const characters = await this.charactersService.findByIds(characterIds);

        // Create game state
        const players: PlayerGameState[] = [];
        const turnOrder: string[] = [];

        // Create shared deck from the first character's deck (all characters use the same deck)
        // The deck is defined in the seed with all 79 cards
        const firstCharacter = characters[0];
        if (!firstCharacter) {
            throw new NotFoundException('No characters available');
        }

        // Get all cards from the shared deck (using first character's deck definition)
        const sharedDeckCards = await this.cardsService.findByIds(firstCharacter.deck);
        // Create shared deck with all card IDs (expanded to full deck with quantities)
        const sharedDeck: string[] = [];

        // Expand deck based on quantities in character.deck
        // The deck array contains card IDs, we need to expand it to full deck
        // Since all characters have the same deck definition, we use the first one
        for (const cardId of firstCharacter.deck) {
            sharedDeck.push(cardId);
        }

        // Shuffle shared deck
        this.shuffleArray(sharedDeck);

        // Initialize players with hands from shared deck
        const startingHandSize = balance.game.startingHandSize;

        for (const player of gameSession.players) {
            const character = characters.find((c) => c.id === player.characterId);
            if (!character) {
                throw new NotFoundException(`Character ${player.characterId} not found`);
            }

            // Draw initial hand from shared deck
            const hand: string[] = [];
            for (let i = 0; i < startingHandSize && sharedDeck.length > 0; i++) {
                const card = sharedDeck.shift();
                if (card) {
                    hand.push(card);
                }
            }

            // Get character HP from balance or use default
            let characterBalance: any = null;
            if (balance.characters instanceof Map) {
                characterBalance = balance.characters.get(character.id);
            } else if (balance.characters && typeof balance.characters === 'object') {
                characterBalance = (balance.characters as Record<string, any>)[character.id];
            }
            const maxHp = characterBalance?.maxHp || character.maxHp;

            players.push({
                playerId: player.playerId,
                playerName: player.playerName,
                characterId: character.id,
                hp: maxHp,
                maxHp,
                hand,
                deck: [], // Players no longer have individual decks
                discard: [], // Players no longer have individual discard piles
                status: {
                    effects: [],
                    shields: 0,
                    cooldowns: {},
                },
            });

            turnOrder.push(player.playerId);
        }

        // Determine turn order by speed (higher speed goes first)
        turnOrder.sort((a, b) => {
            const playerA = players.find((p) => p.playerId === a);
            const playerB = players.find((p) => p.playerId === b);
            const charA = characters.find((c) => c.id === playerA?.characterId);
            const charB = characters.find((c) => c.id === playerB?.characterId);
            return (charB?.baseStats.speed || 0) - (charA?.baseStats.speed || 0);
        });

        // Update game session
        gameSession.phase = 'playing';
        gameSession.currentTurn = 1;
        gameSession.currentPlayerId = turnOrder[0];
        gameSession.turnOrder = turnOrder;
        gameSession.startedAt = new Date();
        await (gameSession.save() as Promise<any>);

        const actionsPerTurn = balance.game.actionsPerTurn;
        const gameState: GameState = {
            gameId,
            phase: 'playing',
            players,
            currentTurn: 1,
            currentPlayerId: turnOrder[0],
            turnOrder,
            balanceVersion: balance.version,
            turnState: {
                phase: TurnPhase.START,
                actionsRemaining: actionsPerTurn,
                actionsPerTurn,
            },
            actionsRemaining: actionsPerTurn,
            sharedDeck, // Shared deck for all players
            sharedDiscard: [], // Shared discard pile for all players
        };

        // Store game state in memory
        this.gameStateService.setGameState(gameId, gameState);

        // Record game start for analytics
        this.analyticsService.recordTurnStart(gameId, 1);

        // Start first turn
        await this.startTurn(gameId);

        return gameState;
    }

    /**
     * Start a new turn for the current player
     */
    async startTurn(gameId: string): Promise<GameState> {
        const gameState = this.gameStateService.getGameState(gameId);
        if (!gameState) {
            throw new NotFoundException('Game state not found');
        }

        const gameSession = await this.lobbyService.getGame(gameId);
        const balance = await this.gameBalanceModel.findOne({ isActive: true });
        if (!balance) {
            throw new NotFoundException('No active game balance found');
        }

        const currentPlayer = this.gameStateService.getCurrentPlayer(gameId);
        if (!currentPlayer) {
            throw new NotFoundException('Current player not found');
        }

        // Phase: START
        // 1. Apply start-of-turn effects
        const effectsResult = await this.applyStartOfTurnEffects(gameId, currentPlayer.playerId, gameState.balanceVersion);
        if (effectsResult.gameEnded) {
            // Game ended from start-of-turn effects
            return effectsResult.finishedState!;
        }

        // Apply damage from effects (no attacker for start-of-turn effects)
        if (effectsResult.result.damage && effectsResult.result.damage > 0) {
            const finishedState = await this.applyDamage(
                gameId,
                currentPlayer.playerId,
                effectsResult.result.damage,
                'effect',
                undefined, // No attacker for start-of-turn effects
            );
            if (finishedState) {
                return finishedState;
            }
        }

        // Apply burn discard (discard a card)
        if (effectsResult.result.cardsToDiscard && effectsResult.result.cardsToDiscard > 0) {
            await this.discardRandomCards(gameId, currentPlayer.playerId, effectsResult.result.cardsToDiscard);
        }

        // Apply action reduction from paralysis/freeze
        if (effectsResult.result.actionsReduced && effectsResult.result.actionsReduced > 0) {
            gameState.actionsRemaining = Math.max(
                0,
                (gameState.actionsRemaining || 0) - effectsResult.result.actionsReduced,
            );
            if (gameState.turnState) {
                gameState.turnState.actionsRemaining = gameState.actionsRemaining;
            }
        }

        // 2. Draw cards
        const cardsPerTurn = balance.game.cardsPerTurn;
        const drawnCards = await this.drawCard(gameId, currentPlayer.playerId, cardsPerTurn);

        // Record draw card action for analytics
        if (drawnCards.length > 0) {
            await this.analyticsService.recordAction(
                gameId,
                gameState.currentTurn || 1,
                currentPlayer.playerId,
                currentPlayer.playerName,
                currentPlayer.characterId,
                'draw-card',
                {
                    // Note: We don't track which specific cards were drawn for privacy/balance
                },
            );
        }

        // 3. Reset actions
        const actionsPerTurn = balance.game.actionsPerTurn;
        gameState.actionsRemaining = actionsPerTurn;
        gameState.turnState = {
            phase: TurnPhase.MAIN,
            actionsRemaining: actionsPerTurn,
            actionsPerTurn,
        };

        // Update game session
        gameSession.currentPlayerId = currentPlayer.playerId;
        await (gameSession.save() as Promise<any>);

        this.gameStateService.setGameState(gameId, gameState);

        return gameState;
    }

    /**
     * End current turn and advance to next player
     */
    async endTurn(gameId: string): Promise<GameState> {
        const gameState = this.gameStateService.getGameState(gameId);
        if (!gameState) {
            throw new NotFoundException('Game state not found');
        }

        const currentPlayer = this.gameStateService.getCurrentPlayer(gameId);
        if (!currentPlayer) {
            throw new NotFoundException('Current player not found');
        }

        // Phase: END
        // 1. Apply end-of-turn effects
        await this.applyEndOfTurnEffects(gameId, currentPlayer.playerId);

        // 2. Reduce effect durations
        await this.processEffectDurations(gameId, currentPlayer.playerId);

        // 3. Advance to next player
        const currentIndex = gameState.turnOrder.indexOf(currentPlayer.playerId);
        const nextIndex = (currentIndex + 1) % gameState.turnOrder.length;
        const nextPlayerId = gameState.turnOrder[nextIndex];

        // Check if we've completed a full round
        if (nextIndex === 0) {
            gameState.currentTurn = (gameState.currentTurn || 1) + 1;
        }

        const newTurn = gameState.currentTurn || 1;

        // Record turn end action
        await this.analyticsService.recordAction(
            gameId,
            newTurn - 1, // Previous turn
            currentPlayer.playerId,
            currentPlayer.playerName,
            currentPlayer.characterId,
            'end-turn',
            {},
        );

        gameState.currentPlayerId = nextPlayerId;
        gameState.turnState = {
            phase: TurnPhase.START,
            actionsRemaining: 0,
            actionsPerTurn: gameState.turnState?.actionsPerTurn || 2,
        };

        const gameSession = await this.lobbyService.getGame(gameId);
        gameSession.currentTurn = newTurn;
        gameSession.currentPlayerId = nextPlayerId;
        await (gameSession.save() as Promise<any>);

        this.gameStateService.setGameState(gameId, gameState);

        // Record new turn start
        this.analyticsService.recordTurnStart(gameId, newTurn);

        // Start next turn
        return await this.startTurn(gameId);
    }

    /**
     * Apply start-of-turn effects using EffectsService
     * Returns result with damage, actions reduced, cards to discard, and game state if ended
     */
    private async applyStartOfTurnEffects(
        gameId: string,
        playerId: string,
        balanceVersion: string,
    ): Promise<{ result: any; gameEnded: boolean; finishedState?: GameState }> {
        const effectsResult = await this.effectsService.applyStartOfTurnEffects(
            gameId,
            playerId,
            balanceVersion,
        );

        // Check if damage would end the game
        if (effectsResult.result.damage && effectsResult.result.damage > 0) {
            const player = this.gameStateService.getPlayerState(gameId, playerId);
            if (player && player.hp <= effectsResult.result.damage) {
                // This will end the game, but we'll handle it in startTurn
                return { ...effectsResult, gameEnded: false };
            }
        }

        return { ...effectsResult, gameEnded: false };
    }

    /**
     * Discard random cards from player's hand (for burn effect)
     */
    private async discardRandomCards(gameId: string, playerId: string, count: number): Promise<void> {
        const player = this.gameStateService.getPlayerState(gameId, playerId);
        if (!player || !player.hand || player.hand.length === 0) return;

        const gameState = this.gameStateService.getGameState(gameId);
        if (!gameState) return;

        // Discard up to count cards (or all if less available)
        const cardsToDiscard = Math.min(count, player.hand.length);
        const discardedCards: string[] = [];

        for (let i = 0; i < cardsToDiscard; i++) {
            if (player.hand.length === 0) break;
            // Randomly select a card to discard
            const randomIndex = Math.floor(Math.random() * player.hand.length);
            const cardId = player.hand[randomIndex];
            discardedCards.push(cardId);
            player.hand.splice(randomIndex, 1);
        }

        // Move discarded cards to shared discard
        gameState.sharedDiscard.push(...discardedCards);

        // Update player state
        this.gameStateService.updatePlayerState(gameId, playerId, {
            hand: player.hand,
        });
        this.gameStateService.setGameState(gameId, gameState);

        // Record action for analytics
        await this.analyticsService.recordAction(
            gameId,
            gameState.currentTurn || 1,
            playerId,
            player.playerName,
            player.characterId,
            'effect-discard',
            {
                effectType: 'burn',
                cardsDiscarded: discardedCards.length,
            },
        );
    }

    /**
     * Apply end-of-turn effects
     */
    private async applyEndOfTurnEffects(gameId: string, playerId: string): Promise<void> {
        // Placeholder for future end-of-turn effects
    }

    /**
     * Process effect durations and remove expired effects
     * Also reduces cooldowns
     */
    private async processEffectDurations(gameId: string, playerId: string): Promise<void> {
        const player = this.gameStateService.getPlayerState(gameId, playerId);
        if (!player) return;

        // Reduce duration of all effects
        const updatedEffects = player.status.effects
            .map((effect) => ({
                ...effect,
                duration: effect.duration - 1,
            }))
            .filter((effect) => effect.duration > 0);

        // Reduce cooldowns
        const newCooldowns: Record<string, number> = {};
        for (const [skillId, cooldown] of Object.entries(player.status.cooldowns)) {
            if (cooldown > 1) {
                newCooldowns[skillId] = cooldown - 1;
            }
            // If cooldown is 1, it will be 0 next turn, so we don't add it
        }

        // Update player state
        this.gameStateService.updatePlayerState(gameId, playerId, {
            status: {
                ...player.status,
                effects: updatedEffects,
                cooldowns: newCooldowns,
            },
        });
    }

    /**
     * Draw cards from shared deck to hand
     */
    async drawCard(gameId: string, playerId: string, count: number = 1): Promise<string[]> {
        const gameState = this.gameStateService.getGameState(gameId);
        if (!gameState) {
            throw new NotFoundException('Game state not found');
        }

        const player = this.gameStateService.getPlayerState(gameId, playerId);
        if (!player) {
            throw new NotFoundException('Player not found in game');
        }

        const balance = await this.gameBalanceModel.findOne({ isActive: true });
        if (!balance) {
            throw new NotFoundException('No active game balance found');
        }

        const maxHandSize = balance.game.maxHandSize;
        const drawnCards: string[] = [];

        for (let i = 0; i < count; i++) {
            // Check hand size limit
            if (player.hand.length >= maxHandSize) {
                break;
            }

            // If shared deck is empty, shuffle shared discard into shared deck
            if (gameState.sharedDeck.length === 0) {
                if (gameState.sharedDiscard.length === 0) {
                    // No cards available
                    break;
                }
                // Shuffle shared discard into shared deck
                gameState.sharedDeck = [...gameState.sharedDiscard];
                this.shuffleArray(gameState.sharedDeck);
                gameState.sharedDiscard = [];
            }

            // Draw one card from shared deck
            const card = gameState.sharedDeck.shift();
            if (card) {
                drawnCards.push(card);
                player.hand.push(card);
            }
        }

        // Update player state and game state
        this.gameStateService.updatePlayerState(gameId, playerId, {
            hand: player.hand,
        });
        this.gameStateService.setGameState(gameId, gameState);

        return drawnCards;
    }

    /**
     * Play a card from hand
     */
    async playCard(
        gameId: string,
        playerId: string,
        cardId: string,
        targetId?: string,
    ): Promise<ActionResult> {
        const gameState = this.gameStateService.getGameState(gameId);
        if (!gameState) {
            return { success: false, message: 'Game state not found' };
        }

        // Validate it's player's turn
        if (!this.gameStateService.isPlayerTurn(gameId, playerId)) {
            return { success: false, message: 'Not your turn' };
        }

        // Validate actions remaining
        if (gameState.actionsRemaining === undefined || gameState.actionsRemaining <= 0) {
            return { success: false, message: 'No actions remaining' };
        }

        const player = this.gameStateService.getPlayerState(gameId, playerId);
        if (!player) {
            return { success: false, message: 'Player not found' };
        }

        // Check if card is in hand
        if (!player.hand.includes(cardId)) {
            return { success: false, message: 'Card not in hand' };
        }

        // Get card data
        const card = await this.cardsService.findOne(cardId);
        if (!card) {
            return { success: false, message: 'Card not found' };
        }

        // Validate card cost (if applicable)
        // TODO: Implement resource/cost system if needed

        // Get target player name for analytics
        const targetPlayer = targetId ? this.gameStateService.getPlayerState(gameId, targetId) : null;

        // Apply card effects
        let damageDealt = 0;
        let healAmount = 0;
        const effectsApplied: Array<{ type: string; duration: number }> = [];

        if (card.damage || card.targetType === 'all') {
            // Handle special dice-based attacks (Embate Furioso, Rayos Cósmicos)
            if (card.id === 'embate-furioso' || card.id === 'rayos-cosmicos') {
                const gameState = this.gameStateService.getGameState(gameId);
                if (!gameState) {
                    return { success: false, message: 'Game state not found' };
                }
                const numPlayers = gameState.players.filter((p) => p.hp > 0).length;
                let totalDamage = 0;
                const rolls: number[] = [];

                // Roll dice for each player
                for (let i = 0; i < numPlayers; i++) {
                    const roll = Math.floor(Math.random() * 6) + 1;
                    rolls.push(roll);
                    if (roll > 3) {
                        totalDamage += 1;
                    }
                }

                if (totalDamage > 0) {
                    const targets = this.getValidTargets(gameId, playerId, 'all');
                    if (targets.length === 0) {
                        return { success: false, message: 'No valid targets' };
                    }
                    // Each target receives 1 damage per successful roll
                    const damagePerTarget = totalDamage;
                    damageDealt = damagePerTarget * targets.length;
                    const finishedState = await this.applyDamageToMultiple(
                        gameId,
                        targets,
                        damagePerTarget,
                        'card',
                        playerId,
                    );
                    if (finishedState) {
                        return {
                            success: true,
                            message: `Card ${card.name} played (rolls: ${rolls.join(', ')}) - Game ended!`,
                            gameState: finishedState,
                        };
                    }
                } else {
                    return {
                        success: true,
                        message: `Card ${card.name} played (rolls: ${rolls.join(', ')}) - No damage dealt`,
                        gameState: this.gameStateService.getGameState(gameId)!,
                    };
                }
            } else if (card.targetType === 'all' || card.targetType === 'area') {
                // Regular area/all attacks
                const targets = this.getValidTargets(gameId, playerId, card.targetType);
                if (targets.length === 0) {
                    return { success: false, message: 'No valid targets' };
                }
                damageDealt = (card.damage || 0) * targets.length; // Total damage dealt
                const finishedState = await this.applyDamageToMultiple(
                    gameId,
                    targets,
                    card.damage || 0,
                    'card',
                    playerId,
                );
                if (finishedState) {
                    // Game ended due to damage
                    return {
                        success: true,
                        message: `Card ${card.name} played - Game ended!`,
                        gameState: finishedState,
                    };
                }
            } else {
                // Single target attack
                const target = targetId || this.getValidTarget(gameId, playerId, card.targetType);
                if (!target) {
                    return { success: false, message: 'No valid target' };
                }
                damageDealt = card.damage || 0;
                const finishedState = await this.applyDamage(gameId, target, card.damage || 0, 'card', playerId);
                if (finishedState) {
                    // Game ended due to damage
                    return {
                        success: true,
                        message: `Card ${card.name} played - Game ended!`,
                        gameState: finishedState,
                    };
                }
            }
        }

        if (card.heal) {
            healAmount = card.heal;
            await this.applyHeal(gameId, playerId, card.heal);
        }

        if (card.shield) {
            await this.applyShield(gameId, playerId, card.shield);
        }

        if (card.defense) {
            // Defense is applied as temporary stat boost
            // TODO: Implement temporary stat system
        }

        if (card.effects && card.effects.length > 0) {
            effectsApplied.push(...card.effects);
            // Handle area/all effects
            if (card.targetType === 'all' || card.targetType === 'area') {
                const targets = this.getValidTargets(gameId, playerId, card.targetType);
                await this.applyEffectsToMultiple(gameId, targets, card.effects);
            } else {
                // Single target effects
                const target = targetId || playerId;
                await this.applyCardEffects(gameId, target, card.effects);
            }
        }

        // Record action for analytics
        const gameStateForTurn = this.gameStateService.getGameState(gameId);
        await this.analyticsService.recordAction(
            gameId,
            gameStateForTurn?.currentTurn || 1,
            player.playerId,
            player.playerName,
            player.characterId,
            'play-card',
            {
                cardId: card.id,
                cardName: card.name,
                targetId: targetId || undefined,
                targetName: targetPlayer?.playerName,
                damage: damageDealt || undefined,
                heal: healAmount || undefined,
                effectsApplied: effectsApplied.length > 0 ? effectsApplied : undefined,
            },
        );

        // Remove card from hand and add to shared discard
        const newHand = player.hand.filter((id) => id !== cardId);
        gameState.sharedDiscard.push(cardId);

        // Consume action
        gameState.actionsRemaining = (gameState.actionsRemaining || 0) - 1;
        if (gameState.turnState) {
            gameState.turnState.actionsRemaining = gameState.actionsRemaining;
        }

        // Update player state and game state
        this.gameStateService.updatePlayerState(gameId, playerId, {
            hand: newHand,
        });
        this.gameStateService.setGameState(gameId, gameState);

        return {
            success: true,
            message: `Card ${card.name} played`,
            gameState,
        };
    }

    /**
     * Use a skill
     */
    async useSkill(
        gameId: string,
        playerId: string,
        skillId: string,
        targetId?: string,
    ): Promise<ActionResult> {
        const gameState = this.gameStateService.getGameState(gameId);
        if (!gameState) {
            return { success: false, message: 'Game state not found' };
        }

        // Validate it's player's turn
        if (!this.gameStateService.isPlayerTurn(gameId, playerId)) {
            return { success: false, message: 'Not your turn' };
        }

        // Validate actions remaining
        if (gameState.actionsRemaining === undefined || gameState.actionsRemaining <= 0) {
            return { success: false, message: 'No actions remaining' };
        }

        const player = this.gameStateService.getPlayerState(gameId, playerId);
        if (!player) {
            return { success: false, message: 'Player not found' };
        }

        // Get skill data
        const skill = await this.skillsService.findOne(skillId);
        if (!skill) {
            return { success: false, message: 'Skill not found' };
        }

        // Validate skill belongs to player's character
        if (skill.character !== player.characterId) {
            return { success: false, message: 'Skill does not belong to your character' };
        }

        // Validate cooldown
        const cooldownRemaining = player.status.cooldowns[skillId] || 0;
        if (cooldownRemaining > 0) {
            return {
                success: false,
                message: `Skill is on cooldown. ${cooldownRemaining} turn(s) remaining`
            };
        }

        // Validate cost (if applicable)
        // TODO: Implement resource/cost system if needed

        // Get target player name for analytics
        const targetPlayer = targetId ? this.gameStateService.getPlayerState(gameId, targetId) : null;

        // Apply skill effects
        let damageDealt = 0;
        let healAmount = 0;
        const effectsApplied: Array<{ type: string; duration: number }> = [];

        if (skill.damage) {
            const target = targetId || this.getValidTarget(gameId, playerId, skill.targetType);
            if (!target) {
                return { success: false, message: 'No valid target' };
            }
            damageDealt = skill.damage;
            const finishedState = await this.applyDamage(gameId, target, skill.damage, 'skill', playerId);
            if (finishedState) {
                // Game ended due to damage
                return {
                    success: true,
                    message: `Skill ${skill.name} used - Game ended!`,
                    gameState: finishedState,
                };
            }
        }

        if (skill.heal) {
            healAmount = skill.heal;
            await this.applyHeal(gameId, playerId, skill.heal);
        }

        if (skill.shield) {
            await this.applyShield(gameId, playerId, skill.shield);
        }

        if (skill.effects && skill.effects.length > 0) {
            effectsApplied.push(...skill.effects);
            // Handle area/all effects
            if (skill.targetType === 'all' || skill.targetType === 'area') {
                const targets = this.getValidTargets(gameId, playerId, skill.targetType);
                await this.applyEffectsToMultiple(gameId, targets, skill.effects);
            } else {
                // Single target effects (default to self if no target specified)
                const target = targetId || playerId;
                await this.applyCardEffects(gameId, target, skill.effects);
            }
        }

        // Apply cooldown
        const newCooldowns = { ...player.status.cooldowns };
        newCooldowns[skillId] = skill.cooldown;

        // Consume action
        gameState.actionsRemaining = (gameState.actionsRemaining || 0) - 1;
        if (gameState.turnState) {
            gameState.turnState.actionsRemaining = gameState.actionsRemaining;
        }

        // Update player state
        this.gameStateService.updatePlayerState(gameId, playerId, {
            status: {
                ...player.status,
                cooldowns: newCooldowns,
            },
        });
        this.gameStateService.setGameState(gameId, gameState);

        // Record action for analytics
        const gameStateForTurn = this.gameStateService.getGameState(gameId);
        await this.analyticsService.recordAction(
            gameId,
            gameStateForTurn?.currentTurn || 1,
            player.playerId,
            player.playerName,
            player.characterId,
            'use-skill',
            {
                skillId: skill.id,
                skillName: skill.name,
                targetId: targetId || undefined,
                targetName: targetPlayer?.playerName,
                damage: damageDealt || undefined,
                heal: healAmount || undefined,
                effectsApplied: effectsApplied.length > 0 ? effectsApplied : undefined,
            },
        );

        return {
            success: true,
            message: `Skill ${skill.name} used`,
            gameState,
        };
    }

    /**
     * Perform basic attack
     */
    async performAttack(
        gameId: string,
        attackerId: string,
        targetId: string,
    ): Promise<ActionResult> {
        const gameState = this.gameStateService.getGameState(gameId);
        if (!gameState) {
            return { success: false, message: 'Game state not found' };
        }

        // Validate it's attacker's turn
        if (!this.gameStateService.isPlayerTurn(gameId, attackerId)) {
            return { success: false, message: 'Not your turn' };
        }

        // Validate actions remaining
        if (gameState.actionsRemaining === undefined || gameState.actionsRemaining <= 0) {
            return { success: false, message: 'No actions remaining' };
        }

        const attacker = this.gameStateService.getPlayerState(gameId, attackerId);
        const target = this.gameStateService.getPlayerState(gameId, targetId);

        if (!attacker || !target) {
            return { success: false, message: 'Player not found' };
        }

        // Get character stats
        const attackerChar = await this.charactersService.findOne(attacker.characterId);
        if (!attackerChar) {
            return { success: false, message: 'Character not found' };
        }

        // Calculate damage (basic attack power)
        // Shields will be applied in applyDamage() method
        const attackPower = attackerChar.baseStats.attack;
        const damage = attackPower;

        // Apply damage
        const finishedState = await this.applyDamage(gameId, targetId, damage, 'attack', attackerId);
        if (finishedState) {
            // Game ended due to attack
            return {
                success: true,
                message: `Attacked ${target.playerName} for ${damage} damage - Game ended!`,
                gameState: finishedState,
            };
        }

        // Record action for analytics
        const gameStateForTurn = this.gameStateService.getGameState(gameId);
        await this.analyticsService.recordAction(
            gameId,
            gameStateForTurn?.currentTurn || 1,
            attacker.playerId,
            attacker.playerName,
            attacker.characterId,
            'attack',
            {
                targetId: target.playerId,
                targetName: target.playerName,
                damage,
            },
        );

        // Consume action
        gameState.actionsRemaining = (gameState.actionsRemaining || 0) - 1;
        if (gameState.turnState) {
            gameState.turnState.actionsRemaining = gameState.actionsRemaining;
        }
        this.gameStateService.setGameState(gameId, gameState);

        return {
            success: true,
            message: `Attacked ${target.playerName} for ${damage} damage`,
            gameState,
        };
    }

    /**
     * Apply damage to a player
     * Returns GameState if game ended, null otherwise
     * Also handles counterattacks (damage reflection)
     */
    private async applyDamage(
        gameId: string,
        playerId: string,
        damage: number,
        source: string,
        attackerId?: string,
    ): Promise<GameState | null> {
        const player = this.gameStateService.getPlayerState(gameId, playerId);
        if (!player) return null;

        const gameState = this.gameStateService.getGameState(gameId);
        if (!gameState) return null;

        // Get balance for effect configurations
        const balance = await this.gameBalanceModel.findOne({ version: gameState.balanceVersion, isActive: true }).exec();
        if (!balance) return null;

        // Calculate counterattack damage before applying shields
        let counterDamage = 0;
        const counterEffects = player.status.effects.filter((e) => e.type === 'counter');

        for (const counterEffect of counterEffects) {
            const effectConfig = balance.effects['counter'];
            if (!effectConfig) continue;

            // Check if counter requires a roll
            if (effectConfig.requiresRoll && effectConfig.rollThreshold) {
                const roll = Math.floor(Math.random() * 6) + 1;
                if (roll < effectConfig.rollThreshold) {
                    continue; // Counter failed the roll
                }
            }

            // Calculate reflected damage
            const reflectPercentage = counterEffect.value || effectConfig.damageReflected || 0;
            const reflected = Math.floor(damage * reflectPercentage);
            counterDamage += reflected;
        }

        // Apply shields first
        let remainingDamage = damage;
        if (player.status.shields > 0) {
            const shieldAbsorption = Math.min(player.status.shields, remainingDamage);
            player.status.shields -= shieldAbsorption;
            remainingDamage -= shieldAbsorption;
        }

        // Apply remaining damage to HP
        const newHp = Math.max(0, player.hp - remainingDamage);
        this.gameStateService.updatePlayerState(gameId, playerId, {
            hp: newHp,
            status: {
                ...player.status,
                shields: player.status.shields,
            },
        });

        // Apply counterattack damage to attacker (if applicable)
        if (counterDamage > 0 && attackerId && attackerId !== playerId) {
            const attacker = this.gameStateService.getPlayerState(gameId, attackerId);
            if (attacker) {
                // Minimum 1 damage for counterattack
                const finalCounterDamage = Math.max(1, counterDamage);

                // Record counterattack action
                await this.analyticsService.recordAction(
                    gameId,
                    gameState.currentTurn || 1,
                    playerId,
                    player.playerName,
                    player.characterId,
                    'counterattack',
                    {
                        targetId: attackerId,
                        targetName: attacker.playerName,
                        damage: finalCounterDamage,
                        originalDamage: damage,
                    },
                );

                // Apply counterattack damage to attacker
                const counterFinishedState = await this.applyDamage(
                    gameId,
                    attackerId,
                    finalCounterDamage,
                    'counterattack',
                    playerId, // The defender is now the attacker
                );
                if (counterFinishedState) {
                    // Game ended from counterattack
                    return counterFinishedState;
                }
            }
        }

        // Check for defeat
        if (newHp === 0) {
            return await this.checkGameEnd(gameId);
        }

        return null;
    }

    /**
     * Apply healing to a player
     */
    private async applyHeal(gameId: string, playerId: string, heal: number): Promise<void> {
        const player = this.gameStateService.getPlayerState(gameId, playerId);
        if (!player) return;

        const newHp = Math.min(player.maxHp, player.hp + heal);
        this.gameStateService.updatePlayerState(gameId, playerId, {
            hp: newHp,
        });
    }

    /**
     * Apply shield to a player
     */
    private async applyShield(gameId: string, playerId: string, shield: number): Promise<void> {
        const player = this.gameStateService.getPlayerState(gameId, playerId);
        if (!player) return;

        this.gameStateService.updatePlayerState(gameId, playerId, {
            status: {
                ...player.status,
                shields: (player.status.shields || 0) + shield,
            },
        });
    }

    /**
     * Apply card effects to target
     */
    private async applyCardEffects(
        gameId: string,
        targetId: string,
        effects: Array<{ type: string; duration: number; value?: number }>,
    ): Promise<void> {
        const target = this.gameStateService.getPlayerState(gameId, targetId);
        if (!target) return;

        const newEffects = [...target.status.effects, ...effects];
        this.gameStateService.updatePlayerState(gameId, targetId, {
            status: {
                ...target.status,
                effects: newEffects,
            },
        });
    }

    /**
     * Get valid target for card/ability
     */
    private getValidTarget(
        gameId: string,
        playerId: string,
        targetType: 'single' | 'area' | 'self' | 'all',
    ): string | undefined {
        const gameState = this.gameStateService.getGameState(gameId);
        if (!gameState) return undefined;

        if (targetType === 'self') {
            return playerId;
        }

        // For 'single' target, return first opponent
        if (targetType === 'single') {
            const opponents = gameState.players.filter((p) => p.playerId !== playerId && p.hp > 0);
            return opponents[0]?.playerId;
        }

        // For 'area' and 'all', we return undefined and handle it separately
        return undefined;
    }

    /**
     * Get valid targets for area/all attacks
     * Returns array of player IDs that should be affected
     */
    private getValidTargets(
        gameId: string,
        playerId: string,
        targetType: 'single' | 'area' | 'self' | 'all',
    ): string[] {
        const gameState = this.gameStateService.getGameState(gameId);
        if (!gameState) return [];

        if (targetType === 'self') {
            return [playerId];
        }

        if (targetType === 'all') {
            // All opponents (exclude self)
            return gameState.players
                .filter((p) => p.playerId !== playerId && p.hp > 0)
                .map((p) => p.playerId);
        }

        if (targetType === 'area') {
            // All opponents (exclude self) - same as 'all' for now
            // Future: Could implement radius-based area attacks
            return gameState.players
                .filter((p) => p.playerId !== playerId && p.hp > 0)
                .map((p) => p.playerId);
        }

        // For 'single', return empty array (use getValidTarget instead)
        return [];
    }

    /**
     * Apply damage to multiple targets (area/all attacks)
     */
    private async applyDamageToMultiple(
        gameId: string,
        targets: string[],
        damage: number,
        source: string,
        attackerId: string,
    ): Promise<GameState | null> {
        let finishedState: GameState | null = null;

        for (const targetId of targets) {
            const result = await this.applyDamage(gameId, targetId, damage, source, attackerId);
            if (result && !finishedState) {
                finishedState = result; // Game ended
            }
        }

        return finishedState;
    }

    /**
     * Apply effects to multiple targets
     */
    private async applyEffectsToMultiple(
        gameId: string,
        targets: string[],
        effects: Array<{ type: string; duration: number; value?: number }>,
    ): Promise<void> {
        for (const targetId of targets) {
            await this.applyCardEffects(gameId, targetId, effects);
        }
    }

    /**
     * Check if game should end (only one player remaining)
     */
    private async checkGameEnd(gameId: string): Promise<GameState | null> {
        const gameState = this.gameStateService.getGameState(gameId);
        if (!gameState) return null;

        const alivePlayers = gameState.players.filter((p) => p.hp > 0);

        if (alivePlayers.length === 1) {
            // Game over - we have a winner
            return await this.endGame(gameId, alivePlayers[0].playerId);
        } else if (alivePlayers.length === 0) {
            // Draw (shouldn't happen, but handle it)
            return await this.endGame(gameId, undefined);
        }

        return null;
    }

    /**
     * End the game and save results
     */
    private async endGame(gameId: string, winnerId?: string): Promise<GameState> {
        const gameState = this.gameStateService.getGameState(gameId);
        if (!gameState) {
            throw new NotFoundException('Game state not found when ending game');
        }

        const gameSession = await this.lobbyService.getGame(gameId);
        gameSession.phase = 'finished';
        gameSession.finishedAt = new Date();
        await (gameSession.save() as Promise<any>);

        gameState.phase = 'finished';

        // Save game results to MongoDB
        try {
            const savedGame = await this.analyticsService.saveGame(gameState, gameSession);
            console.log(`✅ Game ${gameId} saved to MongoDB with ID: ${savedGame._id}`);
        } catch (error) {
            console.error('Error saving game to MongoDB:', error);
            // Don't throw - game should still end even if save fails
        }

        this.gameStateService.setGameState(gameId, gameState);

        // Return game state for WebSocket notification
        return gameState;
    }

    /**
     * Get current game state
     */
    async getGameState(gameId: string): Promise<GameState> {
        const gameState = this.gameStateService.getGameState(gameId);
        if (!gameState) {
            throw new NotFoundException('Game state not found');
        }
        return gameState;
    }

    private shuffleArray<T>(array: T[]): void {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    private async assignRandomCharacters(gameSession: GameSessionDocument): Promise<void> {
        // Get all active characters
        const allCharacters = await this.charactersService.findAll();
        const availableCharacters = allCharacters.filter((c) => c.isActive);

        if (availableCharacters.length === 0) {
            throw new NotFoundException('No active characters available');
        }

        // Get characters already assigned
        const assignedCharacterIds = gameSession.players
            .filter((p) => p.characterId)
            .map((p) => p.characterId) as string[];

        // Filter out already assigned characters
        const unassignedCharacters = availableCharacters.filter(
            (c) => !assignedCharacterIds.includes(c.id),
        );

        // Shuffle available characters
        const shuffled = [...unassignedCharacters];
        this.shuffleArray(shuffled);

        // Assign random characters to players without one
        let charIndex = 0;
        for (const player of gameSession.players) {
            if (!player.characterId) {
                if (charIndex >= shuffled.length) {
                    // If we run out of unique characters, allow duplicates
                    const randomChar = availableCharacters[Math.floor(Math.random() * availableCharacters.length)];
                    player.characterId = randomChar.id;
                } else {
                    player.characterId = shuffled[charIndex].id;
                    charIndex++;
                }
            }
        }

        // Save updated game session
        await (gameSession.save() as Promise<any>);
    }
}

