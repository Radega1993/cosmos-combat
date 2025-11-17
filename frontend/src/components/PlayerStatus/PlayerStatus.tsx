import { useState, useEffect } from 'react';
import { PlayerGameState, Character } from '../../types/game.types';
import { apiService } from '../../services/api.service';
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
    const [character, setCharacter] = useState<Character | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [skills, setSkills] = useState<any[]>([]);
    const isAlive = player.hp > 0;

    useEffect(() => {
        if (player.characterId && !character) {
            loadCharacterData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [player.characterId]); // Only load once when characterId changes

    const loadCharacterData = async () => {
        try {
            const [charData, charSkills] = await Promise.all([
                apiService.getCharacter(player.characterId),
                apiService.getSkills(player.characterId),
            ]);
            setCharacter(charData);
            setSkills(charSkills || []);
        } catch (error) {
            console.error('Error loading character data:', error);
        }
    };

    const handleClick = () => {
        if (selectingTarget && onSelectTarget && isAlive && !isMyPlayer) {
            onSelectTarget(player.playerId);
        } else if (!selectingTarget) {
            // Toggle details on mobile
            if (window.innerWidth <= 768) {
                setShowDetails(!showDetails);
            }
        }
    };

    const handleMouseEnter = () => {
        // Show details on hover for desktop
        if (window.innerWidth > 768) {
            setShowDetails(true);
        }
    };

    const handleMouseLeave = () => {
        // Hide details on mouse leave for desktop
        if (window.innerWidth > 768) {
            setShowDetails(false);
        }
    };

    const getCharacterImagePath = () => {
        if (!player.characterId) return '/deck_img/personajes/back personajes.png';
        // Use character image if available, otherwise use standard path based on characterId
        // Character IDs: strike, blaze, shadow, thunder, frost, ironclad
        if (character?.image) {
            // If image path starts with /deck_img, use it as is, otherwise prepend it
            return character.image.startsWith('/deck_img')
                ? character.image
                : `/deck_img${character.image.startsWith('/') ? '' : '/'}${character.image}`;
        }
        // Fallback to standard path - this works immediately without waiting for character data
        const imagePath = `/deck_img/personajes/${player.characterId}.png`;
        return imagePath;
    };

    return (
        <>
            <div
                className={`player-status ${isCurrentPlayer ? 'current-turn' : ''} ${isMyPlayer ? 'my-player' : ''} ${!isAlive ? 'defeated' : ''} ${selectingTarget && isAlive && !isMyPlayer ? 'selectable' : ''}`}
                onClick={handleClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div className="character-visual">
                    <div className="character-image-wrapper">
                        <img
                            src={getCharacterImagePath()}
                            alt={player.characterId || 'Desconocido'}
                            className="character-image"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = '/deck_img/personajes/back personajes.png';
                            }}
                        />
                        <div className="hp-overlay">
                            <div className="hp-badge">
                                <span className="hp-value">{player.hp}</span>
                                <span className="hp-separator">/</span>
                                <span className="hp-max">{player.maxHp}</span>
                            </div>
                        </div>
                        {isCurrentPlayer && (
                            <div className="turn-indicator-overlay">
                                <span className="turn-text">TU TURNO</span>
                            </div>
                        )}
                        {!isAlive && (
                            <div className="defeated-overlay">
                                <span>DERROTADO</span>
                            </div>
                        )}
                    </div>
                    <div className="character-name">
                        {player.playerName || player.characterId || 'Desconocido'}
                    </div>
                    {player.status.shields > 0 && (
                        <div className="shield-badge">
                            🛡️ {player.status.shields}
                        </div>
                    )}
                </div>
            </div>
            {showDetails && (
                <div className="character-details-panel">
                    <div className="details-header">
                        <h4>{character?.name || player.characterId || 'Desconocido'}</h4>
                        <button className="close-details" onClick={() => setShowDetails(false)}>
                            ×
                        </button>
                    </div>
                    <div className="details-content">
                        {character && (
                            <>
                                <div className="details-section">
                                    <h5>Estadísticas Base</h5>
                                    <div className="stats-grid">
                                        {character.baseStats.attack !== undefined && (
                                            <div className="stat-item">
                                                <span className="stat-label">Ataque</span>
                                                <span className="stat-value">{character.baseStats.attack}</span>
                                            </div>
                                        )}
                                        {character.baseStats.defense !== undefined && (
                                            <div className="stat-item">
                                                <span className="stat-label">Defensa</span>
                                                <span className="stat-value">{character.baseStats.defense}</span>
                                            </div>
                                        )}
                                        {character.baseStats.speed !== undefined && (
                                            <div className="stat-item">
                                                <span className="stat-label">Velocidad</span>
                                                <span className="stat-value">{character.baseStats.speed}</span>
                                            </div>
                                        )}
                                        {character.baseStats.accuracy && (
                                            <div className="stat-item">
                                                <span className="stat-label">Acierto</span>
                                                <span className="stat-value">{character.baseStats.accuracy}</span>
                                            </div>
                                        )}
                                        {character.baseStats.dodge && (
                                            <div className="stat-item">
                                                <span className="stat-label">Esquiva</span>
                                                <span className="stat-value">{character.baseStats.dodge}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {character.attributes && Object.keys(character.attributes).length > 0 && (
                                    <div className="details-section">
                                        <h5>Atributos</h5>
                                        <div className="attributes-list">
                                            {character.attributes.fireResistance !== undefined && (
                                                <div className="attribute-item">
                                                    <span className="attribute-icon">🔥</span>
                                                    <span>Resistencia al fuego: {character.attributes.fireResistance}</span>
                                                </div>
                                            )}
                                            {character.attributes.coldResistance !== undefined && (
                                                <div className="attribute-item">
                                                    <span className="attribute-icon">❄️</span>
                                                    <span>Resistencia al frío: {character.attributes.coldResistance}</span>
                                                </div>
                                            )}
                                            {character.attributes.physicalResistance !== undefined && (
                                                <div className="attribute-item">
                                                    <span className="attribute-icon">🛡️</span>
                                                    <span>Resistencia física: {character.attributes.physicalResistance}</span>
                                                </div>
                                            )}
                                            {character.attributes.paralysisImmunity && (
                                                <div className="attribute-item">
                                                    <span className="attribute-icon">⚡</span>
                                                    <span>Inmunidad a parálisis</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {skills.length > 0 && (
                                    <div className="details-section">
                                        <h5>Habilidades</h5>
                                        <div className="skills-list">
                                            {skills.map((skill) => (
                                                <div key={skill.id} className="skill-item">
                                                    <div className="skill-name">{skill.name}</div>
                                                    <div className="skill-description">{skill.description}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {player.status.effects.length > 0 && (
                                    <div className="details-section">
                                        <h5>Efectos Activos</h5>
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
                                    </div>
                                )}

                                <div className="details-section">
                                    <div className="player-info">
                                        <span>Cartas en mano: {player.hand.length}</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default PlayerStatus;

