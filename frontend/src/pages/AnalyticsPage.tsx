import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api.service';
import './AnalyticsPage.css';

interface CharacterWinRate {
    characterId: string;
    characterName: string;
    gamesPlayed: number;
    wins: number;
    winRate: number;
}

interface CardUsage {
    cardId: string;
    cardName: string;
    timesPlayed: number;
    totalDamage: number;
    totalHealing: number;
    avgDamage: number;
    avgHealing: number;
}

interface GameDurations {
    average: number;
    min: number;
    max: number;
    median: number;
    totalGames: number;
}

interface PlayerStats {
    playerId: string;
    playerName: string;
    gamesPlayed: number;
    wins: number;
    winRate: number;
    avgDamage: number;
    avgHealing: number;
}

interface OverallStats {
    totalGames: number;
    totalPlayers: number;
    averageGameDuration: number;
    averageTurnsPerGame: number;
    averageActionsPerGame: number;
    totalDamage: number;
    totalHealing: number;
    mostPlayedCharacter: string;
    mostPlayedCard: string;
}

function AnalyticsPage() {
    const { isAdmin } = useAuth();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'characters' | 'cards' | 'players' | 'durations'>('overview');

    // Filters
    const [balanceVersion, setBalanceVersion] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    // Data
    const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
    const [characterWinRates, setCharacterWinRates] = useState<CharacterWinRate[]>([]);
    const [cardUsage, setCardUsage] = useState<CardUsage[]>([]);
    const [gameDurations, setGameDurations] = useState<GameDurations | null>(null);
    const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);

    useEffect(() => {
        if (isAdmin) {
            loadData();
        }
    }, [isAdmin, activeTab, balanceVersion, startDate, endDate]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'overview') {
                const stats = await apiService.getOverallStats(balanceVersion || undefined, startDate || undefined, endDate || undefined);
                setOverallStats(stats);
            } else if (activeTab === 'characters') {
                const rates = await apiService.getCharacterWinRates(balanceVersion || undefined, startDate || undefined, endDate || undefined);
                setCharacterWinRates(rates || []);
            } else if (activeTab === 'cards') {
                const usage = await apiService.getCardUsage(balanceVersion || undefined, startDate || undefined, endDate || undefined);
                setCardUsage(usage || []);
            } else if (activeTab === 'durations') {
                const durations = await apiService.getGameDurations(balanceVersion || undefined, startDate || undefined, endDate || undefined);
                setGameDurations(durations);
            } else if (activeTab === 'players') {
                const stats = await apiService.getPlayerStats(undefined, startDate || undefined, endDate || undefined);
                setPlayerStats(stats || []);
            }
        } catch (error: any) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (format: 'json' | 'csv') => {
        try {
            const response = await apiService.exportData(format, balanceVersion || undefined, startDate || undefined, endDate || undefined);

            if (format === 'csv') {
                // CSV data is already a string
                const csvContent = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `cosmos-combat-analytics-${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            } else {
                // JSON data is an array
                const jsonContent = JSON.stringify(response.data, null, 2);
                const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `cosmos-combat-analytics-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }
        } catch (error: any) {
            console.error('Error exporting data:', error);
            alert('Error al exportar datos: ' + (error.message || 'Error desconocido'));
        }
    };

    const formatDuration = (seconds: number): string => {
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}m ${secs}s`;
    };

    if (!isAdmin) {
        return (
            <div className="analytics-page">
                <div className="analytics-container">
                    <h1>Acceso Denegado</h1>
                    <p>Necesitas permisos de administrador para acceder a esta página.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="analytics-page">
            <div className="analytics-container">
                <header className="analytics-header">
                    <div>
                        <Link to="/admin" className="back-link">← Volver al Panel</Link>
                        <h1>📊 Dashboard de Analytics</h1>
                    </div>
                    <div className="export-buttons">
                        <button onClick={() => handleExport('json')} className="export-btn export-json">
                            📥 Exportar JSON
                        </button>
                        <button onClick={() => handleExport('csv')} className="export-btn export-csv">
                            📥 Exportar CSV
                        </button>
                    </div>
                </header>

                <div className="filters-section">
                    <div className="filter-group">
                        <label>Versión de Balance:</label>
                        <input
                            type="text"
                            value={balanceVersion}
                            onChange={(e) => setBalanceVersion(e.target.value)}
                            placeholder="Ej: 1.0.0"
                        />
                    </div>
                    <div className="filter-group">
                        <label>Fecha Inicio:</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <label>Fecha Fin:</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <button onClick={loadData} className="refresh-btn">🔄 Actualizar</button>
                </div>

                <div className="tabs">
                    <button
                        className={activeTab === 'overview' ? 'active' : ''}
                        onClick={() => setActiveTab('overview')}
                    >
                        📈 Resumen
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
                        className={activeTab === 'players' ? 'active' : ''}
                        onClick={() => setActiveTab('players')}
                    >
                        👥 Jugadores
                    </button>
                    <button
                        className={activeTab === 'durations' ? 'active' : ''}
                        onClick={() => setActiveTab('durations')}
                    >
                        ⏱️ Duraciones
                    </button>
                </div>

                {loading ? (
                    <div className="loading">Cargando datos...</div>
                ) : (
                    <div className="content">
                        {activeTab === 'overview' && overallStats && (
                            <OverviewSection stats={overallStats} />
                        )}
                        {activeTab === 'characters' && (
                            <CharactersSection winRates={characterWinRates} />
                        )}
                        {activeTab === 'cards' && (
                            <CardsSection cardUsage={cardUsage} />
                        )}
                        {activeTab === 'players' && (
                            <PlayersSection playerStats={playerStats} />
                        )}
                        {activeTab === 'durations' && gameDurations && (
                            <DurationsSection durations={gameDurations} formatDuration={formatDuration} />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function OverviewSection({ stats }: { stats: OverallStats }) {
    return (
        <div className="overview-section">
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total de Partidas</h3>
                    <p className="stat-value">{stats.totalGames}</p>
                </div>
                <div className="stat-card">
                    <h3>Jugadores Únicos</h3>
                    <p className="stat-value">{stats.totalPlayers}</p>
                </div>
                <div className="stat-card">
                    <h3>Duración Promedio</h3>
                    <p className="stat-value">{Math.floor(stats.averageGameDuration / 60)}m {stats.averageGameDuration % 60}s</p>
                </div>
                <div className="stat-card">
                    <h3>Turnos Promedio</h3>
                    <p className="stat-value">{stats.averageTurnsPerGame}</p>
                </div>
                <div className="stat-card">
                    <h3>Acciones Promedio</h3>
                    <p className="stat-value">{stats.averageActionsPerGame}</p>
                </div>
                <div className="stat-card">
                    <h3>Daño Total</h3>
                    <p className="stat-value">{stats.totalDamage}</p>
                </div>
                <div className="stat-card">
                    <h3>Curación Total</h3>
                    <p className="stat-value">{stats.totalHealing}</p>
                </div>
                <div className="stat-card">
                    <h3>Personaje Más Jugado</h3>
                    <p className="stat-value">{stats.mostPlayedCharacter || 'N/A'}</p>
                </div>
                <div className="stat-card">
                    <h3>Carta Más Jugada</h3>
                    <p className="stat-value">{stats.mostPlayedCard || 'N/A'}</p>
                </div>
            </div>
        </div>
    );
}

function CharactersSection({ winRates }: { winRates: CharacterWinRate[] }) {
    const maxWinRate = winRates.length > 0 ? Math.max(...winRates.map(c => c.winRate)) : 100;

    return (
        <div className="characters-section">
            <h2>Win Rates por Personaje</h2>
            {winRates.length === 0 ? (
                <p>No hay datos disponibles</p>
            ) : (
                <div className="win-rates-list">
                    {winRates.map((character) => (
                        <div key={character.characterId} className="win-rate-item">
                            <div className="character-info">
                                <h3>{character.characterName}</h3>
                                <div className="character-stats">
                                    <span>Jugado: {character.gamesPlayed}</span>
                                    <span>Victorias: {character.wins}</span>
                                    <span className="win-rate">Win Rate: {character.winRate.toFixed(1)}%</span>
                                </div>
                            </div>
                            <div className="bar-container">
                                <div
                                    className="bar-fill"
                                    style={{
                                        width: `${(character.winRate / maxWinRate) * 100}%`,
                                        backgroundColor: character.winRate >= 50 ? '#4caf50' : character.winRate >= 40 ? '#ff9800' : '#f44336',
                                    }}
                                >
                                    <span className="bar-label">{character.winRate.toFixed(1)}%</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function CardsSection({ cardUsage }: { cardUsage: CardUsage[] }) {
    const maxUsage = cardUsage.length > 0 ? Math.max(...cardUsage.map(c => c.timesPlayed)) : 1;

    return (
        <div className="cards-section">
            <h2>Uso de Cartas</h2>
            {cardUsage.length === 0 ? (
                <p>No hay datos disponibles</p>
            ) : (
                <div className="card-usage-list">
                    {cardUsage.slice(0, 20).map((card) => (
                        <div key={card.cardId} className="card-usage-item">
                            <div className="card-info">
                                <h3>{card.cardName}</h3>
                                <div className="card-stats">
                                    <span>Jugada: {card.timesPlayed} veces</span>
                                    {card.totalDamage > 0 && <span>Daño Total: {card.totalDamage}</span>}
                                    {card.totalHealing > 0 && <span>Curación Total: {card.totalHealing}</span>}
                                    {card.avgDamage > 0 && <span>Daño Promedio: {card.avgDamage.toFixed(1)}</span>}
                                    {card.avgHealing > 0 && <span>Curación Promedio: {card.avgHealing.toFixed(1)}</span>}
                                </div>
                            </div>
                            <div className="bar-container">
                                <div
                                    className="bar-fill"
                                    style={{
                                        width: `${(card.timesPlayed / maxUsage) * 100}%`,
                                        backgroundColor: '#2196f3',
                                    }}
                                >
                                    <span className="bar-label">{card.timesPlayed}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function PlayersSection({ playerStats }: { playerStats: PlayerStats[] }) {
    const maxWinRate = playerStats.length > 0 ? Math.max(...playerStats.map(p => p.winRate)) : 100;

    return (
        <div className="players-section">
            <h2>Estadísticas de Jugadores</h2>
            {playerStats.length === 0 ? (
                <p>No hay datos disponibles</p>
            ) : (
                <div className="player-stats-list">
                    {playerStats.map((player) => (
                        <div key={player.playerId} className="player-stat-item">
                            <div className="player-info">
                                <h3>{player.playerName}</h3>
                                <div className="player-stats">
                                    <span>Partidas: {player.gamesPlayed}</span>
                                    <span>Victorias: {player.wins}</span>
                                    <span className="win-rate">Win Rate: {player.winRate.toFixed(1)}%</span>
                                    <span>Daño Promedio: {player.avgDamage.toFixed(1)}</span>
                                    <span>Curación Promedio: {player.avgHealing.toFixed(1)}</span>
                                </div>
                            </div>
                            <div className="bar-container">
                                <div
                                    className="bar-fill"
                                    style={{
                                        width: `${(player.winRate / maxWinRate) * 100}%`,
                                        backgroundColor: player.winRate >= 50 ? '#4caf50' : player.winRate >= 40 ? '#ff9800' : '#f44336',
                                    }}
                                >
                                    <span className="bar-label">{player.winRate.toFixed(1)}%</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function DurationsSection({ durations, formatDuration }: { durations: GameDurations; formatDuration: (s: number) => string }) {
    return (
        <div className="durations-section">
            <h2>Estadísticas de Duración</h2>
            <div className="duration-stats">
                <div className="duration-card">
                    <h3>Promedio</h3>
                    <p className="duration-value">{formatDuration(durations.average)}</p>
                </div>
                <div className="duration-card">
                    <h3>Mínimo</h3>
                    <p className="duration-value">{formatDuration(durations.min)}</p>
                </div>
                <div className="duration-card">
                    <h3>Máximo</h3>
                    <p className="duration-value">{formatDuration(durations.max)}</p>
                </div>
                <div className="duration-card">
                    <h3>Mediana</h3>
                    <p className="duration-value">{formatDuration(durations.median)}</p>
                </div>
                <div className="duration-card">
                    <h3>Total Partidas</h3>
                    <p className="duration-value">{durations.totalGames}</p>
                </div>
            </div>
        </div>
    );
}

export default AnalyticsPage;

