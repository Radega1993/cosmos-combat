import { PlayerGameState } from '../../types/game.types';
import './PlayerStatus.css';

function getEffectConfig(effectType: string) {
    const configs: Record<string, { name: string; icon: string; description: string }> = {
        burn: {
            name: 'Quemadura',
            icon: '🔥',
            description: 'Descartas una carta al inicio de tu turno',
        },
        paralysis: {
            name: 'Parálisis',
            icon: '⚡',
            description: 'Pierdes 1 punto de acción. Puedes curar con una tirada de 6',
        },
        freeze: {
            name: 'Congelación',
            icon: '❄️',
            description: 'Pierdes 1 punto de acción. Puedes curar con una tirada de 6',
        },
        counter: {
            name: 'Contraataque',
            icon: '⚔️',
            description: 'Refleja daño al atacante',
        },
    };

    return (
        configs[effectType] || {
            name: effectType,
            icon: '✨',
            description: `Efecto: ${effectType}`,
        }
    );
}

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
                <div className="shield-indicator" title="Escudo: Absorbe daño antes de que afecte los puntos de vida">
                    🛡️ {player.status.shields} Escudo
                </div>
            )}

            {player.status.effects.some((e) => e.type === 'counter') && (
                <div className="counter-indicator" title="Contraataque: Refleja daño al atacante">
                    ⚔️ Contraataque Activo
                </div>
            )}

            {player.status.effects.length > 0 && (
                <div className="effects-list">
                    {player.status.effects.map((effect, index) => {
                        const effectConfig = getEffectConfig(effect.type);
                        return (
                            <span
                                key={index}
                                className={`effect-badge effect-${effect.type}`}
                                title={effectConfig.description}
                            >
                                {effectConfig.icon} {effectConfig.name} ({effect.duration})
                            </span>
                        );
                    })}
                </div>
            )}

            <div className="player-stats">
                <span>Hand: {player.hand.length}</span>
            </div>
        </div>
    );
}

export default PlayerStatus;

