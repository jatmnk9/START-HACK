import { useGame } from '../context/GameContext';
import GameLayout, { LeftPanel, RightPanel } from './ui/GameLayout';
import PowerCardItem from './ui/PowerCardItem';
import './Hub.css';

export default function Hub() {
  const { state, dispatch } = useGame();
  const player = state.player!;
  const arenaUnlocked = player.level >= 10;

  const portfolioValue = player.portfolio.reduce(
    (sum, item) => sum + item.asset.price * item.quantity,
    0
  );
  const netWorth = player.balance + portfolioValue;
  const xpProgress = ((player.level * 100 - player.xpToNextLevel) / (player.level * 100)) * 100;

  return (
    <GameLayout className="hub-bg">
      {/* Left Panel — Player Profile */}
      <LeftPanel className="hub-left">
        <div className="hub-profile">
          <span className="hub-avatar">{player.avatar}</span>
          <h2 className="hub-username">{player.username}</h2>
          <span className="hub-level-badge">Nivel {player.level}</span>
        </div>

        <div className="hub-xp">
          <div className="hub-xp-bar">
            <div className="hub-xp-fill" style={{ width: `${xpProgress}%` }} />
          </div>
          <span className="hub-xp-text">{player.xpToNextLevel} XP → Nivel {player.level + 1}</span>
        </div>

        <div className="hub-stats-grid">
          <div className="hub-stat">
            <span className="hs-label">Balance</span>
            <span className="hs-value gold">CHF {player.balance.toLocaleString()}</span>
          </div>
          <div className="hub-stat">
            <span className="hs-label">Net Worth</span>
            <span className="hs-value">CHF {Math.round(netWorth).toLocaleString()}</span>
          </div>
          <div className="hub-stat">
            <span className="hs-label">XP Total</span>
            <span className="hs-value xp">{player.xp}</span>
          </div>
          <div className="hub-stat">
            <span className="hs-label">Olas</span>
            <span className="hs-value">{player.completedWaves}</span>
          </div>
        </div>

        {/* Portfolio mini */}
        {player.portfolio.length > 0 && (
          <div className="hub-section">
            <h4 className="hub-section-title">📊 Portafolio</h4>
            <div className="hub-portfolio">
              {player.portfolio.map((item) => (
                <div key={item.asset.id} className="hp-item">
                  <span className="hp-icon">{item.asset.buildingEmoji}</span>
                  <div className="hp-info">
                    <span className="hp-name">{item.asset.name}</span>
                    <span className="hp-qty">x{item.quantity}</span>
                  </div>
                  <span className="hp-val">CHF {(item.asset.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Power Cards mini */}
        <div className="hub-section">
          <h4 className="hub-section-title">🃏 Mazo ({player.powerCards.length})</h4>
          {player.powerCards.length === 0 ? (
            <p className="hub-empty">Mazo vacío. Compra cartas en la Tienda.</p>
          ) : (
            <div className="hub-cards">
              {player.powerCards.map((card) => (
                <PowerCardItem key={card.id} card={card} mini />
              ))}
            </div>
          )}
        </div>
      </LeftPanel>

      {/* Right Panel — Game Modes */}
      <RightPanel className="hub-right">
        <h1 className="hub-title">🏠 Campamento Base</h1>

        <div className="hub-modes">
          <button
            className="mode-card survival"
            onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'survival' })}
          >
            <div className="mc-left">
              <span className="mc-icon">🌊</span>
            </div>
            <div className="mc-body">
              <h3>Supervivencia Histórica</h3>
              <p>Enfrenta eventos reales del mercado y protege tu portafolio.</p>
              <div className="mc-meta">
                <span className="mc-badge">{player.completedWaves} olas superadas</span>
                <span className="mc-action">Jugar →</span>
              </div>
            </div>
          </button>

          <button
            className={`mode-card arena ${!arenaUnlocked ? 'locked' : ''}`}
            onClick={() => arenaUnlocked && dispatch({ type: 'SET_SCREEN', screen: 'arena' })}
            disabled={!arenaUnlocked}
          >
            <div className="mc-left">
              <span className="mc-icon">{arenaUnlocked ? '⚔️' : '🔒'}</span>
            </div>
            <div className="mc-body">
              <h3>Arena 1v1</h3>
              <p>
                {arenaUnlocked
                  ? 'Enfréntate a otro inversor en tiempo real.'
                  : `Se desbloquea en Nivel 10. Te faltan ${10 - player.level} niveles.`}
              </p>
              {!arenaUnlocked && (
                <div className="mc-lock-bar">
                  <div className="mc-lock-fill" style={{ width: `${(player.level / 10) * 100}%` }} />
                </div>
              )}
              <div className="mc-meta">
                <span className="mc-action">
                  {arenaUnlocked ? 'Entrar a la Arena →' : 'Bloqueado 🔒'}
                </span>
              </div>
            </div>
          </button>
        </div>

        <button
          className="hub-shop-btn"
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'shop' })}
        >
          🛒 Tienda de Cartas de Poder
        </button>
      </RightPanel>
    </GameLayout>
  );
}
