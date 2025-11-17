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
    const [isPinned, setIsPinned] = useState(false);
    const [skills, setSkills] = useState<any[]>([]);
    const isAlive = player.hp > 0;

    useEffect(() => {
        if (player.characterId) {
            // Always try to load character data to get the image from database
            // This ensures we have the correct image path if it was updated in admin
            if (!character || character.id !== player.characterId) {
                loadCharacterData();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [player.characterId]); // Load when characterId changes

    const loadCharacterData = async () => {
        try {
            const [charData, charSkills] = await Promise.all([
                apiService.getCharacter(player.characterId),
                apiService.getSkills(player.characterId),
            ]);
            if (charData) {
                setCharacter(charData);
            }
            setSkills(charSkills || []);
        } catch (error) {
            console.error('Error loading character data:', error);
        }
    };

    const handleClick = () => {
        if (selectingTarget && onSelectTarget && isAlive && !isMyPlayer) {
            onSelectTarget(player.playerId);
        } else if (!selectingTarget) {
            // Toggle pinned state on click
            if (isPinned) {
                setIsPinned(false);
                setShowDetails(false);
            } else {
                setIsPinned(true);
                setShowDetails(true);
            }
        }
    };

    const handleMouseEnter = () => {
        // Show details on hover for desktop (if not pinned)
        if (window.innerWidth > 768 && !isPinned) {
            setShowDetails(true);
        }
    };

    const handleMouseLeave = () => {
        // Hide details on mouse leave for desktop (if not pinned)
        if (window.innerWidth > 768 && !isPinned) {
            setShowDetails(false);
        }
    };

    const handleCloseDetails = () => {
        setIsPinned(false);
        setShowDetails(false);
    };

    const getCharacterImagePath = () => {
        if (!player.characterId) return null; // Return null instead of non-existent back image

        // Priority 1: Use character.image from loaded data (if available)
        if (character?.image) {
            // Ensure the path starts with /deck_img
            if (character.image.startsWith('/deck_img')) {
                return character.image;
            }
            // If it's a relative path, prepend /deck_img
            return `/deck_img${character.image.startsWith('/') ? '' : '/'}${character.image}`;
        }

        // Priority 2: Use standard path based on characterId (works immediately)
        // This ensures images show up even before character data is loaded
        return `/deck_img/personajes/${player.characterId}.png`;
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
                    {/* Character Image - Clean, no overlays */}
                    <div className="character-image-wrapper">
                        {getCharacterImagePath() && (
                            <img
                                key={`img-${player.characterId}-${character?.image || player.characterId}`}
                                src={getCharacterImagePath() || undefined}
                                alt={player.characterId || 'Desconocido'}
                                className="character-image"
                                loading="lazy"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    // Prevent infinite loops - use data attribute to track attempts
                                    const attempts = parseInt(target.getAttribute('data-error-attempts') || '0');

                                    if (attempts >= 1) {
                                        // Already tried fallback, stop trying to prevent infinite loops
                                        target.style.display = 'none';
                                        return;
                                    }

                                    target.setAttribute('data-error-attempts', '1');

                                    const currentSrc = target.src;
                                    const standardPath = `/deck_img/personajes/${player.characterId}.png`;

                                    // Only try fallback once if we haven't tried it yet
                                    if (!currentSrc.includes(standardPath)) {
                                        target.src = standardPath;
                                    } else {
                                        // Already tried fallback, hide image
                                        target.style.display = 'none';
                                    }
                                }}
                            />
                        )}
                        {!isAlive && (
                            <div className="defeated-overlay">
                                <span>DERROTADO</span>
                            </div>
                        )}
                    </div>

                    {/* Character Info Section - Below image */}
                    <div className="character-info-section">
                        {/* Name and HP Row */}
                        <div className="character-header-row">
                            <div className="character-name">
                                {player.playerName || player.characterId || 'Desconocido'}
                            </div>
                            <div className="hp-badge">
                                <span className="hp-value">{player.hp}</span>
                                <span className="hp-separator">/</span>
                                <span className="hp-max">{player.maxHp}</span>
                            </div>
                            {isCurrentPlayer && (
                                <div className="turn-badge">
                                    <span className="turn-text">TU TURNO</span>
                                </div>
                            )}
                        </div>

                        {/* Character Stats - Most Important Info */}
                        {character && (
                            <div className="character-stats-compact">
                                <div className="stat-compact-item">
                                    <span className="stat-compact-icon">⚔️</span>
                                    <span className="stat-compact-value">{character.baseStats.attack}</span>
                                </div>
                                <div className="stat-compact-item">
                                    <span className="stat-compact-icon">🛡️</span>
                                    <span className="stat-compact-value">{character.baseStats.defense}</span>
                                </div>
                                <div className="stat-compact-item">
                                    <span className="stat-compact-icon">⚡</span>
                                    <span className="stat-compact-value">{character.baseStats.speed}</span>
                                </div>
                                {player.status.shields > 0 && (
                                    <div className="stat-compact-item stat-compact-shield">
                                        <span className="stat-compact-icon">🛡️</span>
                                        <span className="stat-compact-value">{player.status.shields}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Active Effects - Compact Display */}
                        {player.status.effects.length > 0 && (
                            <div className="character-effects-compact">
                                {player.status.effects.map((effect, index) => {
                                    const effectConfig = getEffectConfig(effect.type);
                                    return (
                                        <div key={index} className={`effect-compact-badge effect-${effect.type}`} title={`${effectConfig.name} (${effect.duration} turnos)`}>
                                            <span className="effect-compact-icon">{effectConfig.icon}</span>
                                            <span className="effect-compact-duration">{effect.duration}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {showDetails && (
                <div className="character-details-panel">
                    <div className="details-header">
                        <h4>{character?.name || player.characterId || 'Desconocido'}</h4>
                        <button className="close-details" onClick={handleCloseDetails}>
                            ×
                        </button>
                    </div>
                    <div className="details-content">
                        {character && (
                            <>
                                {/* Character Preview */}
                                <div className="details-character-preview">
                                    <div
                                        className="details-preview-image"
                                        style={{
                                            backgroundImage: `url(${getCharacterImagePath() || '/deck_img/personajes/back personajes.png'})`,
                                        }}
                                    />
                                    <h5 className="details-preview-name">{character.name}</h5>
                                </div>

                                {/* Character Info - Same format as modal */}
                                <div className="details-character-info">
                                    <div className="details-info-row">
                                        <span className="details-info-label">Vida:</span>
                                        <span className="details-info-value">{player.hp} / {player.maxHp}</span>
                                    </div>
                                    <div className="details-info-row">
                                        <span className="details-info-label">Ataque:</span>
                                        <span className="details-info-value">{character.baseStats.attack}</span>
                                    </div>
                                    <div className="details-info-row">
                                        <span className="details-info-label">Defensa:</span>
                                        <span className="details-info-value">{character.baseStats.defense}</span>
                                    </div>
                                    <div className="details-info-row">
                                        <span className="details-info-label">Velocidad:</span>
                                        <span className="details-info-value">{character.baseStats.speed}</span>
                                    </div>
                                    {character.baseStats.accuracy && (
                                        <div className="details-info-row">
                                            <span className="details-info-label">Acierto:</span>
                                            <span className="details-info-value">{character.baseStats.accuracy}</span>
                                        </div>
                                    )}
                                    {character.baseStats.dodge && (
                                        <div className="details-info-row">
                                            <span className="details-info-label">Esquiva:</span>
                                            <span className="details-info-value">{character.baseStats.dodge}</span>
                                        </div>
                                    )}
                                    {player.status.shields > 0 && (
                                        <div className="details-info-row">
                                            <span className="details-info-label">Escudos:</span>
                                            <span className="details-info-value">{player.status.shields}</span>
                                        </div>
                                    )}
                                    {character.description && (
                                        <div className="details-info-description">
                                            <p>{character.description}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Attributes */}
                                {character.attributes && Object.keys(character.attributes).length > 0 && (
                                    <div className="details-attributes-section">
                                        <div className="details-attributes-label">Atributos Especiales</div>
                                        <div className="details-attributes-list">
                                            {character.attributes.fireResistance !== undefined && character.attributes.fireResistance > 0 && (
                                                <div className="details-attribute-badge">
                                                    <span className="details-attr-icon">🔥</span>
                                                    <span className="details-attr-text">Res. Fuego: {character.attributes.fireResistance}</span>
                                                </div>
                                            )}
                                            {character.attributes.coldResistance !== undefined && character.attributes.coldResistance > 0 && (
                                                <div className="details-attribute-badge">
                                                    <span className="details-attr-icon">❄️</span>
                                                    <span className="details-attr-text">Res. Frío: {character.attributes.coldResistance}</span>
                                                </div>
                                            )}
                                            {character.attributes.physicalResistance !== undefined && character.attributes.physicalResistance > 0 && (
                                                <div className="details-attribute-badge">
                                                    <span className="details-attr-icon">🛡️</span>
                                                    <span className="details-attr-text">Res. Física: {character.attributes.physicalResistance}</span>
                                                </div>
                                            )}
                                            {character.attributes.paralysisImmunity && (
                                                <div className="details-attribute-badge">
                                                    <span className="details-attr-icon">⚡</span>
                                                    <span className="details-attr-text">Inmune a Parálisis</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Skills */}
                                {skills.length > 0 && (
                                    <div className="details-skills-section">
                                        <div className="details-skills-label">Habilidades ({skills.length})</div>
                                        <div className="details-skills-list">
                                            {skills.map((skill) => (
                                                <div key={skill.id} className="details-skill-item">
                                                    <div className="details-skill-header">
                                                        <span className="details-skill-name">{skill.name}</span>
                                                        {skill.cooldown > 0 && (
                                                            <span className="details-skill-cooldown">RE: {skill.cooldown}</span>
                                                        )}
                                                    </div>
                                                    <p className="details-skill-description">{skill.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Active Effects */}
                                {player.status.effects.length > 0 && (
                                    <div className="details-effects-section">
                                        <div className="details-effects-label">Efectos Activos</div>
                                        <div className="details-effects-list">
                                            {player.status.effects.map((effect, index) => {
                                                const effectConfig = getEffectConfig(effect.type);
                                                return (
                                                    <div key={index} className="details-effect-badge">
                                                        <span className="details-effect-icon">{effectConfig.icon}</span>
                                                        <span className="details-effect-text">{effectConfig.name} ({effect.duration})</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Additional Info */}
                                <div className="details-additional-info">
                                    <div className="details-info-row">
                                        <span className="details-info-label">Cartas en mano:</span>
                                        <span className="details-info-value">{player.hand.length}</span>
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

