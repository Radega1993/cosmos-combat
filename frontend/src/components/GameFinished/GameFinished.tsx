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
                <h2 className="finished-title">Game Finished!</h2>

                {winner ? (
                    <>
                        <div className={`winner-announcement ${isWinner ? 'you-won' : 'you-lost'}`}>
                            {isWinner ? (
                                <>
                                    <h3>🎉 You Won! 🎉</h3>
                                    <p>Congratulations! You are the last player standing!</p>
                                </>
                            ) : (
                                <>
                                    <h3>🏆 {winner.playerName} Won!</h3>
                                    <p>Better luck next time!</p>
                                </>
                            )}
                        </div>

                        <div className="final-stats">
                            <h4>Final Statistics</h4>
                            <div className="stats-grid">
                                <div className="stat-item">
                                    <span className="stat-label">Total Turns:</span>
                                    <span className="stat-value">{gameState.currentTurn || 0}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Duration:</span>
                                    <span className="stat-value">
                                        {gameState.gameStats?.duration !== undefined
                                            ? `${Math.floor(gameState.gameStats.duration / 60)}m ${gameState.gameStats.duration % 60}s`
                                            : 'N/A'}
                                    </span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Total Actions:</span>
                                    <span className="stat-value">{gameState.gameStats?.totalActions || 0}</span>
                                </div>
                            </div>
                        </div>

                        <div className="final-standings">
                            <h4>Final Standings</h4>
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
                                            <span className="final-hp">{player.hp} / {player.maxHp} HP</span>
                                            {player.hp > 0 && <span className="winner-badge">🏆 Winner</span>}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="draw-announcement">
                        <h3>Draw Game</h3>
                        <p>No winner - all players were eliminated!</p>
                    </div>
                )}

                <div className="game-saved-notice">
                    <p>✅ Game results have been saved to the database for analytics</p>
                </div>
            </div>
        </div>
    );
}

export default GameFinished;

