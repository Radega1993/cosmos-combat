import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socketService } from '../services/socket.service';
import { apiService } from '../services/api.service';
import { useLobbyStore } from '../store/lobby.store';
import { useGameStore } from '../store/game.store';
import CharacterSelector from '../components/CharacterSelector/CharacterSelector';
import Hand from '../components/Hand/Hand';
import SkillsList from '../components/SkillsList/SkillsList';
import TurnIndicator from '../components/TurnIndicator/TurnIndicator';
import PlayerStatus from '../components/PlayerStatus/PlayerStatus';
import GameActions from '../components/GameActions/GameActions';
import GameFinished from '../components/GameFinished/GameFinished';
import { GameState, Skill, PlayerGameState } from '../types/game.types';
import './GamePage.css';

function GamePage() {
    const { gameId } = useParams<{ gameId: string }>();
    const navigate = useNavigate();
    const { currentGame, currentPlayerId, setCurrentGame, setError } = useLobbyStore();
    const { setCharacters, setHand, hand } = useGameStore();
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [selectingTarget, setSelectingTarget] = useState<string | null>(null);
    const [skills, setSkills] = useState<Skill[]>([]);

    useEffect(() => {
        if (!gameId) {
            navigate('/');
            return;
        }

        // Setup event handlers
        socketService.onPlayerJoined((data) => {
            setCurrentGame(data.game);
        });

        socketService.onPlayerLeft((data) => {
            setCurrentGame(data.game);
        });

        socketService.onCharacterSelected((data) => {
            setCurrentGame(data.game);
        });

        socketService.onPlayerReady((data) => {
            setCurrentGame(data.game);
        });

        socketService.onGameClosed(() => {
            setCurrentGame(null);
            navigate('/');
        });

        socketService.onError((error) => {
            setError(error.message);
        });

        socketService.onGameStarted((data) => {
            setGameState(data.gameState);
            // Update game phase
            setCurrentGame((prev) => prev ? { ...prev, phase: 'playing' } : null);
            // Load cards for hand
            if (data.gameState?.players) {
                const currentPlayer = data.gameState.players.find(
                    (p: any) => p.playerId === currentPlayerId
                );
                if (currentPlayer?.hand) {
                    loadCardsForHand(currentPlayer.hand);
                }
            }
        });

        socketService.onTurnStarted((data) => {
            setGameState(data.gameState);
            // Update hand if it's our turn
            if (data.gameState?.players) {
                const currentPlayer = data.gameState.players.find(
                    (p: any) => p.playerId === currentPlayerId
                );
                if (currentPlayer?.hand) {
                    loadCardsForHand(currentPlayer.hand);
                }
                // Load skills for current player's character
                if (currentPlayer?.characterId) {
                    loadSkills(currentPlayer.characterId);
                }
            }
        });

        socketService.onTurnEnded((data) => {
            setGameState(data.gameState);
        });

        socketService.onActionPerformed((data) => {
            setGameState(data.gameState);
            setSelectingTarget(null);
            // Update hand
            if (data.gameState?.players) {
                const currentPlayer = data.gameState.players.find(
                    (p: any) => p.playerId === currentPlayerId
                );
                if (currentPlayer?.hand) {
                    loadCardsForHand(currentPlayer.hand);
                }
                // Reload skills to update cooldowns
                if (currentPlayer?.characterId) {
                    loadSkills(currentPlayer.characterId);
                }
            }
        });

        socketService.onGameState((data) => {
            setGameState(data.gameState);
            // Update hand for current player - always sync with latest gameState
            if (data.gameState && currentPlayerId) {
                const currentPlayer = data.gameState.players.find((p: PlayerGameState) => p.playerId === currentPlayerId);
                if (currentPlayer?.hand) {
                    // Force reload to ensure sync
                    loadCardsForHand([...currentPlayer.hand]); // Create new array to force update
                } else {
                    setHand([]); // Clear hand if player not found
                }
                // Load skills for current player's character
                if (currentPlayer?.characterId) {
                    loadSkills(currentPlayer.characterId);
                }
            }
        });

        socketService.onGameFinished((data) => {
            setGameState(data.gameState);
            setCurrentGame((prev) => prev ? { ...prev, phase: 'finished' } : null);
        });

        // Load characters
        loadCharacters();

        return () => {
            socketService.off('lobby:player-joined');
            socketService.off('lobby:player-left');
            socketService.off('lobby:character-selected');
            socketService.off('lobby:player-ready');
            socketService.off('lobby:game-closed');
            socketService.off('game:started');
            socketService.off('game:turn-started');
            socketService.off('game:turn-ended');
            socketService.off('game:action-performed');
            socketService.off('game:state');
            socketService.off('game:finished');
            socketService.off('error');
        };
    }, [gameId, navigate, setCurrentGame, setError, currentPlayerId]);

    const loadCharacters = async () => {
        try {
            const chars = await apiService.getCharacters();
            setCharacters(chars);
        } catch (error) {
            console.error('Error loading characters:', error);
        }
    };

    const loadSkills = async (characterId: string) => {
        try {
            const characterSkills = await apiService.getSkills(characterId);
            setSkills(characterSkills || []);
        } catch (error) {
            console.error('Error loading skills:', error);
            setSkills([]);
        }
    };

    const loadCardsForHand = async (cardIds: string[]) => {
        try {
            if (!cardIds || cardIds.length === 0) {
                setHand([]);
                return;
            }
            // Only load cards if the count matches to avoid stale data
            const cards = await apiService.getCardsByIds(cardIds);
            // Verify we got the right number of cards
            if (cards.length === cardIds.length) {
                setHand(cards);
            } else {
                console.warn(`Card count mismatch: expected ${cardIds.length}, got ${cards.length}`);
                setHand(cards); // Still set it, but log the warning
            }
        } catch (error) {
            console.error('Error loading cards:', error);
            setHand([]);
        }
    };

    const handleStartGame = () => {
        if (gameId) {
            socketService.startGame(gameId);
        }
    };

    const canStartGame = () => {
        if (!currentGame) return false;
        const allReady = currentGame.players.every((p) => p.isReady);
        const minPlayers = currentGame.players.length >= currentGame.minPlayers;

        // In select mode, all players must have selected a character
        if (currentGame.gameMode === 'select') {
            const allHaveCharacters = currentGame.players.every((p) => p.characterId);
            return allHaveCharacters && allReady && minPlayers && currentGame.phase === 'lobby';
        }

        // In random mode, just need all ready
        return allReady && minPlayers && currentGame.phase === 'lobby';
    };

    const handleLeaveGame = () => {
        if (gameId && currentPlayerId) {
            socketService.leaveGame(gameId, currentPlayerId);
            setCurrentGame(null);
            navigate('/');
        }
    };

    const handleEndTurn = () => {
        if (gameId && currentPlayerId) {
            socketService.endTurn(gameId, currentPlayerId);
        }
    };

    const handleAttack = (targetId: string) => {
        if (gameId && currentPlayerId) {
            socketService.attack(gameId, currentPlayerId, targetId);
            setSelectingTarget(null);
        }
    };

    const handlePlayCard = (cardId: string, targetId?: string) => {
        if (gameId && currentPlayerId) {
            // Check if card needs target selection
            const card = hand.find((c) => c.id === cardId);
            if (card && card.targetType === 'single' && !targetId) {
                setSelectingTarget(cardId);
                return;
            }
            // For area/all attacks, no target selection needed
            socketService.playCard(gameId, currentPlayerId, cardId, targetId);
            setSelectingTarget(null);
        }
    };

    const handleUseSkill = (skill: Skill, targetId?: string) => {
        if (gameId && currentPlayerId) {
            // Check if skill needs target selection
            if (skill.targetType === 'single' && !targetId) {
                setSelectingTarget(skill.id);
                return;
            }
            // For area/all attacks, no target selection needed
            socketService.useSkill(gameId, currentPlayerId, skill.id, targetId);
            setSelectingTarget(null);
        }
    };

    const handleTargetSelect = (targetId: string) => {
        if (selectingTarget === 'attack') {
            handleAttack(targetId);
        } else if (selectingTarget && typeof selectingTarget === 'string') {
            // Check if it's a skill ID
            const skill = skills.find((s) => s.id === selectingTarget);
            if (skill) {
                handleUseSkill(skill, targetId);
            } else {
                // It's a card ID
                handlePlayCard(selectingTarget, targetId);
            }
        }
        setSelectingTarget(null);
    };

    // Load skills when gameState changes and we have a character
    useEffect(() => {
        if (gameState && currentPlayerId) {
            const currentPlayer = gameState.players.find((p) => p.playerId === currentPlayerId);
            if (currentPlayer?.characterId) {
                loadSkills(currentPlayer.characterId);
            }
        }
    }, [gameState?.players, currentPlayerId]);

    if (!currentGame) {
        return (
            <div className="game-page">
                <div className="loading">Loading game...</div>
            </div>
        );
    }

    // Get current player from game
    const currentPlayer = currentGame.players.find((p) => p.playerId === currentPlayerId);

    return (
        <div className="game-page">
            <div className="game-header">
                <h1>Cosmos Combat</h1>
                <div className="game-info">
                    <span>Game ID: {currentGame.gameId}</span>
                    <span>Phase: {currentGame.phase}</span>
                    <span>Players: {currentGame.players.length}/{currentGame.maxPlayers}</span>
                </div>
                <button onClick={handleLeaveGame} className="leave-button">
                    Leave Game
                </button>
            </div>

            <div className="game-content">
                {currentGame.phase === 'playing' && gameState ? (
                    <>
                        <div className="game-board">
                            <TurnIndicator gameState={gameState} currentPlayerId={currentPlayerId} />

                            <div className="shared-deck-info">
                                <div className="shared-deck-stat">
                                    <span className="stat-label">Shared Deck:</span>
                                    <span className="stat-value">{gameState.sharedDeck?.length || 0}</span>
                                </div>
                                <div className="shared-deck-stat">
                                    <span className="stat-label">Shared Discard:</span>
                                    <span className="stat-value">{gameState.sharedDiscard?.length || 0}</span>
                                </div>
                            </div>

                            <div className="players-status">
                                <h2>Players</h2>
                                {gameState.players.map((player) => (
                                    <PlayerStatus
                                        key={player.playerId}
                                        player={player}
                                        isCurrentPlayer={player.playerId === gameState.currentPlayerId}
                                        isMyPlayer={player.playerId === currentPlayerId}
                                        onSelectTarget={handleTargetSelect}
                                        selectingTarget={selectingTarget ? true : false}
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="players-list">
                        <h2>Players</h2>
                        {currentGame.players.map((player) => (
                            <div key={player.playerId} className="player-card">
                                <div className="player-info">
                                    <span className="player-name">{player.playerName}</span>
                                    {player.characterId && <span className="character-id">{player.characterId}</span>}
                                    {player.isReady && <span className="ready-badge">Ready</span>}
                                </div>
                                {player.playerId === currentPlayerId && <span className="you-badge">You</span>}
                            </div>
                        ))}
                    </div>
                )}

                <div className="game-actions">
                    {currentGame.phase === 'lobby' && (
                        <div className="lobby-phase">
                            {currentGame.gameMode === 'select' && currentPlayer && !currentPlayer.characterId && (
                                <div className="character-selection-section">
                                    <CharacterSelector
                                        gameId={currentGame.gameId}
                                        playerId={currentPlayerId || ''}
                                    />
                                </div>
                            )}
                            {currentGame.gameMode === 'select' && currentPlayer && currentPlayer.characterId && (
                                <div className="ready-section">
                                    <p>Character selected: {currentPlayer.characterId}</p>
                                    <button
                                        onClick={() =>
                                            socketService.setReady(
                                                currentGame.gameId,
                                                currentPlayerId || '',
                                                !currentPlayer.isReady
                                            )
                                        }
                                        className={`ready-button ${currentPlayer.isReady ? 'ready' : ''}`}
                                    >
                                        {currentPlayer.isReady ? '✓ Ready' : 'Mark as Ready'}
                                    </button>
                                </div>
                            )}
                            {currentGame.gameMode === 'random' && currentPlayer && (
                                <div className="ready-section">
                                    <p>🎲 Random character mode - Characters will be assigned automatically when the game starts</p>
                                    <button
                                        onClick={() =>
                                            socketService.setReady(
                                                currentGame.gameId,
                                                currentPlayerId || '',
                                                !currentPlayer.isReady
                                            )
                                        }
                                        className={`ready-button ${currentPlayer.isReady ? 'ready' : ''}`}
                                    >
                                        {currentPlayer.isReady ? '✓ Ready' : 'Mark as Ready'}
                                    </button>
                                </div>
                            )}
                            {canStartGame() && currentPlayer && currentPlayer.playerId === currentGame.players[0]?.playerId && (
                                <div className="start-game-section">
                                    <button onClick={handleStartGame} className="start-game-button">
                                        Start Game
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    {currentGame.phase === 'finished' && gameState && (
                        <GameFinished gameState={gameState} currentPlayerId={currentPlayerId} />
                    )}
                    {currentGame.phase === 'playing' && gameState && (
                        <div className="playing-phase">
                            <GameActions
                                gameState={gameState}
                                currentPlayerId={currentPlayerId}
                                onEndTurn={handleEndTurn}
                                onAttack={handleAttack}
                                onPlayCard={handlePlayCard}
                                selectingTarget={selectingTarget}
                                setSelectingTarget={setSelectingTarget}
                                onTargetSelect={handleTargetSelect}
                            />

                            {hand.length > 0 && (
                                <Hand
                                    cards={hand}
                                    onCardClick={(card) => {
                                        if (gameState.currentPlayerId === currentPlayerId && (gameState.actionsRemaining || 0) > 0) {
                                            handlePlayCard(card.id);
                                        }
                                    }}
                                />
                            )}

                            {gameState && currentPlayerId && (() => {
                                const currentPlayer = gameState.players.find((p) => p.playerId === currentPlayerId);
                                const playerCooldowns = currentPlayer?.status.cooldowns || {};
                                return skills.length > 0 && (
                                    <SkillsList
                                        skills={skills}
                                        cooldowns={playerCooldowns}
                                        onSkillClick={(skill) => {
                                            if (gameState.currentPlayerId === currentPlayerId && (gameState.actionsRemaining || 0) > 0) {
                                                handleUseSkill(skill);
                                            }
                                        }}
                                        disabled={gameState.currentPlayerId !== currentPlayerId || (gameState.actionsRemaining || 0) <= 0}
                                    />
                                );
                            })()}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default GamePage;

