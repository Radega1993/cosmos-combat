import { Link } from 'react-router-dom';
import './HowToPlayPage.css';

function HowToPlayPage() {
    return (
        <div className="how-to-play-page">
            <div className="how-to-play-container">
                <div className="how-to-play-header">
                    <h1 className="page-title">🌌 Cómo Jugar Cosmos Combat</h1>
                    <p className="game-author">Por Raül de Arriba</p>
                    <div className="game-info-badges">
                        <span className="info-badge">👥 2-6 Jugadores</span>
                        <span className="info-badge">🎯 Edad 7+</span>
                        <span className="info-badge">🎴 79 Cartas</span>
                        <span className="info-badge">👽 6 Personajes</span>
                    </div>
                    <Link to="/" className="back-button">
                        ← Volver al Lobby
                    </Link>
                </div>

                <div className="how-to-play-content">
                    <section className="rules-section">
                        <h2>🎯 Objetivo del Juego</h2>
                        <p>
                            Cosmos Combat es un emocionante juego de cartas en el que los jugadores asumen el papel de alienígenas luchadores
                            en una batalla cósmica. El objetivo del juego es eliminar a los oponentes, reduciendo sus puntos de vida a cero.
                            ¡Prepárate para enfrentarte a desafíos, utilizar habilidades especiales y demostrar tu dominio en el combate intergaláctico!
                        </p>
                    </section>

                    <section className="rules-section">
                        <h2>📦 Componentes del Juego</h2>
                        <div className="rules-list">
                            <div className="rule-item">
                                <span className="rule-icon">👽</span>
                                <div>
                                    <h3>Cartas de Personajes</h3>
                                    <p>Incluye 6 cartas de personajes únicos con habilidades especiales, puntos de vida y atributos específicos.</p>
                                </div>
                            </div>
                            <div className="rule-item">
                                <span className="rule-icon">🃏</span>
                                <div>
                                    <h3>Mazo de Cartas de Habilidades</h3>
                                    <p>Contiene 79 cartas con habilidades especiales para atacar, defenderse y obtener ventajas estratégicas.</p>
                                </div>
                            </div>
                            <div className="rule-item">
                                <span className="rule-icon">❤️</span>
                                <div>
                                    <h3>Contadores de Puntos de Vida</h3>
                                    <p>Lleva el registro de los puntos de vida de cada jugador.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="rules-section">
                        <h2>🎮 Modos de Juego</h2>
                        <div className="game-modes-grid">
                            <div className="mode-card">
                                <div className="mode-icon">🎲</div>
                                <h3>Modo Aleatorio</h3>
                                <p>
                                    Los personajes se asignan automáticamente de forma aleatoria a cada jugador.
                                    Este es el modo predeterminado y el más rápido para comenzar una partida.
                                </p>
                            </div>
                            <div className="mode-card">
                                <div className="mode-icon">👤</div>
                                <h3>Modo Selección</h3>
                                <p>
                                    Cada jugador elige su personaje antes de iniciar la partida.
                                    Permite estrategias más planificadas y conocimiento de las habilidades de cada personaje.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="rules-section">
                        <h2>⚙️ Preparación</h2>
                        <div className="preparation-steps">
                            <div className="step-item">
                                <span className="step-number">1</span>
                                <p>
                                    <strong>Selección de Personaje:</strong> Según el modo de juego elegido,
                                    cada jugador baraja las cartas de personajes y elige uno al azar (modo aleatorio)
                                    o selecciona uno manualmente (modo selección).
                                </p>
                            </div>
                            <div className="step-item">
                                <span className="step-number">2</span>
                                <p>
                                    <strong>Puntos de Vida:</strong> Coloca el contador de puntos de vida en el valor inicial
                                    especificado en tu carta de personaje.
                                </p>
                            </div>
                            <div className="step-item">
                                <span className="step-number">3</span>
                                <p>
                                    <strong>Mazo Inicial:</strong> Reparte 3 cartas del mazo de cartas de habilidades a cada jugador.
                                </p>
                            </div>
                            <div className="step-item">
                                <span className="step-number">4</span>
                                <p>
                                    <strong>Mazo de Robo:</strong> Baraja el resto del mazo de cartas de habilidades y
                                    colócalo en el centro de la mesa como mazo de robo.
                                </p>
                            </div>
                            <div className="step-item">
                                <span className="step-number">5</span>
                                <p>
                                    <strong>Orden de Juego:</strong> Determina el orden de juego.
                                    En el juego digital, el orden se determina automáticamente por la velocidad base de cada personaje.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="rules-section">
                        <h2>🔄 Desarrollo del Juego</h2>
                        <div className="rules-list">
                            <div className="rule-item">
                                <span className="rule-icon">⏰</span>
                                <div>
                                    <h3>Turnos</h3>
                                    <p>Los jugadores se turnan en sentido horario (o según el orden determinado por velocidad).</p>
                                </div>
                            </div>
                            <div className="rule-item">
                                <span className="rule-icon">⚡</span>
                                <div>
                                    <h3>Acciones por Turno</h3>
                                    <p>En tu turno, tienes 2 acciones para atacar, utilizar habilidades especiales o jugar una carta de la mano.</p>
                                </div>
                            </div>
                            <div className="rule-item">
                                <span className="rule-icon">🃏</span>
                                <div>
                                    <h3>Jugar Cartas</h3>
                                    <p>Para jugar una carta de habilidad, debes cumplir los requisitos o restricciones especificados en la carta.</p>
                                </div>
                            </div>
                            <div className="rule-item">
                                <span className="rule-icon">👥</span>
                                <div>
                                    <h3>Interacción</h3>
                                    <p>Interactúa con otros jugadores mediante ataques, defensas, cartas de interrupción o acciones especiales.</p>
                                </div>
                            </div>
                            <div className="rule-item">
                                <span className="rule-icon">💚</span>
                                <div>
                                    <h3>Puntos de Vida</h3>
                                    <p>Los puntos de vida se actualizan según el daño recibido o las habilidades utilizadas.
                                        Al llegar a cero, un jugador queda eliminado.</p>
                                </div>
                            </div>
                            <div className="rule-item">
                                <span className="rule-icon">🎴</span>
                                <div>
                                    <h3>Robo de Cartas</h3>
                                    <p>Al final de tu turno, roba 2 cartas del mazo de cartas de habilidades.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="rules-section">
                        <h2>⚔️ Fases de una Acción</h2>
                        <p>Durante tu turno, puedes realizar las siguientes acciones (hasta 2 acciones por turno):</p>
                        <div className="phases-list">
                            <div className="phase-item">
                                <div className="phase-header">
                                    <span className="phase-number">1</span>
                                    <h3>Realiza un Ataque Básico</h3>
                                </div>
                                <p>Inflige 1 punto de daño a un objetivo.</p>
                            </div>
                            <div className="phase-item">
                                <div className="phase-header">
                                    <span className="phase-number">2</span>
                                    <h3>Utiliza una Habilidad Especial</h3>
                                </div>
                                <p>Activa una habilidad especial de tu personaje (si está disponible y no está en cooldown).</p>
                            </div>
                            <div className="phase-item">
                                <div className="phase-header">
                                    <span className="phase-number">3</span>
                                    <h3>Juega una Carta</h3>
                                </div>
                                <p>Juega una carta de la mano siguiendo sus instrucciones y efectos.</p>
                            </div>
                        </div>
                    </section>

                    <section className="rules-section">
                        <h2>🛡️ Sistema de Defensa</h2>
                        <div className="defense-rules">
                            <div className="defense-rule">
                                <h3>Defensa Básica vs Ataque Básico</h3>
                                <p>
                                    Si el ataque y la defensa son del mismo tipo (ataque básico - defensa básica),
                                    lanza los dados. El mayor resultado gana.
                                </p>
                            </div>
                            <div className="defense-rule">
                                <h3>Defensa Superior</h3>
                                <p>
                                    Si juegas una defensa de mayor nivel que el ataque (ataque básico - carta de habilidad defensiva),
                                    no necesitas dados. La defensa gana automáticamente.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="rules-section">
                        <h2>✨ Efectos y Estados</h2>
                        <div className="effects-grid">
                            <div className="effect-card">
                                <div className="effect-icon">⚡</div>
                                <h3>Parálisis</h3>
                                <p>Pierdes 1 punto de acción. Puedes curar la parálisis con una tirada de 6.</p>
                            </div>
                            <div className="effect-card">
                                <div className="effect-icon">🔥</div>
                                <h3>Quemadura</h3>
                                <p>Descartas una carta de tu mano.</p>
                            </div>
                            <div className="effect-card">
                                <div className="effect-icon">❄️</div>
                                <h3>Congelación</h3>
                                <p>Pierdes 1 punto de acción. Puedes curar la congelación con una tirada de 6.</p>
                            </div>
                            <div className="effect-card">
                                <div className="effect-icon">🛡️</div>
                                <h3>Escudo</h3>
                                <p>Absorbe daño antes de que afecte los puntos de vida.</p>
                            </div>
                        </div>
                    </section>

                    <section className="rules-section">
                        <h2>🏆 Final del Juego</h2>
                        <p>
                            La partida termina cuando solo queda un jugador en pie.
                            ¡Ese jugador es el ganador de la partida!
                        </p>
                    </section>

                    <section className="rules-section">
                        <h2>📊 Estrategia y Consejos</h2>
                        <div className="tips-list">
                            <div className="tip-item">
                                <span className="tip-number">1</span>
                                <p>Gestiona tu mano cuidadosamente. No siempre es mejor jugar todas tus cartas.</p>
                            </div>
                            <div className="tip-item">
                                <span className="tip-number">2</span>
                                <p>Los escudos son valiosos. Úsalos antes de recibir daño masivo.</p>
                            </div>
                            <div className="tip-item">
                                <span className="tip-number">3</span>
                                <p>Observa los efectos activos de tus oponentes. Planifica tus acciones en consecuencia.</p>
                            </div>
                            <div className="tip-item">
                                <span className="tip-number">4</span>
                                <p>El orden de turnos importa. A veces es mejor esperar antes de atacar.</p>
                            </div>
                            <div className="tip-item">
                                <span className="tip-number">5</span>
                                <p>Conoce las fortalezas y debilidades de cada personaje. Cada uno tiene un estilo de juego único.</p>
                            </div>
                        </div>
                    </section>

                    <div className="ready-to-play">
                        <h2>🚀 ¿Listo para Combatir?</h2>
                        <Link to="/" className="play-button">
                            Ir al Lobby
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HowToPlayPage;
