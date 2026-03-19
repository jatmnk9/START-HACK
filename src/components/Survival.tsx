import { useState, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { HISTORICAL_EVENTS } from '../data/events';
import { ASSETS } from '../data/assets';
import type { Asset, HistoricalEvent } from '../types';
import GameLayout, { LeftPanel, RightPanel, CenterPanel } from './ui/GameLayout';
import TopBar from './ui/TopBar';
import CityView from './ui/CityView';
import NewsTicker from './ui/NewsTicker';
import ContextPanel from './survival/ContextPanel';
import RoulettePhase from './survival/RoulettePhase';
import BattleBoard from './survival/BattleBoard';
import ResultView from './survival/ResultView';
import './Survival.css';

export default function Survival() {
  const { state, dispatch } = useGame();
  const player = state.player!;

  const [phase, setPhase] = useState<'roulette' | 'context' | 'market' | 'crypto_wildcard' | 'battle_board' | 'result'>('roulette');
  
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [investmentMode, setInvestmentMode] = useState<'ataque' | 'defensa' | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<HistoricalEvent>(HISTORICAL_EVENTS[0]);
  const [totalChange, setTotalChange] = useState(0);
  const [survived, setSurvived] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [buyQuantities, setBuyQuantities] = useState<Record<string, number>>({});

  // Battle completion handler (calculates financial results after tactical combat)
  const handleBattleComplete = useCallback(() => {
    const results = player.portfolio.map((item) => {
      const impact = selectedEvent.impacts.find((i) => i.assetId === item.asset.id);
      return { assetId: item.asset.id, name: item.asset.name, change: impact ? impact.percentChange : 0, emoji: item.asset.buildingEmoji };
    });

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
    setPhase('result');
  }, [player.portfolio, selectedEvent, dispatch]);

  const handleBuy = (asset: Asset, qty: number, groupId?: string) => {
    if (qty * asset.price > player.balance) return;
    dispatch({ type: 'BUY_ASSET', asset, quantity: qty, groupId });
  };

  const updateQuantity = (assetId: string, qty: number) => {
    setBuyQuantities((prev) => ({ ...prev, [assetId]: Math.max(0, qty) }));
  };

  const portfolioValue = player.portfolio.reduce((sum, item) => sum + item.asset.price * item.quantity, 0);

  const handleBackToHub = () => dispatch({ type: 'SET_SCREEN', screen: 'hub' });
  const handlePlayAgain = () => {
    setPhase('roulette');
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

  // Battle Board (replaces countdown and impact phases)
  if (phase === 'battle_board') {
    return (
      <div className="lol-fullscreen-bg">
        <BattleBoard portfolio={player.portfolio} event={selectedEvent} onComplete={handleBattleComplete} />
      </div>
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


  // LOL-Style Champion Select (Full Screen)
  if (phase === 'market' || phase === 'crypto_wildcard') {
    const renderChampSelect = () => {
      if (phase === 'market' && !investmentMode) {
        return (
          <div className="lol-mode-select">
            <h1 className="lol-title">ELIGE TU MODO DE INVERSIÓN</h1>
            <div className="lol-modes">
              <div className="lol-mode-card ataque" onClick={() => setInvestmentMode('ataque')}>
                <div className="lol-mode-icon">⚔️</div>
                <h2>Ataque</h2>
                <p>Acciones / Materias Primas</p>
                <span>Aumenta el daño</span>
              </div>
              <div className="lol-mode-card defensa" onClick={() => setInvestmentMode('defensa')}>
                <div className="lol-mode-icon">🛡️</div>
                <h2>Defensa</h2>
                <p>ETF / Bonos</p>
                <span>Maximiza duración</span>
              </div>
            </div>
            <button className="lol-back-context-btn" onClick={() => setPhase('context')}>← Volver al Contexto</button>
          </div>
        );
      }

      let availableAssets = ASSETS;
      if (phase === 'crypto_wildcard') {
        availableAssets = ASSETS.filter(a => a.type === 'crypto');
      } else {
        availableAssets = ASSETS.filter(a => {
          if (a.type === 'crypto') return false;
          if (investmentMode === 'ataque') return a.type === 'stock' || a.type === 'commodity';
          return a.type === 'stock'; 
        }).slice(0, investmentMode === 'defensa' ? 5 : 3);
      }

      return (
        <div className="lol-champ-select">
          <div className="lol-header">
            <div className="lol-header-left">
               {phase === 'market' && (
                 <button className="lol-back-btn" onClick={() => { setInvestmentMode(null); setSelectedAsset(null); }}>
                   ← Volver a Modos
                 </button>
               )}
            </div>
            <h2>{phase === 'crypto_wildcard' ? 'FASE COMODÍN: CRIPTO' : `DECLARA TU INVERSIÓN: ${investmentMode === 'ataque' ? 'ATAQUE' : 'DEFENSA'}`}</h2>
            <div className="lol-header-right">
               <div className="lol-timer">00</div>
            </div>
          </div>

          <div className="lol-main-area">
            {/* Left side: Assets Grid */}
            <div className="lol-grid-container">
              <div className="lol-grid">
                {availableAssets.map(asset => (
                  <div 
                    key={asset.id} 
                    className={`lol-champ-portrait ${selectedAsset?.id === asset.id ? 'selected' : ''}`}
                    onClick={() => setSelectedAsset(asset)}
                  >
                    <div className="lol-champ-img">{asset.icon}</div>
                    <div className="lol-champ-name">{asset.name}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side / Center: Selected Asset Detail */}
            {selectedAsset ? (
              <div className="lol-detail-container">
                 <div className="lol-detail-left">
                   <div className="lol-splash-icon">{selectedAsset.icon}</div>
                   <h1 className="lol-splash-name">{selectedAsset.name}</h1>
                   <p className="lol-splash-title">{selectedAsset.ticker} - {selectedAsset.sector}</p>
                 </div>
                 <div className="lol-detail-right">
                   <p className="lol-desc">{selectedAsset.description}</p>
                   <div className="lol-stats" style={{justifyContent: 'flex-start', marginBottom: '15px'}}>
                      <span>Precio: <strong style={{color:'#f9d423'}}>CHF {selectedAsset.price}</strong></span>
                      <span>Efecto: <strong style={{color: investmentMode==='ataque' ? '#ff4e50' : '#64b5f6'}}>{(investmentMode || 'CRIPTO').toUpperCase()}</strong></span>
                   </div>
                   
                   <div className="lol-actions" style={{borderTop: 'none', paddingTop: 0}}>
                     <div className="lol-buy-row horizontal">
                       <div className="lol-qty-controls">
                         <button className="lol-qty-btn" onClick={() => updateQuantity(selectedAsset.id, Math.max(1, (buyQuantities[selectedAsset.id] || 1) - 1))}>-</button>
                         <span className="lol-qty-val">{Math.max(1, buyQuantities[selectedAsset.id] || 1)}</span>
                         <button className="lol-qty-btn" onClick={() => updateQuantity(selectedAsset.id, Math.max(1, buyQuantities[selectedAsset.id] || 1) + 1)}>+</button>
                       </div>
                       
                       {investmentMode === 'defensa' && selectedAsset.type === 'stock' && (
                         <div style={{marginLeft: '15px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                           <input type="checkbox" id="group-etf" defaultChecked={true} style={{width: '20px', height: '20px'}} />
                           <label htmlFor="group-etf" style={{color: '#f9d423', fontSize: '0.9rem', cursor: 'pointer'}}>Agrupar en Fondo ETF</label>
                         </div>
                       )}

                       {(() => {
                         const isCrypto = selectedAsset.type === 'crypto';
                         const currentCrypto = player.portfolio.find(p => p.asset.type === 'crypto');
                         const hasCrypto = !!currentCrypto;
                         const isThisCrypto = hasCrypto && currentCrypto.asset.id === selectedAsset.id;
                         const isMaxQty = isCrypto && hasCrypto && !isThisCrypto;
                         
                         return (
                           <button 
                             className="lol-lock-btn"
                             style={{marginLeft: 'auto'}}
                             disabled={isMaxQty || Math.max(1, buyQuantities[selectedAsset.id] || 1) * selectedAsset.price > player.balance}
                             onClick={() => {
                               const checkbox = document.getElementById('group-etf') as HTMLInputElement;
                               const grpId = checkbox && checkbox.checked ? 'fondo_defensivo' : undefined;
                               handleBuy(selectedAsset, Math.max(1, buyQuantities[selectedAsset.id] || 1), grpId);
                               setBuyQuantities({});
                             }}
                           >
                             {isMaxQty ? 'MÁXIMO 1 CRIPTO' : `FIJAR INVERSIÓN (${Math.max(1, buyQuantities[selectedAsset.id] || 1) * selectedAsset.price})`}
                           </button>
                         )
                       })()}
                     </div>
                     <span className="lol-balance" style={{marginTop: '10px'}}>Fondos Disponibles: CHF {player.balance}</span>
                   </div>
                 </div>
              </div>
            ) : (
              <div className="lol-detail-container empty">
                <h3>SELECCIONA UNA INVERSIÓN</h3>
              </div>
            )}
          </div>

          <div className="lol-bottom-deck">
             <div className="lol-deck-title">TU EQUIPO:</div>
             <div className="lol-deck-slots">
                 {(() => {
                   const nonCryptoItems = player.portfolio.filter(p => p.asset.type !== 'crypto');
                   const groupedItems = nonCryptoItems.filter(p => p.groupId === 'fondo_defensivo');
                   const individualItems = nonCryptoItems.filter(p => p.groupId !== 'fondo_defensivo');

                   const slots = [];

                   individualItems.forEach(item => {
                      slots.push(
                        <div key={item.asset.id} className="lol-deck-slot filled">
                          <span className="deck-icon">{item.asset.icon}</span>
                          <span className="deck-qty">x{item.quantity}</span>
                        </div>
                      );
                   });

                   if (groupedItems.length > 0) {
                      slots.push(
                        <div key="etf-group" className="lol-deck-slot filled custom-fund" style={{width: 'auto', padding: '0 10px', flexDirection: 'column', justifyContent: 'center'}}>
                           <div style={{display: 'flex', gap: '5px', marginBottom: '2px'}}>
                             {groupedItems.map(item => (
                               <span key={item.asset.id} style={{fontSize: '1.2rem'}} title={`${item.asset.name} x${item.quantity}`}>{item.asset.icon}</span>
                             ))}
                           </div>
                           <span style={{fontSize: '0.65rem', fontWeight: 'bold', color: '#f9d423'}}>FONDO ETF</span>
                        </div>
                      );
                   }

                   const occupied = individualItems.length + (groupedItems.length > 0 ? 1 : 0);
                   for (let i = 0; i < Math.max(0, 5 - occupied); i++) {
                      slots.push(<div key={`empty-${i}`} className="lol-deck-slot empty"></div>);
                   }

                   return slots;
                 })()}
                 {/* Cryptos always render at the end separately */}
                 {player.portfolio.filter(p => p.asset.type === 'crypto').map(item => (
                   <div key={`crypto-${item.asset.id}`} className="lol-deck-slot filled crypto" style={{marginLeft: '20px', border: '1px solid #bc42f5'}}>
                     <span className="deck-icon">{item.asset.icon}</span>
                     <span className="deck-qty">x{item.quantity}</span>
                   </div>
                 ))}
             </div>
              <div className="lol-deck-actions">
               {phase === 'crypto_wildcard' ? (
                 <>
                   <button className="lol-back-btn" onClick={() => { setPhase('market'); setSelectedAsset(null); }}>← Volver</button>
                   <button className="lol-confirm-btn final" onClick={() => { setPhase('battle_board'); }}>¡ENFRENTAR LA OLA!</button>
                 </>
               ) : (
                 player.portfolio.length > 0 && (
                   <button className="lol-confirm-btn" onClick={() => { setPhase('crypto_wildcard'); setSelectedAsset(null); }}>CONTINUAR FASE</button>
                 )
               )}
              </div>
           </div>
        </div>
      );
    };

    return (
      <div className="lol-fullscreen-bg">
        {renderChampSelect()}
      </div>
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
        <CityView buildings={cityBuildings} onSell={undefined} />
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

      </RightPanel>
    </GameLayout>
  );
}
