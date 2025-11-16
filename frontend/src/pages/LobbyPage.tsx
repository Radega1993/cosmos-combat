import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { socketService } from '../services/socket.service';
import { useLobbyStore } from '../store/lobby.store';
import { useAuth } from '../contexts/AuthContext';
import './LobbyPage.css';

function LobbyPage() {
    const navigate = useNavigate();
    const { setCurrentGame, setCurrentPlayerId, setError, currentGame } = useLobbyStore();
    const { user, isAuthenticated, logout } = useAuth();
    const [playerName, setPlayerName] = useState(user?.username || '');
    const [gameId, setGameId] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [gameMode, setGameMode] = useState<'random' | 'select'>('random');

    // Update player name when user changes
    useEffect(() => {
        if (user?.username) {
            setPlayerName(user.username);
        }
    }, [user]);

    useEffect(() => {
        socketService.connect();

        // Setup error handler
        socketService.onError((error) => {
            setError(error.message);
            setIsCreating(false);
            setIsJoining(false);
        });

        // Setup game event handlers
        socketService.onPlayerJoined((data) => {
            setCurrentGame(data.game);
        });

        socketService.onPlayerLeft((data) => {
            setCurrentGame(data.game);
        });

        socketService.onCharacterSelected((data) => {
            setCurrentGame(data.game);
        });

        socketService.onPlayerReady((data) => {
            setCurrentGame(data.game);
        });

        socketService.onGameClosed(() => {
            setCurrentGame(null);
            setCurrentPlayerId(null);
            navigate('/');
        });

        return () => {
            socketService.off('lobby:game-created');
            socketService.off('lobby:game-joined');
            socketService.off('lobby:player-joined');
            socketService.off('lobby:player-left');
            socketService.off('lobby:character-selected');
            socketService.off('lobby:player-ready');
            socketService.off('lobby:game-closed');
            socketService.off('error');
        };
    }, [navigate, setCurrentGame, setCurrentPlayerId, setError]);

    const handleCreateGame = () => {
        if (!playerName.trim()) {
            setError('Please enter your name');
            return;
        }

        setIsCreating(true);
        setError(null);

        socketService.createGame(playerName, gameMode, (data) => {
            setCurrentGame(data.game);
            setCurrentPlayerId(data.playerId);
            setIsCreating(false);
            navigate(`/game/${data.gameId}`);
        });
    };

    const handleJoinGame = () => {
        if (!playerName.trim()) {
            setError('Please enter your name');
            return;
        }
        if (!gameId.trim()) {
            setError('Please enter a game ID');
            return;
        }

        setIsJoining(true);
        setError(null);

        socketService.joinGame(gameId, playerName, (data) => {
            setCurrentGame(data.game);
            setCurrentPlayerId(data.playerId);
            setIsJoining(false);
            navigate(`/game/${data.gameId}`);
        });
    };

    return (
        <div className="lobby-page">
            <div className="lobby-container">
                <div className="lobby-header">
                    {isAuthenticated ? (
                        <div className="user-info">
                            <span>👤 {user?.username}</span>
                            {user?.role === 'admin' && (
                                <Link to="/admin" className="admin-link">
                                    🛡️ Admin
                                </Link>
                            )}
                            <button onClick={logout}>Cerrar Sesión</button>
                        </div>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login">Iniciar Sesión</Link>
                            <Link to="/register">Registrarse</Link>
                        </div>
                    )}
                    <h1 className="lobby-title">🌌 Cosmos Combat</h1>
                    <p className="lobby-subtitle">Por Raül de Arriba</p>
                    <div className="game-info-badges">
                        <span className="info-badge">👥 2-6 Jugadores</span>
                        <span className="info-badge">🎯 Edad 7+</span>
                        <span className="info-badge">🎴 79 Cartas</span>
                        <span className="info-badge">👽 6 Personajes</span>
                    </div>
                    <p className="lobby-description">
                        Un emocionante juego de cartas donde los jugadores asumen el papel de alienígenas luchadores
                        en una batalla cósmica. El objetivo es eliminar a los oponentes, reduciendo sus puntos de vida a cero.
                    </p>
                    <Link to="/how-to-play" className="how-to-play-link">
                        📖 ¿Cómo se juega?
                    </Link>
                </div>

                <div className="lobby-actions">
                    <div className="lobby-section">
                        <h2>Create Game</h2>
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder={isAuthenticated ? user?.username : "Your name"}
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                disabled={(isCreating || isJoining) || isAuthenticated}
                                title={isAuthenticated ? "Usando tu nombre de usuario" : "Ingresa tu nombre"}
                            />
                            <div className="game-mode-selector">
                                <label className="game-mode-label">Game Mode:</label>
                                <div className="game-mode-options">
                                    <label className="game-mode-option">
                                        <input
                                            type="radio"
                                            name="gameMode"
                                            value="random"
                                            checked={gameMode === 'random'}
                                            onChange={(e) => setGameMode(e.target.value as 'random' | 'select')}
                                            disabled={isCreating || isJoining}
                                        />
                                        <span>🎲 Random Characters</span>
                                    </label>
                                    <label className="game-mode-option">
                                        <input
                                            type="radio"
                                            name="gameMode"
                                            value="select"
                                            checked={gameMode === 'select'}
                                            onChange={(e) => setGameMode(e.target.value as 'random' | 'select')}
                                            disabled={isCreating || isJoining}
                                        />
                                        <span>👤 Select Characters</span>
                                    </label>
                                </div>
                            </div>
                            <button onClick={handleCreateGame} disabled={isCreating || isJoining}>
                                {isCreating ? 'Creating...' : 'Create Game'}
                            </button>
                        </div>
                    </div>

                    <div className="lobby-divider">OR</div>

                    <div className="lobby-section">
                        <h2>Join Game</h2>
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder={isAuthenticated ? user?.username : "Your name"}
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                disabled={(isCreating || isJoining) || isAuthenticated}
                                title={isAuthenticated ? "Usando tu nombre de usuario" : "Ingresa tu nombre"}
                            />
                            <input
                                type="text"
                                placeholder="Game ID"
                                value={gameId}
                                onChange={(e) => setGameId(e.target.value)}
                                disabled={isCreating || isJoining}
                            />
                            <button onClick={handleJoinGame} disabled={isCreating || isJoining}>
                                {isJoining ? 'Joining...' : 'Join Game'}
                            </button>
                        </div>
                    </div>
                </div>

                {useLobbyStore.getState().error && (
                    <div className="error-message">{useLobbyStore.getState().error}</div>
                )}

                {currentGame && (
                    <div className="current-game-info">
                        <h3>Current Game: {currentGame.gameId}</h3>
                        <p>Players: {currentGame.players.length}/{currentGame.maxPlayers}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default LobbyPage;

