import './CityView.css';

interface Building {
  id: string;
  emoji: string;
  label: string;
  quantity: number;
  evolved?: boolean;
  change?: number;
}

interface CityViewProps {
  buildings: Building[];
  compact?: boolean;
  onSell?: (assetId: string) => void;
}

export default function CityView({ buildings, compact, onSell }: CityViewProps) {
  if (buildings.length === 0) return null;

  return (
    <div className={`city-view ${compact ? 'compact' : ''}`}>
      <div className="city-label">🏙️ Tu Ciudad</div>
      <div className="city-grid">
        {buildings.map((b) => (
          <div
            key={b.id}
            className={`city-bldg ${b.evolved ? 'evolved' : ''} ${b.change !== undefined ? (b.change > 0 ? 'glow-up' : b.change < 0 ? 'glow-down' : '') : ''}`}
          >
            <span className="bldg-emoji">{b.evolved ? '🏰' : b.emoji}</span>
            <span className="bldg-name">{b.label}</span>
            <span className="bldg-qty">x{b.quantity}</span>
            {b.change !== undefined && (
              <span className={`bldg-change ${b.change >= 0 ? 'positive' : 'negative'}`}>
                {b.change >= 0 ? '+' : ''}{b.change}%
              </span>
            )}
            {onSell && (
              <button className="bldg-sell" onClick={() => onSell(b.id)}>Vender</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
