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
                    Esperando a {gameState.players.find((p) => p.playerId === gameState.currentPlayerId)?.playerName || 'oponente'}...
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
                    <p>Selecciona un objetivo:</p>
                    <button onClick={() => setSelectingTarget(null)} className="cancel-button">
                        Cancelar
                    </button>
                </div>
            )}

            <div className="actions-header">
                <h3>Tus Acciones</h3>
                <span className="actions-remaining">Acciones: {actionsRemaining}</span>
            </div>

            <div className="action-buttons">
                <button
                    onClick={handleAttackClick}
                    disabled={!canAct}
                    className="action-button attack-button"
                >
                    ⚔️ Ataque Básico
                </button>
                <button
                    onClick={onEndTurn}
                    className="action-button end-turn-button"
                >
                    ✓ Finalizar Turno
                </button>
            </div>
        </div>
    );
}

export default GameActions;

