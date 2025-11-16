import { PlayerGameState } from '../../types/game.types';
import './PlayerStatus.css';

interface PlayerStatusProps {
    player: PlayerGameState;
    isCurrentPlayer: boolean;
    isMyPlayer: boolean;
    onSelectTarget?: (playerId: string) => void;
    selectingTarget?: boolean;
}

function PlayerStatus({
    player,
    isCurrentPlayer,
    isMyPlayer,
    onSelectTarget,
    selectingTarget,
}: PlayerStatusProps) {
    const hpPercentage = (player.hp / player.maxHp) * 100;
    const isAlive = player.hp > 0;

    const handleClick = () => {
        if (selectingTarget && onSelectTarget && isAlive && !isMyPlayer) {
            onSelectTarget(player.playerId);
        }
    };

    return (
        <div
            className={`player-status ${isCurrentPlayer ? 'current-turn' : ''} ${isMyPlayer ? 'my-player' : ''} ${!isAlive ? 'defeated' : ''} ${selectingTarget && isAlive && !isMyPlayer ? 'selectable' : ''}`}
            onClick={handleClick}
        >
            <div className="player-header">
                <h4>{player.playerName}</h4>
                {isMyPlayer && <span className="you-badge">You</span>}
                {isCurrentPlayer && <span className="turn-badge">Turn</span>}
                {!isAlive && <span className="defeated-badge">Defeated</span>}
            </div>

            <div className="hp-bar-container">
                <div className="hp-bar" style={{ width: `${hpPercentage}%` }}>
                    <span className="hp-text">
                        {player.hp} / {player.maxHp} HP
                    </span>
                </div>
            </div>

            {player.status.shields > 0 && (
                <div className="shield-indicator">
                    🛡️ {player.status.shields} Shield
                </div>
            )}

            {player.status.effects.length > 0 && (
                <div className="effects-list">
                    {player.status.effects.map((effect, index) => (
                        <span key={index} className="effect-badge">
                            {effect.type} ({effect.duration})
                        </span>
                    ))}
                </div>
            )}

            <div className="player-stats">
                <span>Hand: {player.hand.length}</span>
            </div>
        </div>
    );
}

export default PlayerStatus;

