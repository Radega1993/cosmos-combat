import { useEffect, useState } from 'react';
import { apiService } from '../../services/api.service';
import { socketService } from '../../services/socket.service';
import { Character } from '../../types/game.types';
import { useLobbyStore } from '../../store/lobby.store';
import './CharacterSelector.css';

interface CharacterSelectorProps {
    gameId: string;
    playerId: string;
}

function CharacterSelector({ gameId, playerId }: CharacterSelectorProps) {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [loading, setLoading] = useState(true);
    const { currentGame } = useLobbyStore();
    const currentPlayer = currentGame?.players.find((p) => p.playerId === playerId);
    const selectedCharacterId = currentPlayer?.characterId;

    useEffect(() => {
        loadCharacters();
    }, []);

    const loadCharacters = async () => {
        try {
            const chars = await apiService.getCharacters();
            setCharacters(chars);
        } catch (error) {
            console.error('Error loading characters:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectCharacter = (characterId: string) => {
        if (selectedCharacterId) {
            return; // Already selected
        }
        socketService.selectCharacter(gameId, playerId, characterId);
    };

    const getSelectedCharacters = () => {
        if (!currentGame) return [];
        return currentGame.players
            .map((p) => p.characterId)
            .filter((id): id is string => !!id);
    };

    if (loading) {
        return <div className="character-selector-loading">Loading characters...</div>;
    }

    const selectedCharacters = getSelectedCharacters();

    return (
        <div className="character-selector">
            <h3>Select Your Character</h3>
            <div className="characters-grid">
                {characters.map((character) => {
                    const isSelected = selectedCharacterId === character.id;
                    const isTaken = selectedCharacters.includes(character.id) && !isSelected;
                    const isMySelection = isSelected && currentPlayer?.playerId === playerId;

                    return (
                        <div
                            key={character.id}
                            className={`character-card ${isSelected ? 'selected' : ''} ${isTaken ? 'taken' : ''} ${isMySelection ? 'my-selection' : ''}`}
                            onClick={() => !isSelected && !isTaken && handleSelectCharacter(character.id)}
                        >
                            <div className="character-image">
                                <img
                                    src={`/finales personajes/${character.id}_ok.png`}
                                    alt={character.name}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/finales personajes/back personajes.png';
                                    }}
                                />
                            </div>
                            <div className="character-info">
                                <h4>{character.name}</h4>
                                <p>{character.description}</p>
                                <div className="character-stats">
                                    <span>HP: {character.maxHp}</span>
                                    <span>ATK: {character.baseStats.attack}</span>
                                    <span>DEF: {character.baseStats.defense}</span>
                                    <span>SPD: {character.baseStats.speed}</span>
                                </div>
                                {isSelected && (
                                    <div className="selection-badge">
                                        {isMySelection ? 'Your Character' : 'Selected'}
                                    </div>
                                )}
                                {isTaken && <div className="taken-badge">Taken</div>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default CharacterSelector;

