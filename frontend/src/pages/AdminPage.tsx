import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api.service';
import './AdminPage.css';

interface Skill {
    id: string;
    name: string;
    character: string;
    type: string;
    damage?: number;
    heal?: number;
    shield?: number;
    cooldown: number;
    isActive: boolean;
}

interface Card {
    id: string;
    name: string;
    type: string;
    damage?: number;
    heal?: number;
    shield?: number;
    cost: number;
    isActive: boolean;
}

interface Character {
    id: string;
    name: string;
    maxHp: number;
    isActive: boolean;
}

function AdminPage() {
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState<'skills' | 'cards' | 'characters'>('skills');
    const [skills, setSkills] = useState<Skill[]>([]);
    const [cards, setCards] = useState<Card[]>([]);
    const [characters, setCharacters] = useState<Character[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'skills') {
                const data = await apiService.getSkills();
                setSkills(data || []);
            } else if (activeTab === 'cards') {
                const data = await apiService.getCards();
                setCards(data || []);
            } else {
                const data = await apiService.getCharacters();
                setCharacters(data || []);
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
            loadData();
        } catch (error: any) {
            showMessage('error', error.message || 'Error al actualizar');
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-header">
                <h1>🛡️ Panel de Administración</h1>
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
                    className={activeTab === 'skills' ? 'active' : ''}
                    onClick={() => setActiveTab('skills')}
                >
                    Habilidades
                </button>
                <button
                    className={activeTab === 'cards' ? 'active' : ''}
                    onClick={() => setActiveTab('cards')}
                >
                    Cartas
                </button>
                <button
                    className={activeTab === 'characters' ? 'active' : ''}
                    onClick={() => setActiveTab('characters')}
                >
                    Personajes
                </button>
            </div>

            <div className="admin-content">
                {loading ? (
                    <div className="loading">Cargando...</div>
                ) : (
                    <>
                        {activeTab === 'skills' && (
                            <div className="admin-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Nombre</th>
                                            <th>Personaje</th>
                                            <th>Tipo</th>
                                            <th>Daño</th>
                                            <th>Cooldown</th>
                                            <th>Estado</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {skills.map((skill) => (
                                            <tr key={skill.id}>
                                                <td>{skill.id}</td>
                                                <td>{skill.name}</td>
                                                <td>{skill.character}</td>
                                                <td>{skill.type}</td>
                                                <td>{skill.damage || '-'}</td>
                                                <td>{skill.cooldown}</td>
                                                <td>
                                                    <span className={skill.isActive ? 'status-active' : 'status-inactive'}>
                                                        {skill.isActive ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        onClick={() => handleToggleActive('skill', skill.id)}
                                                        className={`toggle-button ${skill.isActive ? 'deactivate' : 'activate'}`}
                                                    >
                                                        {skill.isActive ? 'Desactivar' : 'Activar'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'cards' && (
                            <div className="admin-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Nombre</th>
                                            <th>Tipo</th>
                                            <th>Daño</th>
                                            <th>Costo</th>
                                            <th>Estado</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cards.map((card) => (
                                            <tr key={card.id}>
                                                <td>{card.id}</td>
                                                <td>{card.name}</td>
                                                <td>{card.type}</td>
                                                <td>{card.damage || '-'}</td>
                                                <td>{card.cost}</td>
                                                <td>
                                                    <span className={card.isActive ? 'status-active' : 'status-inactive'}>
                                                        {card.isActive ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        onClick={() => handleToggleActive('card', card.id)}
                                                        className={`toggle-button ${card.isActive ? 'deactivate' : 'activate'}`}
                                                    >
                                                        {card.isActive ? 'Desactivar' : 'Activar'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'characters' && (
                            <div className="admin-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Nombre</th>
                                            <th>HP Máximo</th>
                                            <th>Estado</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {characters.map((character) => (
                                            <tr key={character.id}>
                                                <td>{character.id}</td>
                                                <td>{character.name}</td>
                                                <td>{character.maxHp}</td>
                                                <td>
                                                    <span className={character.isActive ? 'status-active' : 'status-inactive'}>
                                                        {character.isActive ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        onClick={() => handleToggleActive('character', character.id)}
                                                        className={`toggle-button ${character.isActive ? 'deactivate' : 'activate'}`}
                                                    >
                                                        {character.isActive ? 'Desactivar' : 'Activar'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default AdminPage;

