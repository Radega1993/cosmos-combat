import { GameState } from '../../types/game.types';
import './TurnIndicator.css';

interface TurnIndicatorProps {
    gameState: GameState;
    currentPlayerId: string | null;
}

function TurnIndicator({ gameState, currentPlayerId }: TurnIndicatorProps) {
    const isMyTurn = gameState.currentPlayerId === currentPlayerId;
    const currentPlayer = gameState.players.find((p) => p.playerId === gameState.currentPlayerId);
    const actionsRemaining = gameState.actionsRemaining || 0;

    return (
        <div className={`turn-indicator ${isMyTurn ? 'my-turn' : ''}`}>
            <div className="turn-info">
                <h3>Turn {gameState.currentTurn || 1}</h3>
                <div className="current-player">
                    <span className="player-name">
                        {currentPlayer?.playerName || 'Unknown'}
                        {isMyTurn && <span className="you-badge">(You)</span>}
                    </span>
                </div>
                {isMyTurn && (
                    <div className="actions-info">
                        <span className="actions-remaining">
                            Actions: {actionsRemaining} / {gameState.turnState?.actionsPerTurn || 2}
                        </span>
                    </div>
                )}
            </div>
            {gameState.turnState && (
                <div className="turn-phase">
                    Phase: <span className="phase-name">{gameState.turnState.phase}</span>
                </div>
            )}
        </div>
    );
}

export default TurnIndicator;

