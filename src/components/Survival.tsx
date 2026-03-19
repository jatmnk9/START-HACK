import { useState, useEffect, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { HISTORICAL_EVENTS } from '../data/events';
import { ASSETS } from '../data/assets';
import type { Asset, HistoricalEvent } from '../types';
import GameLayout, { LeftPanel, RightPanel, CenterPanel } from './ui/GameLayout';
import TopBar from './ui/TopBar';
import AssetCard from './ui/AssetCard';
import CityView from './ui/CityView';
import NewsTicker from './ui/NewsTicker';
import ContextPanel from './survival/ContextPanel';
import RoulettePhase from './survival/RoulettePhase';
import ImpactView from './survival/ImpactView';
import ResultView from './survival/ResultView';
import './Survival.css';

export default function Survival() {
  const { state, dispatch } = useGame();
  const player = state.player!;

  const [phase, setPhase] = useState<'roulette' | 'context' | 'market' | 'countdown' | 'impact' | 'result'>('roulette');
  const [selectedEvent, setSelectedEvent] = useState<HistoricalEvent>(HISTORICAL_EVENTS[0]);
  const [countdown, setCountdown] = useState(5);
  const [impactResults, setImpactResults] = useState<{ assetId: string; name: string; change: number; emoji: string }[]>([]);
  const [totalChange, setTotalChange] = useState(0);
  const [survived, setSurvived] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [buyQuantities, setBuyQuantities] = useState<Record<string, number>>({});

  // Countdown timer
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown <= 0) { resolveImpact(); return; }
    const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, countdown]);

  const resolveImpact = useCallback(() => {
    setPhase('impact');
    const results = player.portfolio.map((item) => {
      const impact = selectedEvent.impacts.find((i) => i.assetId === item.asset.id);
      return { assetId: item.asset.id, name: item.asset.name, change: impact ? impact.percentChange : 0, emoji: item.asset.buildingEmoji };
    });
    setImpactResults(results);

    const valueBefore = player.portfolio.reduce((sum, item) => sum + item.asset.price * item.quantity, 0);
    let valueAfter = 0;
    player.portfolio.forEach((item) => {
      const impact = selectedEvent.impacts.find((i) => i.assetId === item.asset.id);
      const change = impact ? impact.percentChange : 0;
      valueAfter += item.asset.price * (1 + change / 100) * item.quantity;
    });

    const netChange = valueAfter - valueBefore;
    const pct = valueBefore > 0 ? (netChange / valueBefore) * 100 : 0;
    setTotalChange(pct);
    setSurvived(pct > -20);

    // Feedback
    const gains = results.filter((r) => r.change > 0).map((r) => r.name);
    const losses = results.filter((r) => r.change < 0).map((r) => r.name);
    let fb = '';
    if (pct > 5) { fb = `¡Excelente! Tu portafolio creció un ${pct.toFixed(1)}%.`; if (gains.length) fb += ` ${gains.join(', ')} brillaron.`; }
    else if (pct > -5) { fb = `Sobreviviste con un cambio de ${pct.toFixed(1)}%.`; }
    else { fb = `La ola te golpeó fuerte: ${pct.toFixed(1)}%.`; }
    if (losses.length && pct > -10) fb += ` Algo de pérdida en ${losses.join(', ')}, pero tus otras inversiones compensaron.`;
    if (!player.portfolio.some((p) => p.asset.id === 'gold') && selectedEvent.panicLevel > 60) fb += ' Tip: El Oro suele ser refugio seguro.';
    if (!player.portfolio.some((p) => p.asset.id === 'swiss_bond') && selectedEvent.panicLevel > 70) fb += ' Tip: Los Bonos Suizos protegen en tormentas.';
    setFeedbackMessage(fb);

    dispatch({ type: 'APPLY_WAVE_IMPACT', impacts: selectedEvent.impacts });
    setTimeout(() => setPhase('result'), 4000);
  }, [player.portfolio, selectedEvent, dispatch]);

  const handleBuy = (asset: Asset, qty: number) => {
    if (qty * asset.price > player.balance) return;
    dispatch({ type: 'BUY_ASSET', asset, quantity: qty });
  };

  const handleSell = (assetId: string) => {
    dispatch({ type: 'SELL_ASSET', assetId, quantity: 1 });
  };

  const updateQuantity = (assetId: string, qty: number) => {
    setBuyQuantities((prev) => ({ ...prev, [assetId]: Math.max(1, qty) }));
  };

  const portfolioValue = player.portfolio.reduce((sum, item) => sum + item.asset.price * item.quantity, 0);

  const handleBackToHub = () => dispatch({ type: 'SET_SCREEN', screen: 'hub' });
  const handlePlayAgain = () => {
    setPhase('roulette');
    setCountdown(5);
    setBuyQuantities({});
    dispatch({ type: 'RESET_PORTFOLIO' });
  };

  const handleEventSelected = (event: HistoricalEvent) => {
    setSelectedEvent(event);
    dispatch({ type: 'SET_EVENT', event });
    setPhase('context');
  };

  // Roulette: centered fullscreen
  if (phase === 'roulette') {
    return (
      <GameLayout className="survival-bg">
        <CenterPanel>
          <RoulettePhase onEventSelected={handleEventSelected} />
        </CenterPanel>
      </GameLayout>
    );
  }

  // Impact: centered animation
  if (phase === 'impact') {
    return (
      <GameLayout className="survival-bg" weather={selectedEvent.weather}>
        <NewsTicker headlines={selectedEvent.newsHeadlines} />
        <CenterPanel className="sv-impact-center">
          <ImpactView
            eventName={selectedEvent.name}
            weather={selectedEvent.weather}
            results={impactResults}
          />
        </CenterPanel>
      </GameLayout>
    );
  }

  // Result: centered
  if (phase === 'result') {
    return (
      <GameLayout className="survival-bg" weather={selectedEvent.weather}>
        <CenterPanel>
          <ResultView
            survived={survived}
            totalChange={totalChange}
            feedbackMessage={feedbackMessage}
            balance={player.balance}
            level={player.level}
            completedWaves={player.completedWaves}
            xp={player.xp}
            onPlayAgain={handlePlayAgain}
            onBackToHub={handleBackToHub}
          />
        </CenterPanel>
      </GameLayout>
    );
  }

  // Countdown: centered with portfolio summary
  if (phase === 'countdown') {
    return (
      <GameLayout className="survival-bg" weather={selectedEvent.weather}>
        <NewsTicker headlines={selectedEvent.newsHeadlines} />
        <CenterPanel className="sv-countdown-center">
          <h2>⏳ La Ola se Acerca...</h2>
          <div className="sv-countdown-num">{countdown}</div>
          <span className="sv-countdown-label">días para el impacto</span>
          <div className="sv-countdown-summary">
            <h4>Tu Portafolio Final:</h4>
            {player.portfolio.map((item) => (
              <div key={item.asset.id} className="sv-summary-item">
                <span>{item.asset.buildingEmoji} {item.asset.name}</span>
                <span>x{item.quantity} = CHF {(item.asset.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </CenterPanel>
      </GameLayout>
    );
  }

  // Context + Market: horizontal layout (left=context, right=market)
  const cityBuildings = player.portfolio.map((item) => ({
    id: item.asset.id,
    emoji: item.asset.buildingEmoji,
    label: item.asset.ticker,
    quantity: item.quantity,
    evolved: item.holdWaves >= 3,
  }));

  return (
    <GameLayout className="survival-bg" weather={selectedEvent.weather}>
      <NewsTicker headlines={selectedEvent.newsHeadlines} />

      {/* Left panel: context info */}
      <LeftPanel className="sv-left">
        <TopBar title="🌊 Supervivencia" showBack backTo="hub" />
        <ContextPanel event={selectedEvent} />
        <CityView buildings={cityBuildings} onSell={phase === 'market' ? handleSell : undefined} />
        <div className="sv-balance-block">
          <span className="sv-bal-label">Balance</span>
          <span className="sv-bal-val">💰 CHF {player.balance.toLocaleString()}</span>
          <span className="sv-port-val">📊 Portafolio: CHF {Math.round(portfolioValue).toLocaleString()}</span>
        </div>
      </LeftPanel>

      {/* Right panel: context reading or market */}
      <RightPanel className="sv-right">
        {phase === 'context' && (
          <div className="sv-context-action">
            <h2>📰 {selectedEvent.name}</h2>
            <p className="sv-event-full-desc">{selectedEvent.context}</p>
            <button className="btn-primary" onClick={() => setPhase('market')}>
              Ir al Mercado 🛒
            </button>
          </div>
        )}

        {phase === 'market' && (
          <div className="sv-market">
            <div className="sv-market-header">
              <h2>🏪 Mercado</h2>
              <span className="sv-market-bal">💰 CHF {player.balance.toLocaleString()}</span>
            </div>
            <div className="sv-asset-grid">
              {ASSETS.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  quantity={buyQuantities[asset.id] || 1}
                  onBuy={handleBuy}
                  onQuantityChange={updateQuantity}
                  canAfford={(buyQuantities[asset.id] || 1) * asset.price <= player.balance}
                />
              ))}
            </div>
            <div className="sv-market-actions">
              {player.portfolio.length > 0 && (
                <button className="btn-primary" onClick={() => { setPhase('countdown'); setCountdown(5); }}>
                  ⚡ Confirmar — Enfrentar la Ola
                </button>
              )}
              <button className="btn-secondary" onClick={() => setPhase('context')}>
                ← Volver al Contexto
              </button>
            </div>
          </div>
        )}
      </RightPanel>
    </GameLayout>
  );
}
