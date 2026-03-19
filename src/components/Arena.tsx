import { useState, useEffect, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { HISTORICAL_EVENTS } from '../data/events';
import { ASSETS } from '../data/assets';
import type { Asset, PowerCard } from '../types';
import GameLayout, { LeftPanel, RightPanel, CenterPanel } from './ui/GameLayout';
import TopBar from './ui/TopBar';
import AssetCard from './ui/AssetCard';
import CityView from './ui/CityView';
import PowerCardItem from './ui/PowerCardItem';
import './Arena.css';

function generateAIPortfolio(event: typeof HISTORICAL_EVENTS[0], balance: number) {
  const benefited = ASSETS.filter((a) =>
    event.benefitedSectors.includes(a.sector)
  );
  const safe = ASSETS.filter((a) => a.type === 'bond' || a.id === 'gold');
  const pool = [...benefited, ...safe];

  const portfolio: { asset: Asset; quantity: number }[] = [];
  let remaining = balance;

  for (const asset of pool) {
    if (remaining < asset.price) continue;
    const maxQty = Math.floor(remaining / asset.price);
    const qty = Math.min(maxQty, Math.floor(Math.random() * 5) + 1);
    portfolio.push({ asset, quantity: qty });
    remaining -= qty * asset.price;
    if (remaining < 50) break;
  }

  return portfolio;
}

function calculatePortfolioChange(
  portfolio: { asset: Asset; quantity: number }[],
  event: typeof HISTORICAL_EVENTS[0]
) {
  let before = 0;
  let after = 0;
  portfolio.forEach((item) => {
    const val = item.asset.price * item.quantity;
    before += val;
    const impact = event.impacts.find((i) => i.assetId === item.asset.id);
    const change = impact ? impact.percentChange : 0;
    after += val * (1 + change / 100);
  });
  return { before, after, change: before > 0 ? ((after - before) / before) * 100 : 0 };
}

const AI_NAMES = ['Camila', 'Marco', 'Leila', 'Hans', 'Sophie', 'Diego'];

export default function Arena() {
  const { state, dispatch } = useGame();
  const player = state.player!;

  const [phase, setPhase] = useState<'matchmaking' | 'cards' | 'building' | 'impact' | 'result'>('matchmaking');
  const [event, setEvent] = useState(HISTORICAL_EVENTS[0]);
  const [opponentName] = useState(AI_NAMES[Math.floor(Math.random() * AI_NAMES.length)]);
  const [opponentAvatar] = useState(['👩‍💼', '🧑‍💼', '🦊', '🐺'][Math.floor(Math.random() * 4)]);
  const [timer, setTimer] = useState(60);
  const [usedCard, setUsedCard] = useState<PowerCard | null>(null);
  const [opponentUsedCard, setOpponentUsedCard] = useState(false);
  const [fogActive, setFogActive] = useState(false);
  const [buyQuantities, setBuyQuantities] = useState<Record<string, number>>({});
  const [opponentPortfolio, setOpponentPortfolio] = useState<{ asset: Asset; quantity: number }[]>([]);
  const [playerResult, setPlayerResult] = useState({ before: 0, after: 0, change: 0 });
  const [opponentResult, setOpponentResult] = useState({ before: 0, after: 0, change: 0 });
  const [arenaBalance, setArenaBalance] = useState(10000);
  const [arenaPortfolio, setArenaPortfolio] = useState<{ asset: Asset; quantity: number }[]>([]);

  useEffect(() => {
    if (phase !== 'matchmaking') return;
    const chosen = HISTORICAL_EVENTS[Math.floor(Math.random() * HISTORICAL_EVENTS.length)];
    setEvent(chosen);
    const timeout = setTimeout(() => setPhase('cards'), 3000);
    return () => clearTimeout(timeout);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'building') return;
    if (timer <= 0) {
      resolveArena();
      return;
    }
    const interval = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timer]);

  const resolveArena = useCallback(() => {
    const aiPort = generateAIPortfolio(event, 10000);
    setOpponentPortfolio(aiPort);
    const pResult = calculatePortfolioChange(arenaPortfolio, event);
    const oResult = calculatePortfolioChange(aiPort, event);
    if (usedCard?.effect === 'double_down') {
      pResult.change *= 2;
      pResult.after = pResult.before * (1 + pResult.change / 100);
    }
    if (usedCard?.effect === 'shield' && pResult.change < 0) {
      pResult.change /= 2;
      pResult.after = pResult.before * (1 + pResult.change / 100);
    }
    setPlayerResult(pResult);
    setOpponentResult(oResult);
    setPhase('impact');
    setTimeout(() => setPhase('result'), 4000);
  }, [arenaPortfolio, event, usedCard]);

  const handleBuy = (asset: Asset, qty: number) => {
    const cost = qty * asset.price;
    if (cost > arenaBalance) return;
    setArenaBalance((b) => b - cost);
    setArenaPortfolio((prev) => {
      const existing = prev.find((p) => p.asset.id === asset.id);
      if (existing) return prev.map((p) => p.asset.id === asset.id ? { ...p, quantity: p.quantity + qty } : p);
      return [...prev, { asset, quantity: qty }];
    });
  };

  const handleUseCard = (card: PowerCard) => {
    setUsedCard(card);
    dispatch({ type: 'REMOVE_POWER_CARD', cardId: card.id });
    if (card.effect === 'fog_of_war') setOpponentUsedCard(true);
    if (card.effect === 'time_machine') {
      const newEvent = HISTORICAL_EVENTS[Math.floor(Math.random() * HISTORICAL_EVENTS.length)];
      setEvent(newEvent);
      setTimer(30);
    }
    if (card.effect === 'insider') setFogActive(false);
  };

  const handleBackToHub = () => dispatch({ type: 'SET_SCREEN', screen: 'hub' });
  const playerWon = playerResult.change > opponentResult.change;

  // --- MATCHMAKING ---
  if (phase === 'matchmaking') {
    return (
      <GameLayout className="arena-bg">
        <CenterPanel>
          <div className="ar-match">
            <div className="ar-match-vs">
              <div className="ar-match-player">
                <span className="ar-avatar-lg">{player.avatar}</span>
                <span className="ar-name">{player.username}</span>
                <span className="ar-level">Nivel {player.level}</span>
              </div>
              <div className="ar-vs-text">VS</div>
              <div className="ar-match-player">
                <span className="ar-avatar-lg">{opponentAvatar}</span>
                <span className="ar-name">{opponentName}</span>
                <span className="ar-level">Nivel {Math.max(8, player.level + Math.floor(Math.random() * 5) - 2)}</span>
              </div>
            </div>
            <div className="ar-loading">
              <div className="ar-loader" />
              <p>Buscando oponente...</p>
            </div>
          </div>
        </CenterPanel>
      </GameLayout>
    );
  }

  // --- CARDS PHASE --- horizontal: left=event info, right=cards
  if (phase === 'cards') {
    return (
      <GameLayout className="arena-bg">
        <LeftPanel className="ar-cards-left">
          <TopBar title="⚔️ Arena 1v1" showBack backTo="hub" accent="#ff6b6b" />
          <div className="ar-event-info">
            <h3>📜 Escenario</h3>
            <span className="ar-event-name">{event.name}</span>
            <span className="ar-event-date">{event.date}</span>
            <p className="ar-event-desc">{event.description}</p>
          </div>
          {usedCard && (
            <div className="ar-card-used">¡Usaste <strong>{usedCard.icon} {usedCard.name}</strong>!</div>
          )}
          {opponentUsedCard && (
            <div className="ar-card-used opponent">{opponentName} usó una carta contra ti...</div>
          )}
          <button className="btn-primary" onClick={() => { setPhase('building'); setTimer(60); }}>
            Ir a Construir Portafolio →
          </button>
        </LeftPanel>
        <RightPanel className="ar-cards-right">
          <h3>🃏 Fase de Cartas — Mind Games</h3>
          {player.powerCards.length > 0 ? (
            <>
              <p className="ar-card-instr">Usa una carta de poder antes de invertir:</p>
              <div className="ar-cards-grid">
                {player.powerCards.map((card) => (
                  <PowerCardItem
                    key={card.id}
                    card={card}
                    onUse={handleUseCard}
                    disabled={!!usedCard}
                    used={usedCard?.id === card.id}
                  />
                ))}
              </div>
            </>
          ) : (
            <p className="ar-no-cards">No tienes cartas de poder. ¡Compra en la tienda!</p>
          )}
        </RightPanel>
      </GameLayout>
    );
  }

  // --- BUILDING PHASE --- horizontal: left=context+city, right=market
  if (phase === 'building') {
    const cityBuildings = arenaPortfolio.map((item) => ({
      id: item.asset.id,
      emoji: item.asset.buildingEmoji,
      label: item.asset.ticker,
      quantity: item.quantity,
    }));

    return (
      <GameLayout className="arena-bg">
        <LeftPanel className="ar-build-left">
          <TopBar
            title="⚔️ Arena"
            showBack backTo="hub"
            accent="#ff6b6b"
            rightContent={
              <div className={`ar-timer ${timer <= 10 ? 'urgent' : ''}`}>⏱️ {timer}s</div>
            }
          />
          {!fogActive && (
            <div className="ar-context-mini">
              <span className="ar-danger">⚠️ {event.dangeredSectors.join(', ')}</span>
              <span className="ar-benefit">✅ {event.benefitedSectors.join(', ')}</span>
            </div>
          )}
          {fogActive && (
            <div className="ar-fog">🌫️ ¡Niebla de Guerra!</div>
          )}
          <CityView buildings={cityBuildings} compact />
          <div className="ar-balance-block">
            <span className="ar-bal-label">Balance Arena</span>
            <span className="ar-bal-val">💰 CHF {arenaBalance.toLocaleString()}</span>
          </div>
          <button
            className="btn-primary ar-confirm-btn"
            onClick={() => resolveArena()}
            disabled={arenaPortfolio.length === 0}
          >
            ⚡ Confirmar y Batalla
          </button>
        </LeftPanel>
        <RightPanel className="ar-build-right">
          <div className="ar-market-header">
            <h3>🏗️ Construye tu Portafolio</h3>
          </div>
          <div className="ar-asset-grid">
            {ASSETS.map((asset) => {
              const qty = buyQuantities[asset.id] || 1;
              return (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  quantity={qty}
                  onBuy={handleBuy}
                  onQuantityChange={(id, q) => setBuyQuantities((p) => ({ ...p, [id]: q }))}
                  canAfford={qty * asset.price <= arenaBalance}
                  compact
                />
              );
            })}
          </div>
        </RightPanel>
      </GameLayout>
    );
  }

  // --- IMPACT PHASE --- fullscreen split
  if (phase === 'impact') {
    return (
      <GameLayout className="arena-bg" weather={event.weather}>
        <CenterPanel>
          <div className="ar-impact">
            <h2>🌊 {event.name} — ¡Impacto!</h2>
            <div className="ar-split">
              <div className="ar-split-side player">
                <h4>{player.avatar} {player.username}</h4>
                <div className="ar-split-grid">
                  {arenaPortfolio.map((item) => {
                    const impact = event.impacts.find((i) => i.assetId === item.asset.id);
                    const change = impact ? impact.percentChange : 0;
                    return (
                      <div key={item.asset.id} className={`ar-split-bldg ${change > 0 ? 'rising' : 'falling'}`}>
                        <span className="ar-sb-emoji">{item.asset.buildingEmoji}</span>
                        <span className={`ar-sb-change ${change >= 0 ? 'positive' : 'negative'}`}>
                          {change >= 0 ? '+' : ''}{change}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="ar-split-divider">⚔️</div>
              <div className="ar-split-side opponent">
                <h4>{opponentAvatar} {opponentName}</h4>
                <div className="ar-split-grid">
                  {opponentPortfolio.map((item) => {
                    const impact = event.impacts.find((i) => i.assetId === item.asset.id);
                    const change = impact ? impact.percentChange : 0;
                    return (
                      <div key={item.asset.id} className={`ar-split-bldg ${change > 0 ? 'rising' : 'falling'}`}>
                        <span className="ar-sb-emoji">{item.asset.buildingEmoji}</span>
                        <span className={`ar-sb-change ${change >= 0 ? 'positive' : 'negative'}`}>
                          {change >= 0 ? '+' : ''}{change}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </CenterPanel>
      </GameLayout>
    );
  }

  // --- RESULT ---
  return (
    <GameLayout className="arena-bg">
      <CenterPanel>
        <div className="ar-result">
          <div className={`ar-result-banner ${playerWon ? 'won' : 'lost'}`}>
            <h2>{playerWon ? '🏆 ¡Victoria!' : '😔 Derrota'}</h2>
            <p>{playerWon
              ? `Ganó ${player.username}. Tu portafolio superó al de ${opponentName}.`
              : `Ganó ${opponentName}. Su estrategia fue superior esta vez.`}
            </p>
          </div>

          <div className="ar-comparison">
            <div className="ar-comp-card">
              <span className="ar-comp-avatar">{player.avatar}</span>
              <span className="ar-comp-name">{player.username}</span>
              <span className={`ar-comp-change ${playerResult.change >= 0 ? 'positive' : 'negative'}`}>
                {playerResult.change >= 0 ? '+' : ''}{playerResult.change.toFixed(1)}%
              </span>
            </div>
            <span className="ar-comp-vs">VS</span>
            <div className="ar-comp-card">
              <span className="ar-comp-avatar">{opponentAvatar}</span>
              <span className="ar-comp-name">{opponentName}</span>
              <span className={`ar-comp-change ${opponentResult.change >= 0 ? 'positive' : 'negative'}`}>
                {opponentResult.change >= 0 ? '+' : ''}{opponentResult.change.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="ar-feedback">
            <p><strong>Análisis:</strong>{' '}
              {playerWon
                ? `Tu decisión de diversificar te protegió durante "${event.name}".`
                : `${opponentName} invirtió mejor en sectores beneficiados por "${event.name}".`}
            </p>
          </div>

          <button className="btn-primary" onClick={handleBackToHub}>🏠 Volver al Hub</button>
        </div>
      </CenterPanel>
    </GameLayout>
  );
}
