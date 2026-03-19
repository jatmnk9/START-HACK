import type { Asset } from '../../types';
import './AssetCard.css';

interface AssetCardProps {
  asset: Asset;
  quantity: number;
  onBuy: (asset: Asset, qty: number) => void;
  onQuantityChange: (assetId: string, qty: number) => void;
  canAfford: boolean;
  compact?: boolean;
}

export default function AssetCard({ asset, quantity, onBuy, onQuantityChange, canAfford, compact }: AssetCardProps) {
  if (compact) {
    return (
      <div className="asset-card-compact">
        <div className="ac-top">
          <span className="ac-icon">{asset.icon}</span>
          <div className="ac-info">
            <span className="ac-name">{asset.name}</span>
            <span className="ac-price">CHF {asset.price}</span>
          </div>
        </div>
        <div className="ac-actions">
          <div className="qty-ctrl">
            <button onClick={() => onQuantityChange(asset.id, Math.max(1, quantity - 1))}>−</button>
            <span>{quantity}</span>
            <button onClick={() => onQuantityChange(asset.id, quantity + 1)}>+</button>
          </div>
          <button className="ac-buy" onClick={() => onBuy(asset, quantity)} disabled={!canAfford}>
            Comprar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`asset-card-full type-${asset.type}`}>
      <div className="ac-header">
        <span className="ac-icon-lg">{asset.icon}</span>
        <div className="ac-meta">
          <span className="ac-name-lg">{asset.name}</span>
          <span className="ac-ticker">{asset.ticker}</span>
        </div>
        <span className="ac-price-lg">CHF {asset.price}</span>
      </div>
      <p className="ac-desc">{asset.description}</p>
      <div className="ac-badges">
        <span className="ac-type-badge">{asset.type.toUpperCase()}</span>
        <span className="ac-sector-badge">{asset.sector}</span>
      </div>
      <div className="ac-actions-full">
        <div className="qty-ctrl">
          <button onClick={() => onQuantityChange(asset.id, Math.max(1, quantity - 1))}>−</button>
          <span>{quantity}</span>
          <button onClick={() => onQuantityChange(asset.id, quantity + 1)}>+</button>
        </div>
        <button
          className={`ac-buy-full ${!canAfford ? 'disabled' : ''}`}
          onClick={() => onBuy(asset, quantity)}
          disabled={!canAfford}
        >
          Comprar (CHF {(quantity * asset.price).toLocaleString()})
        </button>
      </div>
    </div>
  );
}
