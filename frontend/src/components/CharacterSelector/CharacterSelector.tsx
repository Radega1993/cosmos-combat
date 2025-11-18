import { useEffect, useState } from 'react';
import { apiService } from '../../services/api.service';
import { socketService } from '../../services/socket.service';
import { Character, Skill } from '../../types/game.types';
import { useLobbyStore } from '../../store/lobby.store';
import './CharacterSelector.css';

interface CharacterSelectorProps {
    gameId: string;
    playerId: string;
}

interface CharacterWithSkills extends Character {
    skillsData?: Skill[];
}

function CharacterSelector({ gameId, playerId }: CharacterSelectorProps) {
    const [characters, setCharacters] = useState<CharacterWithSkills[]>([]);
    const [loading, setLoading] = useState(true);
    const [characterToConfirm, setCharacterToConfirm] = useState<Character | null>(null);
    const { currentGame } = useLobbyStore();
    const currentPlayer = currentGame?.players.find((p) => p.playerId === playerId);
    const selectedCharacterId = currentPlayer?.characterId;

    useEffect(() => {
        loadCharacters();
    }, []);

    const loadCharacters = async () => {
        try {
            const chars = await apiService.getCharacters();
            // Load skills for each character
            const charactersWithSkills = await Promise.all(
                chars.map(async (char) => {
                    try {
                        const skills = await apiService.getSkills(char.id);
                        return { ...char, skillsData: skills || [] };
                    } catch (error) {
                        console.error(`Error loading skills for ${char.id}:`, error);
                        return { ...char, skillsData: [] };
                    }
                })
            );
            setCharacters(charactersWithSkills);
        } catch (error) {
            console.error('Error loading characters:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCharacterClick = (character: Character) => {
        if (selectedCharacterId) {
            return; // Already selected
        }
        const selectedCharacters = getSelectedCharacters();
        if (selectedCharacters.includes(character.id)) {
            return; // Already taken
        }
        setCharacterToConfirm(character);
    };

    const handleConfirmSelection = () => {
        if (characterToConfirm) {
            socketService.selectCharacter(gameId, playerId, characterToConfirm.id);
            setCharacterToConfirm(null);
        }
    };

    const handleCancelSelection = () => {
        setCharacterToConfirm(null);
    };

    const getSelectedCharacters = () => {
        if (!currentGame) return [];
        return currentGame.players
            .map((p) => p.characterId)
            .filter((id): id is string => !!id);
    };

    if (loading) {
        return <div className="character-selector-loading">Cargando personajes...</div>;
    }

    const selectedCharacters = getSelectedCharacters();

    return (
        <div className="character-selector">
            <div className="selector-background-effects">
                <div className="particle-field"></div>
            </div>
            <div className="selector-header">
                <h1 className="selector-title">SELECCIÓN DE PERSONAJE</h1>
                <p className="selector-subtitle">Elige tu guerrero cósmico</p>
            </div>
            <div className="characters-grid">
                {characters.map((character) => {
                    const isSelected = selectedCharacterId === character.id;
                    const isTaken = selectedCharacters.includes(character.id) && !isSelected;
                    const isMySelection = isSelected && currentPlayer?.playerId === playerId;

                    return (
                        <div
                            key={character.id}
                            className={`full-art-card character-card ${isSelected ? 'selected' : ''} ${isTaken ? 'taken' : ''} ${isMySelection ? 'my-selection' : ''}`}
                            onClick={() => !isSelected && !isTaken && handleCharacterClick(character)}
                        >
                            {/* Character Preview - Same format as modal */}
                            <div className="card-character-preview">
                                <div
                                    className="card-preview-image"
                                    style={{
                                        backgroundImage: `url(${character.image
                                            ? (character.image.startsWith('/deck_img')
                                                ? character.image
                                                : `/deck_img/personajes/${character.image}`)
                                            : `/deck_img/personajes/${character.id}.png`})`,
                                    }}
                                />
                                <h4 className="card-preview-name">{character.name}</h4>
                            </div>

                            {/* Character Info - Same format as modal */}
                            <div className="card-character-info">
                                <div className="card-info-row">
                                    <span className="card-info-label">Vida:</span>
                                    <span className="card-info-value">{character.maxHp} HP</span>
                                </div>
                                <div className="card-info-note">
                                    <small>El ataque básico siempre hace 1 punto de daño</small>
                                </div>

                                {/* Character Bonuses/Attributes */}
                                {(character.baseStats.dodge || character.baseStats.accuracy || character.attributes) && (
                                    <div className="card-attributes-section">
                                        <div className="card-attributes-label">Atributos Especiales</div>
                                        <div className="card-attributes-list">
                                            {character.baseStats.dodge !== undefined && character.baseStats.dodge > 0 && (
                                                <div className="card-attribute-badge">
                                                    <span className="card-attr-icon">💨</span>
                                                    <span className="card-attr-text">Esquiva +{character.baseStats.dodge}</span>
                                                </div>
                                            )}
                                            {character.baseStats.accuracy !== undefined && character.baseStats.accuracy > 0 && (
                                                <div className="card-attribute-badge">
                                                    <span className="card-attr-icon">🎯</span>
                                                    <span className="card-attr-text">Acierto +{character.baseStats.accuracy}</span>
                                                </div>
                                            )}
                                            {character.attributes?.fireResistance !== undefined && character.attributes.fireResistance > 0 && (
                                                <div className="card-attribute-badge">
                                                    <span className="card-attr-icon">🔥</span>
                                                    <span className="card-attr-text">Resistencia al Fuego +{character.attributes.fireResistance}</span>
                                                </div>
                                            )}
                                            {character.attributes?.coldResistance !== undefined && character.attributes.coldResistance > 0 && (
                                                <div className="card-attribute-badge">
                                                    <span className="card-attr-icon">❄️</span>
                                                    <span className="card-attr-text">Resistencia al Frío +{character.attributes.coldResistance}</span>
                                                </div>
                                            )}
                                            {character.attributes?.physicalResistance !== undefined && character.attributes.physicalResistance > 0 && (
                                                <div className="card-attribute-badge">
                                                    <span className="card-attr-icon">🛡️</span>
                                                    <span className="card-attr-text">Resistencia a Daño Físico +{character.attributes.physicalResistance}</span>
                                                </div>
                                            )}
                                            {character.attributes?.paralysisImmunity && (
                                                <div className="card-attribute-badge">
                                                    <span className="card-attr-icon">⚡</span>
                                                    <span className="card-attr-text">Inmunidad a Parálisis</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {character.description && (
                                    <div className="card-info-description">
                                        <p>{character.description}</p>
                                    </div>
                                )}
                                {character.skillsData && character.skillsData.length > 0 && (
                                    <div className="card-skills-section">
                                        <div className="card-skills-label">Habilidades ({character.skillsData.length})</div>
                                        <div className="card-skills-list">
                                            {character.skillsData.slice(0, 3).map((skill) => (
                                                <div key={skill.id} className="card-skill-item">
                                                    <span className="card-skill-name">{skill.name}</span>
                                                </div>
                                            ))}
                                            {character.skillsData.length > 3 && (
                                                <div className="card-skill-item card-skill-more">
                                                    <span className="card-skill-name">+{character.skillsData.length - 3} más</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Status Badges */}
                            {isSelected && (
                                <div className="card-status-badges">
                                    <div className="selection-badge">
                                        {isMySelection ? '✓ TÚ' : '✓ SELECCIONADO'}
                                    </div>
                                </div>
                            )}
                            {isTaken && (
                                <div className="card-status-badges">
                                    <div className="taken-badge">OCUPADO</div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Confirmation Modal */}
            {characterToConfirm && (
                <div className="confirmation-modal-overlay" onClick={handleCancelSelection}>
                    <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Confirmar Selección</h3>
                            <button className="modal-close" onClick={handleCancelSelection}>×</button>
                        </div>
                        <div className="modal-content">
                            <div className="modal-character-preview">
                                <div
                                    className="preview-image"
                                    style={{
                                        backgroundImage: `url(${characterToConfirm.image
                                            ? (characterToConfirm.image.startsWith('/deck_img')
                                                ? characterToConfirm.image
                                                : `/deck_img/personajes/${characterToConfirm.image}`)
                                            : `/deck_img/personajes/${characterToConfirm.id}.png`})`,
                                    }}
                                />
                                <h4>{characterToConfirm.name}</h4>
                            </div>
                            <div className="modal-character-info">
                                <div className="info-row">
                                    <span className="info-label">Vida:</span>
                                    <span className="info-value">{characterToConfirm.maxHp} HP</span>
                                </div>
                                <div className="info-note">
                                    <small>El ataque básico siempre hace 1 punto de daño. El orden de turnos se determina con dados.</small>
                                </div>

                                {/* Character Bonuses/Attributes */}
                                {(characterToConfirm.baseStats.dodge || characterToConfirm.baseStats.accuracy || characterToConfirm.attributes) && (
                                    <div className="modal-attributes-section">
                                        <div className="modal-attributes-label">Atributos Especiales</div>
                                        <div className="modal-attributes-list">
                                            {characterToConfirm.baseStats.dodge !== undefined && characterToConfirm.baseStats.dodge > 0 && (
                                                <div className="modal-attribute-badge">
                                                    <span className="modal-attr-icon">💨</span>
                                                    <span className="modal-attr-text">Esquiva +{characterToConfirm.baseStats.dodge}</span>
                                                </div>
                                            )}
                                            {characterToConfirm.baseStats.accuracy !== undefined && characterToConfirm.baseStats.accuracy > 0 && (
                                                <div className="modal-attribute-badge">
                                                    <span className="modal-attr-icon">🎯</span>
                                                    <span className="modal-attr-text">Acierto +{characterToConfirm.baseStats.accuracy}</span>
                                                </div>
                                            )}
                                            {characterToConfirm.attributes?.fireResistance !== undefined && characterToConfirm.attributes.fireResistance > 0 && (
                                                <div className="modal-attribute-badge">
                                                    <span className="modal-attr-icon">🔥</span>
                                                    <span className="modal-attr-text">Resistencia al Fuego +{characterToConfirm.attributes.fireResistance}</span>
                                                </div>
                                            )}
                                            {characterToConfirm.attributes?.coldResistance !== undefined && characterToConfirm.attributes.coldResistance > 0 && (
                                                <div className="modal-attribute-badge">
                                                    <span className="modal-attr-icon">❄️</span>
                                                    <span className="modal-attr-text">Resistencia al Frío +{characterToConfirm.attributes.coldResistance}</span>
                                                </div>
                                            )}
                                            {characterToConfirm.attributes?.physicalResistance !== undefined && characterToConfirm.attributes.physicalResistance > 0 && (
                                                <div className="modal-attribute-badge">
                                                    <span className="modal-attr-icon">🛡️</span>
                                                    <span className="modal-attr-text">Resistencia a Daño Físico +{characterToConfirm.attributes.physicalResistance}</span>
                                                </div>
                                            )}
                                            {characterToConfirm.attributes?.paralysisImmunity && (
                                                <div className="modal-attribute-badge">
                                                    <span className="modal-attr-icon">⚡</span>
                                                    <span className="modal-attr-text">Inmunidad a Parálisis</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {characterToConfirm.description && (
                                    <div className="info-description">
                                        <p>{characterToConfirm.description}</p>
                                    </div>
                                )}
                                {(() => {
                                    const confirmChar = characters.find(c => c.id === characterToConfirm.id);
                                    return confirmChar?.skillsData && confirmChar.skillsData.length > 0 && (
                                        <div className="modal-skills-section">
                                            <div className="modal-skills-label">Habilidades ({confirmChar.skillsData.length})</div>
                                            <div className="modal-skills-list">
                                                {confirmChar.skillsData.map((skill) => (
                                                    <div key={skill.id} className="modal-skill-item">
                                                        <div className="modal-skill-header">
                                                            <span className="modal-skill-name">{skill.name}</span>
                                                            {skill.cooldown > 0 && (
                                                                <span className="modal-skill-cooldown">RE: {skill.cooldown}</span>
                                                            )}
                                                        </div>
                                                        <p className="modal-skill-description">{skill.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="confirm-button" onClick={handleConfirmSelection}>
                                Confirmar Selección
                            </button>
                            <button className="cancel-button" onClick={handleCancelSelection}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CharacterSelector;

