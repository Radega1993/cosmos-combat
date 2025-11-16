import { GameState } from '../../types/game.types';
import './GameActions.css';

interface GameActionsProps {
    gameState: GameState;
    currentPlayerId: string | null;
    onEndTurn: () => void;
    onAttack: (targetId: string) => void;
    onPlayCard: (cardId: string, targetId?: string) => void;
    selectingTarget?: string | null;
    setSelectingTarget: (cardId: string | null) => void;
    onTargetSelect?: (targetId: string) => void;
}

function GameActions({
    gameState,
    currentPlayerId,
    onEndTurn,
    onAttack: _onAttack,
    onPlayCard: _onPlayCard,
    selectingTarget,
    setSelectingTarget,
    onTargetSelect: _onTargetSelect,
}: GameActionsProps) {
    const isMyTurn = gameState.currentPlayerId === currentPlayerId;
    const actionsRemaining = gameState.actionsRemaining || 0;
    const canAct = isMyTurn && actionsRemaining > 0;

    if (!isMyTurn) {
        return (
            <div className="game-actions">
                <div className="waiting-message">
                    Waiting for {gameState.players.find((p) => p.playerId === gameState.currentPlayerId)?.playerName || 'opponent'}...
                </div>
            </div>
        );
    }

    const handleAttackClick = () => {
        if (!canAct) return;
        setSelectingTarget('attack');
    };

    return (
        <div className="game-actions">
            {selectingTarget && (
                <div className="target-selection">
                    <p>Select a target:</p>
                    <button onClick={() => setSelectingTarget(null)} className="cancel-button">
                        Cancel
                    </button>
                </div>
            )}

            <div className="actions-header">
                <h3>Your Actions</h3>
                <span className="actions-remaining">Actions: {actionsRemaining}</span>
            </div>

            <div className="action-buttons">
                <button
                    onClick={handleAttackClick}
                    disabled={!canAct}
                    className="action-button attack-button"
                >
                    ⚔️ Basic Attack
                </button>
                <button
                    onClick={onEndTurn}
                    className="action-button end-turn-button"
                >
                    ✓ End Turn
                </button>
            </div>
        </div>
    );
}

export default GameActions;

