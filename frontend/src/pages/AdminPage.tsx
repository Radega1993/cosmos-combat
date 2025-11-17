import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api.service';
import './AdminPage.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Skill {
    id: string;
    name: string;
    character: string;
    type: string;
    damage?: number;
    heal?: number;
    shield?: number;
    effects?: Array<{ type: string; duration: number; value?: number }>;
    cooldown: number;
    cost?: number;
    targetType: string;
    description: string;
    isActive: boolean;
}

interface Card {
    id: string;
    name: string;
    type: string;
    damage?: number;
    heal?: number;
    shield?: number;
    defense?: number;
    cost: number;
    effects?: Array<{ type: string; duration: number; value?: number }>;
    targetType: string;
    description: string;
    image?: string;
    isActive: boolean;
}

interface Character {
    id: string;
    name: string;
    description?: string;
    maxHp: number;
    baseStats: {
        attack: number;
        defense: number;
        speed: number;
        dodge?: number;
        accuracy?: number;
    };
    attributes?: {
        fireResistance?: number;
        coldResistance?: number;
        physicalResistance?: number;
        paralysisImmunity?: boolean;
    };
    image?: string;
    isActive: boolean;
}

type TabType = 'dashboard' | 'characters' | 'cards' | 'skills' | 'balance' | 'presets';

function AdminPage() {
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>('dashboard');
    const [skills, setSkills] = useState<Skill[]>([]);
    const [cards, setCards] = useState<Card[]>([]);
    const [characters, setCharacters] = useState<Character[]>([]);
    const [gameBalance, setGameBalance] = useState<any>(null);
    const [cardImages, setCardImages] = useState<string[]>([]);
    const [characterImages, setCharacterImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [editingItem, setEditingItem] = useState<{ type: 'skill' | 'card' | 'character'; id: string } | null>(null);

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (activeTab !== 'dashboard') {
            loadTabData();
        }
    }, [activeTab]);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            const [cardImgs, charImgs, balance] = await Promise.all([
                apiService.getCardImages(),
                apiService.getCharacterImages(),
                apiService.getGameBalance(),
            ]);
            setCardImages(cardImgs);
            setCharacterImages(charImgs);
            setGameBalance(balance);
        } catch (error: any) {
            showMessage('error', error.message || 'Error al cargar datos iniciales');
        } finally {
            setLoading(false);
        }
    };

    const loadTabData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'skills') {
                const data = await apiService.getAdminSkills();
                setSkills(data || []);
            } else if (activeTab === 'cards') {
                const data = await apiService.getAdminCards();
                setCards(data || []);
            } else if (activeTab === 'characters') {
                const data = await apiService.getAdminCharacters();
                setCharacters(data || []);
            } else if (activeTab === 'balance') {
                const data = await apiService.getGameBalance();
                setGameBalance(data);
            }
        } catch (error: any) {
            showMessage('error', error.message || 'Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    const handleSave = async (type: 'skill' | 'card' | 'character', id: string, data: any) => {
        try {
            if (type === 'skill') {
                await apiService.updateSkill(id, data);
            } else if (type === 'card') {
                await apiService.updateCard(id, data);
            } else {
                await apiService.updateCharacter(id, data);
            }
            showMessage('success', `${type} actualizado correctamente`);
            setEditingItem(null);
            loadTabData();
        } catch (error: any) {
            showMessage('error', error.message || 'Error al guardar');
        }
    };

    const handleToggleActive = async (type: 'skill' | 'card' | 'character', id: string) => {
        try {
            if (type === 'skill') {
                await apiService.toggleSkillActive(id);
            } else if (type === 'card') {
                await apiService.toggleCardActive(id);
            } else {
                await apiService.toggleCharacterActive(id);
            }
            showMessage('success', `${type} actualizado correctamente`);
            loadTabData();
        } catch (error: any) {
            showMessage('error', error.message || 'Error al actualizar');
        }
    };

    const handleSaveBalance = async (data: any) => {
        try {
            await apiService.updateGameBalance(data);
            showMessage('success', 'Balance actualizado correctamente');
            loadTabData();
        } catch (error: any) {
            showMessage('error', error.message || 'Error al guardar balance');
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-header">
                <h1>⚖️ Panel de Balanceo</h1>
                <button onClick={logout} className="logout-button">
                    Cerrar Sesión
                </button>
            </div>

            {message && (
                <div className={`admin-message ${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="admin-tabs">
                <button
                    className={activeTab === 'dashboard' ? 'active' : ''}
                    onClick={() => setActiveTab('dashboard')}
                >
                    📊 Dashboard
                </button>
                <button
                    className={activeTab === 'characters' ? 'active' : ''}
                    onClick={() => setActiveTab('characters')}
                >
                    👾 Personajes
                </button>
                <button
                    className={activeTab === 'cards' ? 'active' : ''}
                    onClick={() => setActiveTab('cards')}
                >
                    🃏 Cartas
                </button>
                <button
                    className={activeTab === 'skills' ? 'active' : ''}
                    onClick={() => setActiveTab('skills')}
                >
                    ⚡ Habilidades
                </button>
                <button
                    className={activeTab === 'balance' ? 'active' : ''}
                    onClick={() => setActiveTab('balance')}
                >
                    🎯 Balance
                </button>
                <button
                    className={activeTab === 'presets' ? 'active' : ''}
                    onClick={() => setActiveTab('presets')}
                >
                    💾 Presets
                </button>
            </div>

            <div className="admin-content">
                {loading ? (
                    <div className="loading">Cargando...</div>
                ) : (
                    <>
                        {activeTab === 'dashboard' && (
                            <div className="dashboard">
                                <h2>Resumen del Sistema</h2>
                                <div className="dashboard-stats">
                                    <div className="stat-card">
                                        <h3>Personajes</h3>
                                        <p className="stat-value">{characters.length}</p>
                                        <p className="stat-active">
                                            {characters.filter(c => c.isActive).length} activos
                                        </p>
                                    </div>
                                    <div className="stat-card">
                                        <h3>Cartas</h3>
                                        <p className="stat-value">{cards.length}</p>
                                        <p className="stat-active">
                                            {cards.filter(c => c.isActive).length} activas
                                        </p>
                                    </div>
                                    <div className="stat-card">
                                        <h3>Habilidades</h3>
                                        <p className="stat-value">{skills.length}</p>
                                        <p className="stat-active">
                                            {skills.filter(s => s.isActive).length} activas
                                        </p>
                                    </div>
                                    <div className="stat-card">
                                        <h3>Imágenes</h3>
                                        <p className="stat-value">{cardImages.length + characterImages.length}</p>
                                        <p className="stat-active">
                                            {cardImages.length} cartas, {characterImages.length} personajes
                                        </p>
                                    </div>
                                </div>
                                <div className="dashboard-actions">
                                    <button onClick={() => setActiveTab('characters')} className="action-button">
                                        Gestionar Personajes
                                    </button>
                                    <button onClick={() => setActiveTab('cards')} className="action-button">
                                        Gestionar Cartas
                                    </button>
                                    <button onClick={() => setActiveTab('skills')} className="action-button">
                                        Gestionar Habilidades
                                    </button>
                                    <button onClick={() => setActiveTab('balance')} className="action-button">
                                        Ajustar Balance
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'characters' && (
                            <CharactersSection
                                characters={characters}
                                characterImages={characterImages}
                                editingItem={editingItem}
                                onEdit={(id) => setEditingItem({ type: 'character', id })}
                                onCancel={() => setEditingItem(null)}
                                onSave={(id, data) => handleSave('character', id, data)}
                                onToggle={(id) => handleToggleActive('character', id)}
                                apiBaseUrl={API_BASE_URL}
                            />
                        )}

                        {activeTab === 'cards' && (
                            <CardsSection
                                cards={cards}
                                cardImages={cardImages}
                                editingItem={editingItem}
                                onEdit={(id) => setEditingItem({ type: 'card', id })}
                                onCancel={() => setEditingItem(null)}
                                onSave={(id, data) => handleSave('card', id, data)}
                                onToggle={(id) => handleToggleActive('card', id)}
                                apiBaseUrl={API_BASE_URL}
                            />
                        )}

                        {activeTab === 'skills' && (
                            <SkillsSection
                                skills={skills}
                                editingItem={editingItem}
                                onEdit={(id) => setEditingItem({ type: 'skill', id })}
                                onCancel={() => setEditingItem(null)}
                                onSave={(id, data) => handleSave('skill', id, data)}
                                onToggle={(id) => handleToggleActive('skill', id)}
                            />
                        )}

                        {activeTab === 'balance' && (
                            <BalanceSection
                                gameBalance={gameBalance}
                                onSave={handleSaveBalance}
                            />
                        )}

                        {activeTab === 'presets' && (
                            <PresetsSection
                                onLoad={() => {
                                    loadTabData();
                                    setActiveTab('dashboard');
                                }}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

// Character Section Component
function CharactersSection({
    characters,
    characterImages,
    editingItem,
    onEdit,
    onCancel,
    onSave,
    onToggle,
    apiBaseUrl,
}: {
    characters: Character[];
    characterImages: string[];
    editingItem: { type: string; id: string } | null;
    onEdit: (id: string) => void;
    onCancel: () => void;
    onSave: (id: string, data: any) => void;
    onToggle: (id: string) => void;
    apiBaseUrl: string;
}) {
    const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);

    useEffect(() => {
        if (editingItem) {
            const char = characters.find(c => c.id === editingItem.id);
            setEditingCharacter(char ? { ...char } : null);
        } else {
            setEditingCharacter(null);
        }
    }, [editingItem, characters]);

    if (editingCharacter) {
        return (
            <CharacterEditForm
                character={editingCharacter}
                characterImages={characterImages}
                onSave={(data) => {
                    onSave(editingCharacter.id, data);
                    setEditingCharacter(null);
                }}
                onCancel={() => {
                    onCancel();
                    setEditingCharacter(null);
                }}
                apiBaseUrl={apiBaseUrl}
            />
        );
    }

    return (
        <div className="section-content">
            <h2>Gestión de Personajes</h2>
            <div className="items-grid">
                {characters.map((character) => (
                    <div key={character.id} className={`item-card ${!character.isActive ? 'item-inactive' : ''}`}>
                        {character.image && (
                            <img
                                src={`${apiBaseUrl}${character.image}`}
                                alt={character.name}
                                className="item-image"
                                style={{ opacity: character.isActive ? 1 : 0.5 }}
                            />
                        )}
                        <div className="item-info">
                            <h3>{character.name}</h3>
                            <p>HP: {character.maxHp}</p>
                            <p>Ataque: {character.baseStats.attack}</p>
                            <p>Defensa: {character.baseStats.defense}</p>
                            <span className={character.isActive ? 'status-active' : 'status-inactive'}>
                                {character.isActive ? '✓ Activo' : '✗ Inactivo'}
                            </span>
                        </div>
                        <div className="item-actions">
                            <button onClick={() => onEdit(character.id)} className="edit-button">
                                Editar
                            </button>
                            <button
                                onClick={() => onToggle(character.id)}
                                className={`toggle-button ${character.isActive ? 'deactivate' : 'activate'}`}
                                title={character.isActive ? 'Hacer clic para desactivar' : 'Hacer clic para activar'}
                            >
                                {character.isActive ? '✗ Desactivar' : '✓ Activar'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Character Edit Form
function CharacterEditForm({
    character,
    characterImages,
    onSave,
    onCancel,
    apiBaseUrl,
}: {
    character: Character;
    characterImages: string[];
    onSave: (data: any) => void;
    onCancel: () => void;
    apiBaseUrl: string;
}) {
    const [formData, setFormData] = useState<Character>(character);
    const [selectedImage, setSelectedImage] = useState<string>(character.image || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            image: selectedImage || undefined,
        });
    };

    return (
        <form className="edit-form" onSubmit={handleSubmit}>
            <h2>Editar Personaje: {character.name}</h2>

            <div className="form-group">
                <label>Nombre</label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                />
            </div>

            <div className="form-group">
                <label>Descripción</label>
                <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                />
            </div>

            <div className="form-group">
                <label>HP Máximo</label>
                <input
                    type="number"
                    value={formData.maxHp}
                    onChange={(e) => setFormData({ ...formData, maxHp: parseInt(e.target.value) || 0 })}
                    required
                    min="1"
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Ataque</label>
                    <input
                        type="number"
                        value={formData.baseStats.attack}
                        onChange={(e) => setFormData({
                            ...formData,
                            baseStats: { ...formData.baseStats, attack: parseInt(e.target.value) || 0 }
                        })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Defensa</label>
                    <input
                        type="number"
                        value={formData.baseStats.defense}
                        onChange={(e) => setFormData({
                            ...formData,
                            baseStats: { ...formData.baseStats, defense: parseInt(e.target.value) || 0 }
                        })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Velocidad</label>
                    <input
                        type="number"
                        value={formData.baseStats.speed}
                        onChange={(e) => setFormData({
                            ...formData,
                            baseStats: { ...formData.baseStats, speed: parseInt(e.target.value) || 0 }
                        })}
                        required
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Esquiva</label>
                    <input
                        type="number"
                        value={formData.baseStats.dodge || 0}
                        onChange={(e) => setFormData({
                            ...formData,
                            baseStats: { ...formData.baseStats, dodge: parseInt(e.target.value) || 0 }
                        })}
                        min="0"
                    />
                </div>
                <div className="form-group">
                    <label>Acierto</label>
                    <input
                        type="number"
                        value={formData.baseStats.accuracy || 0}
                        onChange={(e) => setFormData({
                            ...formData,
                            baseStats: { ...formData.baseStats, accuracy: parseInt(e.target.value) || 0 }
                        })}
                        min="0"
                    />
                </div>
            </div>

            {formData.attributes && (
                <>
                    <h3>Atributos</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Resistencia al Fuego</label>
                            <input
                                type="number"
                                value={formData.attributes.fireResistance || 0}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    attributes: {
                                        ...formData.attributes!,
                                        fireResistance: parseInt(e.target.value) || 0
                                    }
                                })}
                                min="0"
                            />
                        </div>
                        <div className="form-group">
                            <label>Resistencia al Frío</label>
                            <input
                                type="number"
                                value={formData.attributes.coldResistance || 0}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    attributes: {
                                        ...formData.attributes!,
                                        coldResistance: parseInt(e.target.value) || 0
                                    }
                                })}
                                min="0"
                            />
                        </div>
                        <div className="form-group">
                            <label>Resistencia Física</label>
                            <input
                                type="number"
                                value={formData.attributes.physicalResistance || 0}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    attributes: {
                                        ...formData.attributes!,
                                        physicalResistance: parseInt(e.target.value) || 0
                                    }
                                })}
                                min="0"
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>
                            <input
                                type="checkbox"
                                checked={formData.attributes.paralysisImmunity || false}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    attributes: {
                                        ...formData.attributes!,
                                        paralysisImmunity: e.target.checked
                                    }
                                })}
                            />
                            Inmunidad a Parálisis
                        </label>
                    </div>
                </>
            )}

            <div className="form-group">
                <label>Imagen</label>
                <div className="image-selector">
                    <select
                        value={selectedImage}
                        onChange={(e) => setSelectedImage(e.target.value)}
                    >
                        <option value="">Sin imagen</option>
                        {characterImages.map((img) => (
                            <option key={img} value={img}>{img.split('/').pop()}</option>
                        ))}
                    </select>
                    {selectedImage && (
                        <img
                            src={`${apiBaseUrl}${selectedImage}`}
                            alt="Preview"
                            className="image-preview"
                        />
                    )}
                </div>
            </div>

            <div className="form-actions">
                <button type="submit" className="save-button">Guardar</button>
                <button type="button" onClick={onCancel} className="cancel-button">Cancelar</button>
            </div>
        </form>
    );
}

// Cards Section Component
function CardsSection({
    cards,
    cardImages,
    editingItem,
    onEdit,
    onCancel,
    onSave,
    onToggle,
    apiBaseUrl,
}: {
    cards: Card[];
    cardImages: string[];
    editingItem: { type: string; id: string } | null;
    onEdit: (id: string) => void;
    onCancel: () => void;
    onSave: (id: string, data: any) => void;
    onToggle: (id: string) => void;
    apiBaseUrl: string;
}) {
    const [editingCard, setEditingCard] = useState<Card | null>(null);

    useEffect(() => {
        if (editingItem) {
            const card = cards.find(c => c.id === editingItem.id);
            setEditingCard(card ? { ...card } : null);
        } else {
            setEditingCard(null);
        }
    }, [editingItem, cards]);

    if (editingCard) {
        return (
            <CardEditForm
                card={editingCard}
                cardImages={cardImages}
                onSave={(data) => {
                    onSave(editingCard.id, data);
                    setEditingCard(null);
                }}
                onCancel={() => {
                    onCancel();
                    setEditingCard(null);
                }}
                apiBaseUrl={apiBaseUrl}
            />
        );
    }

    return (
        <div className="section-content">
            <h2>Gestión de Cartas</h2>
            <div className="items-grid">
                {cards.map((card) => (
                    <div key={card.id} className={`item-card ${!card.isActive ? 'item-inactive' : ''}`}>
                        {card.image && (
                            <img
                                src={`${apiBaseUrl}${card.image}`}
                                alt={card.name}
                                className="item-image"
                                style={{ opacity: card.isActive ? 1 : 0.5 }}
                            />
                        )}
                        <div className="item-info">
                            <h3>{card.name}</h3>
                            <p>Tipo: {card.type}</p>
                            <p>Costo: {card.cost}</p>
                            {card.damage && <p>Daño: {card.damage}</p>}
                            {card.heal && <p>Curación: {card.heal}</p>}
                            <span className={card.isActive ? 'status-active' : 'status-inactive'}>
                                {card.isActive ? '✓ Activo' : '✗ Inactivo'}
                            </span>
                        </div>
                        <div className="item-actions">
                            <button onClick={() => onEdit(card.id)} className="edit-button">
                                Editar
                            </button>
                            <button
                                onClick={() => onToggle(card.id)}
                                className={`toggle-button ${card.isActive ? 'deactivate' : 'activate'}`}
                                title={card.isActive ? 'Hacer clic para desactivar' : 'Hacer clic para activar'}
                            >
                                {card.isActive ? '✗ Desactivar' : '✓ Activar'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Card Edit Form
function CardEditForm({
    card,
    cardImages,
    onSave,
    onCancel,
    apiBaseUrl,
}: {
    card: Card;
    cardImages: string[];
    onSave: (data: any) => void;
    onCancel: () => void;
    apiBaseUrl: string;
}) {
    const [formData, setFormData] = useState<Card>(card);
    const [selectedImage, setSelectedImage] = useState<string>(card.image || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            image: selectedImage || undefined,
        });
    };

    return (
        <form className="edit-form" onSubmit={handleSubmit}>
            <h2>Editar Carta: {card.name}</h2>

            <div className="form-group">
                <label>Nombre</label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                />
            </div>

            <div className="form-group">
                <label>Descripción</label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    required
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Tipo</label>
                    <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        required
                    >
                        <option value="attack">Ataque</option>
                        <option value="defense">Defensa</option>
                        <option value="utility">Utilidad</option>
                        <option value="skill">Habilidad</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Tipo de Objetivo</label>
                    <select
                        value={formData.targetType}
                        onChange={(e) => setFormData({ ...formData, targetType: e.target.value })}
                        required
                    >
                        <option value="single">Único</option>
                        <option value="area">Área</option>
                        <option value="self">Propio</option>
                        <option value="all">Todos</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Costo</label>
                    <input
                        type="number"
                        value={formData.cost}
                        onChange={(e) => setFormData({ ...formData, cost: parseInt(e.target.value) || 0 })}
                        required
                        min="0"
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Daño</label>
                    <input
                        type="number"
                        value={formData.damage || ''}
                        onChange={(e) => setFormData({ ...formData, damage: e.target.value ? parseInt(e.target.value) : undefined })}
                        min="0"
                    />
                </div>
                <div className="form-group">
                    <label>Curación</label>
                    <input
                        type="number"
                        value={formData.heal || ''}
                        onChange={(e) => setFormData({ ...formData, heal: e.target.value ? parseInt(e.target.value) : undefined })}
                        min="0"
                    />
                </div>
                <div className="form-group">
                    <label>Escudo</label>
                    <input
                        type="number"
                        value={formData.shield || ''}
                        onChange={(e) => setFormData({ ...formData, shield: e.target.value ? parseInt(e.target.value) : undefined })}
                        min="0"
                    />
                </div>
                <div className="form-group">
                    <label>Defensa</label>
                    <input
                        type="number"
                        value={formData.defense || ''}
                        onChange={(e) => setFormData({ ...formData, defense: e.target.value ? parseInt(e.target.value) : undefined })}
                        min="0"
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Imagen</label>
                <div className="image-selector">
                    <select
                        value={selectedImage}
                        onChange={(e) => setSelectedImage(e.target.value)}
                    >
                        <option value="">Sin imagen</option>
                        {cardImages.map((img) => (
                            <option key={img} value={img}>{img.split('/').pop()}</option>
                        ))}
                    </select>
                    {selectedImage && (
                        <img
                            src={`${apiBaseUrl}${selectedImage}`}
                            alt="Preview"
                            className="image-preview"
                        />
                    )}
                </div>
            </div>

            <div className="form-actions">
                <button type="submit" className="save-button">Guardar</button>
                <button type="button" onClick={onCancel} className="cancel-button">Cancelar</button>
            </div>
        </form>
    );
}

// Skills Section Component
function SkillsSection({
    skills,
    editingItem,
    onEdit,
    onCancel,
    onSave,
    onToggle,
}: {
    skills: Skill[];
    editingItem: { type: string; id: string } | null;
    onEdit: (id: string) => void;
    onCancel: () => void;
    onSave: (id: string, data: any) => void;
    onToggle: (id: string) => void;
}) {
    const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

    useEffect(() => {
        if (editingItem) {
            const skill = skills.find(s => s.id === editingItem.id);
            setEditingSkill(skill ? { ...skill } : null);
        } else {
            setEditingSkill(null);
        }
    }, [editingItem, skills]);

    if (editingSkill) {
        return (
            <SkillEditForm
                skill={editingSkill}
                onSave={(data) => {
                    onSave(editingSkill.id, data);
                    setEditingSkill(null);
                }}
                onCancel={() => {
                    onCancel();
                    setEditingSkill(null);
                }}
            />
        );
    }

    return (
        <div className="section-content">
            <h2>Gestión de Habilidades</h2>
            <div className="items-grid">
                {skills.map((skill) => (
                    <div key={skill.id} className={`item-card ${!skill.isActive ? 'item-inactive' : ''}`}>
                        <div className="item-info">
                            <h3>{skill.name}</h3>
                            <p>Personaje: {skill.character}</p>
                            <p>Tipo: {skill.type}</p>
                            {skill.damage && <p>Daño: {skill.damage}</p>}
                            <p>Cooldown: {skill.cooldown}</p>
                            <span className={skill.isActive ? 'status-active' : 'status-inactive'}>
                                {skill.isActive ? '✓ Activo' : '✗ Inactivo'}
                            </span>
                        </div>
                        <div className="item-actions">
                            <button onClick={() => onEdit(skill.id)} className="edit-button">
                                Editar
                            </button>
                            <button
                                onClick={() => onToggle(skill.id)}
                                className={`toggle-button ${skill.isActive ? 'deactivate' : 'activate'}`}
                                title={skill.isActive ? 'Hacer clic para desactivar' : 'Hacer clic para activar'}
                            >
                                {skill.isActive ? '✗ Desactivar' : '✓ Activar'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Skill Edit Form
function SkillEditForm({
    skill,
    onSave,
    onCancel,
}: {
    skill: Skill;
    onSave: (data: any) => void;
    onCancel: () => void;
}) {
    const [formData, setFormData] = useState<Skill>(skill);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form className="edit-form" onSubmit={handleSubmit}>
            <h2>Editar Habilidad: {skill.name}</h2>

            <div className="form-group">
                <label>Nombre</label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                />
            </div>

            <div className="form-group">
                <label>Descripción</label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    required
                />
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Tipo</label>
                    <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        required
                    >
                        <option value="attack">Ataque</option>
                        <option value="defense">Defensa</option>
                        <option value="utility">Utilidad</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Tipo de Objetivo</label>
                    <select
                        value={formData.targetType}
                        onChange={(e) => setFormData({ ...formData, targetType: e.target.value })}
                        required
                    >
                        <option value="single">Único</option>
                        <option value="area">Área</option>
                        <option value="self">Propio</option>
                        <option value="all">Todos</option>
                    </select>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Daño</label>
                    <input
                        type="number"
                        value={formData.damage || ''}
                        onChange={(e) => setFormData({ ...formData, damage: e.target.value ? parseInt(e.target.value) : undefined })}
                        min="0"
                    />
                </div>
                <div className="form-group">
                    <label>Curación</label>
                    <input
                        type="number"
                        value={formData.heal || ''}
                        onChange={(e) => setFormData({ ...formData, heal: e.target.value ? parseInt(e.target.value) : undefined })}
                        min="0"
                    />
                </div>
                <div className="form-group">
                    <label>Escudo</label>
                    <input
                        type="number"
                        value={formData.shield || ''}
                        onChange={(e) => setFormData({ ...formData, shield: e.target.value ? parseInt(e.target.value) : undefined })}
                        min="0"
                    />
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Cooldown</label>
                    <input
                        type="number"
                        value={formData.cooldown}
                        onChange={(e) => setFormData({ ...formData, cooldown: parseInt(e.target.value) || 0 })}
                        required
                        min="0"
                    />
                </div>
                <div className="form-group">
                    <label>Costo</label>
                    <input
                        type="number"
                        value={formData.cost || ''}
                        onChange={(e) => setFormData({ ...formData, cost: e.target.value ? parseInt(e.target.value) : undefined })}
                        min="0"
                    />
                </div>
            </div>

            <div className="form-actions">
                <button type="submit" className="save-button">Guardar</button>
                <button type="button" onClick={onCancel} className="cancel-button">Cancelar</button>
            </div>
        </form>
    );
}

// Balance Section Component
function BalanceSection({
    gameBalance,
    onSave,
}: {
    gameBalance: any;
    onSave: (data: any) => void;
}) {
    const [formData, setFormData] = useState<any>(gameBalance || {});

    useEffect(() => {
        if (gameBalance) {
            setFormData(gameBalance);
        }
    }, [gameBalance]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!gameBalance) {
        return <div className="loading">Cargando balance...</div>;
    }

    return (
        <form className="edit-form" onSubmit={handleSubmit}>
            <h2>Ajustes de Balance General</h2>

            <div className="form-row">
                <div className="form-group">
                    <label>Mano Inicial</label>
                    <input
                        type="number"
                        value={formData.startingHandSize || 3}
                        onChange={(e) => setFormData({ ...formData, startingHandSize: parseInt(e.target.value) || 3 })}
                        required
                        min="1"
                    />
                </div>
                <div className="form-group">
                    <label>Cartas por Turno</label>
                    <input
                        type="number"
                        value={formData.cardsPerTurn || 2}
                        onChange={(e) => setFormData({ ...formData, cardsPerTurn: parseInt(e.target.value) || 2 })}
                        required
                        min="1"
                    />
                </div>
                <div className="form-group">
                    <label>Acciones por Turno</label>
                    <input
                        type="number"
                        value={formData.actionsPerTurn || 2}
                        onChange={(e) => setFormData({ ...formData, actionsPerTurn: parseInt(e.target.value) || 2 })}
                        required
                        min="1"
                    />
                </div>
            </div>

            <div className="form-actions">
                <button type="submit" className="save-button">Guardar Balance</button>
            </div>
        </form>
    );
}

// Presets Section Component
function PresetsSection({ onLoad }: { onLoad: () => void }) {
    const [presets, setPresets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showCompareModal, setShowCompareModal] = useState(false);
    const [presetName, setPresetName] = useState('');
    const [presetDescription, setPresetDescription] = useState('');
    const [selectedPresets, setSelectedPresets] = useState<{ id1: string; id2: string }>({ id1: '', id2: '' });
    const [comparison, setComparison] = useState<any>(null);

    useEffect(() => {
        loadPresets();
    }, []);

    const loadPresets = async () => {
        setLoading(true);
        try {
            const data = await apiService.getPresets();
            setPresets(data || []);
        } catch (error: any) {
            showMessage('error', error.message || 'Error al cargar presets');
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    const handleCreatePreset = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiService.createPreset(presetName, presetDescription || undefined);
            showMessage('success', 'Preset creado correctamente');
            setShowCreateModal(false);
            setPresetName('');
            setPresetDescription('');
            loadPresets();
        } catch (error: any) {
            showMessage('error', error.message || 'Error al crear preset');
        }
    };

    const handleLoadPreset = async (id: string) => {
        if (!confirm('¿Estás seguro de que quieres cargar este preset? Esto sobrescribirá la configuración actual.')) {
            return;
        }
        try {
            await apiService.loadPreset(id);
            showMessage('success', 'Preset cargado correctamente');
            onLoad();
        } catch (error: any) {
            showMessage('error', error.message || 'Error al cargar preset');
        }
    };

    const handleDeletePreset = async (id: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este preset?')) {
            return;
        }
        try {
            await apiService.deletePreset(id);
            showMessage('success', 'Preset eliminado correctamente');
            loadPresets();
        } catch (error: any) {
            showMessage('error', error.message || 'Error al eliminar preset');
        }
    };

    const handleCompare = async () => {
        if (!selectedPresets.id1 || !selectedPresets.id2) {
            showMessage('error', 'Selecciona dos presets para comparar');
            return;
        }
        try {
            const result = await apiService.comparePresets(selectedPresets.id1, selectedPresets.id2);
            setComparison(result);
            setShowCompareModal(true);
        } catch (error: any) {
            showMessage('error', error.message || 'Error al comparar presets');
        }
    };

    if (loading) {
        return <div className="loading">Cargando presets...</div>;
    }

    return (
        <div className="section-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Gestión de Presets</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="save-button"
                    >
                        💾 Guardar Preset Actual
                    </button>
                    <button
                        onClick={() => setShowCompareModal(true)}
                        className="edit-button"
                    >
                        🔍 Comparar Presets
                    </button>
                </div>
            </div>

            {message && (
                <div className={`admin-message ${message.type}`}>
                    {message.text}
                </div>
            )}

            {presets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#cbd5e1' }}>
                    <p>No hay presets guardados. Crea uno para empezar.</p>
                </div>
            ) : (
                <div className="items-grid">
                    {presets.map((preset) => (
                        <div key={preset._id} className="item-card">
                            <div className="item-info">
                                <h3>{preset.name}</h3>
                                {preset.description && <p>{preset.description}</p>}
                                <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                                    Creado: {new Date(preset.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="item-actions">
                                <button
                                    onClick={() => handleLoadPreset(preset._id)}
                                    className="edit-button"
                                >
                                    📥 Cargar
                                </button>
                                <button
                                    onClick={() => handleDeletePreset(preset._id)}
                                    className="cancel-button"
                                >
                                    🗑️ Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Crear Nuevo Preset</h2>
                        <form onSubmit={handleCreatePreset}>
                            <div className="form-group">
                                <label>Nombre del Preset *</label>
                                <input
                                    type="text"
                                    value={presetName}
                                    onChange={(e) => setPresetName(e.target.value)}
                                    required
                                    placeholder="Ej: Balance v1.0"
                                />
                            </div>
                            <div className="form-group">
                                <label>Descripción (opcional)</label>
                                <textarea
                                    value={presetDescription}
                                    onChange={(e) => setPresetDescription(e.target.value)}
                                    rows={3}
                                    placeholder="Descripción del preset..."
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="save-button">Guardar</button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setPresetName('');
                                        setPresetDescription('');
                                    }}
                                    className="cancel-button"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showCompareModal && (
                <div className="modal-overlay" onClick={() => {
                    setShowCompareModal(false);
                    setComparison(null);
                    setSelectedPresets({ id1: '', id2: '' });
                }}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }}>
                        <h2>Comparar Presets</h2>
                        {!comparison ? (
                            <>
                                <div className="form-group">
                                    <label>Preset 1</label>
                                    <select
                                        value={selectedPresets.id1}
                                        onChange={(e) => setSelectedPresets({ ...selectedPresets, id1: e.target.value })}
                                    >
                                        <option value="">Seleccionar preset...</option>
                                        {presets.map((p) => (
                                            <option key={p._id} value={p._id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Preset 2</label>
                                    <select
                                        value={selectedPresets.id2}
                                        onChange={(e) => setSelectedPresets({ ...selectedPresets, id2: e.target.value })}
                                    >
                                        <option value="">Seleccionar preset...</option>
                                        {presets.map((p) => (
                                            <option key={p._id} value={p._id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-actions">
                                    <button onClick={handleCompare} className="save-button">Comparar</button>
                                    <button
                                        onClick={() => {
                                            setShowCompareModal(false);
                                            setSelectedPresets({ id1: '', id2: '' });
                                        }}
                                        className="cancel-button"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div>
                                <h3>Comparación: {comparison.preset1.name} vs {comparison.preset2.name}</h3>
                                <ComparisonView differences={comparison.differences} />
                                <div className="form-actions" style={{ marginTop: '2rem' }}>
                                    <button
                                        onClick={() => {
                                            setShowCompareModal(false);
                                            setComparison(null);
                                            setSelectedPresets({ id1: '', id2: '' });
                                        }}
                                        className="cancel-button"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// Comparison View Component
function ComparisonView({ differences }: { differences: any }) {
    const renderDifferences = (section: string, diffs: any) => {
        const keys = Object.keys(diffs);
        if (keys.length === 0) {
            return <p style={{ color: '#86efac' }}>✓ Sin diferencias</p>;
        }

        return (
            <div style={{ marginTop: '1rem' }}>
                <h4 style={{ color: '#a78bfa', marginBottom: '0.5rem' }}>{section}</h4>
                {keys.map((key) => (
                    <div key={key} style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(102, 126, 234, 0.1)', borderRadius: '8px' }}>
                        <strong style={{ color: '#fca5a5' }}>{key}</strong>
                        <div style={{ marginTop: '0.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Preset 1:</p>
                                <pre style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.8rem', overflow: 'auto' }}>
                                    {JSON.stringify(diffs[key].preset1, null, 2)}
                                </pre>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Preset 2:</p>
                                <pre style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.8rem', overflow: 'auto' }}>
                                    {JSON.stringify(diffs[key].preset2, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div>
            {renderDifferences('Personajes', differences.characters)}
            {renderDifferences('Cartas', differences.cards)}
            {renderDifferences('Habilidades', differences.skills)}
            {renderDifferences('Balance', differences.balance)}
        </div>
    );
}

export default AdminPage;
