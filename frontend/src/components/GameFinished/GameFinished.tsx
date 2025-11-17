import { GameState } from '../../types/game.types';
import './GameFinished.css';

interface GameFinishedProps {
    gameState: GameState;
    currentPlayerId: string | null;
}

function GameFinished({ gameState, currentPlayerId }: GameFinishedProps) {
    const winner = gameState.players.find((p) => p.hp > 0);
    const isWinner = winner?.playerId === currentPlayerId;

    return (
        <div className="game-finished">
            <div className="finished-content">
                <h2 className="finished-title">¡Partida Finalizada!</h2>

                {winner ? (
                    <>
                        <div className={`winner-announcement ${isWinner ? 'you-won' : 'you-lost'}`}>
                            {isWinner ? (
                                <>
                                    <h3>🎉 ¡Has Ganado! 🎉</h3>
                                    <p>¡Enhorabuena! ¡Eres el último jugador en pie!</p>
                                </>
                            ) : (
                                <>
                                    <h3>🏆 ¡{winner.playerName} Ha Ganado!</h3>
                                    <p>¡Mejor suerte la próxima vez!</p>
                                </>
                            )}
                        </div>

                        <div className="final-stats">
                            <h4>Estadísticas Finales</h4>
                            <div className="stats-grid">
                                <div className="stat-item">
                                    <span className="stat-label">Turnos Totales:</span>
                                    <span className="stat-value">{gameState.currentTurn || 0}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Duración:</span>
                                    <span className="stat-value">
                                        {gameState.gameStats?.duration !== undefined
                                            ? `${Math.floor(gameState.gameStats.duration / 60)}m ${gameState.gameStats.duration % 60}s`
                                            : 'N/D'}
                                    </span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Acciones Totales:</span>
                                    <span className="stat-value">{gameState.gameStats?.totalActions || 0}</span>
                                </div>
                            </div>
                        </div>

                        <div className="final-standings">
                            <h4>Clasificación Final</h4>
                            <div className="standings-list">
                                {gameState.players
                                    .sort((a, b) => b.hp - a.hp)
                                    .map((player, index) => (
                                        <div
                                            key={player.playerId}
                                            className={`standing-item ${player.playerId === currentPlayerId ? 'your-standing' : ''} ${player.hp > 0 ? 'winner' : 'defeated'}`}
                                        >
                                            <span className="position">#{index + 1}</span>
                                            <span className="player-name">{player.playerName}</span>
                                            <span className="final-hp">{player.hp} / {player.maxHp} PV</span>
                                            {player.hp > 0 && <span className="winner-badge">🏆 Ganador</span>}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="draw-announcement">
                        <h3>Empate</h3>
                        <p>Sin ganador - ¡todos los jugadores fueron eliminados!</p>
                    </div>
                )}

                <div className="game-saved-notice">
                    <p>✅ Los resultados de la partida se han guardado en la base de datos para análisis</p>
                </div>
            </div>
        </div>
    );
}

export default GameFinished;

