import type { PowerCard } from '../../types';
import './PowerCardItem.css';

interface PowerCardItemProps {
  card: PowerCard;
  onUse?: (card: PowerCard) => void;
  onBuy?: (cardId: string) => void;
  disabled?: boolean;
  used?: boolean;
  owned?: boolean;
  canAfford?: boolean;
  mini?: boolean;
}

export default function PowerCardItem({ card, onUse, onBuy, disabled, used, owned, canAfford, mini }: PowerCardItemProps) {
  if (mini) {
    return (
      <div className="pc-mini">
        <span className="pc-mini-icon">{card.icon}</span>
        <span className="pc-mini-name">{card.name}</span>
      </div>
    );
  }

  return (
    <div className={`pc-card ${card.type} ${used ? 'used' : ''} ${owned ? 'owned' : ''}`}>
      <div className="pc-top">
        <span className="pc-icon-lg">{card.icon}</span>
        <span className={`pc-type-badge ${card.type}`}>
          {card.type === 'offensive' ? '⚔️ Ofensiva' : '🛡️ Defensiva'}
        </span>
      </div>
      <div className="pc-body">
        <span className="pc-name-lg">{card.name}</span>
        <p className="pc-desc-lg">{card.description}</p>
      </div>
      <div className="pc-footer">
        <span className="pc-cost">✨ {card.cost} XP</span>
        {onUse && (
          <button className="pc-use-btn" onClick={() => onUse(card)} disabled={disabled || used}>
            {used ? '✅ Usada' : 'Usar'}
          </button>
        )}
        {onBuy && (
          owned ? (
            <span className="pc-owned-tag">✅ En tu mazo</span>
          ) : (
            <button className="pc-buy-btn" onClick={() => onBuy(card.id)} disabled={!canAfford}>
              {canAfford ? 'Comprar' : 'XP insuficiente'}
            </button>
          )
        )}
      </div>
    </div>
  );
}
