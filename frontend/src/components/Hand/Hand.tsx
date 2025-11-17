import { Card } from '../../types/game.types';
import './Hand.css';

interface HandProps {
    cards: Card[];
    onCardClick?: (card: Card) => void;
}

function Hand({ cards, onCardClick }: HandProps) {
    if (cards.length === 0) {
        return (
            <div className="hand-container">
                <h3>Tu Mano</h3>
                <div className="hand-empty">No hay cartas en la mano</div>
            </div>
        );
    }

    return (
        <div className="hand-container">
            <h3>Tu Mano ({cards.length})</h3>
            <div className="hand-cards">
                {cards.map((card, index) => (
                    <div
                        key={card.id || index}
                        className="hand-card"
                        onClick={() => onCardClick && onCardClick(card)}
                    >
                        <div className="card-image">
                            <img
                                src={`/finales mazo/${card.id}_ok.png`}
                                alt={card.name}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/finales mazo/back mazo.png';
                                }}
                            />
                        </div>
                        <div className="card-info">
                            <h4>{card.name}</h4>
                            <p>{card.description}</p>
                            <div className="card-stats">
                                {card.damage && <span>DMG: {card.damage}</span>}
                                {card.heal && <span>HEAL: {card.heal}</span>}
                                {card.defense && <span>DEF: {card.defense}</span>}
                                {card.shield && <span>SHIELD: {card.shield}</span>}
                                {card.cost !== undefined && <span>COST: {card.cost}</span>}
                                {(card.targetType === 'all' || card.targetType === 'area') && (
                                    <span className="area-badge">ÁREA</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Hand;

