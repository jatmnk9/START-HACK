import { useState, useEffect, useRef } from 'react';
import type { HistoricalEvent, PortfolioItem } from '../../types';
import './BattleBoard.css';

interface BattleBoardProps {
  portfolio: PortfolioItem[];
  event: HistoricalEvent;
  onComplete: () => void;
}

type TroopType = 'defender' | 'shooter' | 'fighter';

interface TroopDef {
  type: TroopType;
  name: string;
  icon: string;
  cost: number;
  hp: number;
  damage: number;
  range: number; // 0 for melee, 100 for global lane
  cooldown: number; // ms between attacks
}

const TROOP_DEFS: Record<TroopType, TroopDef> = {
  defender: { type: 'defender', name: 'Muro Fiduciario', icon: '🛡️', cost: 50, hp: 200, damage: 0, range: 0, cooldown: 1000 },
  fighter: { type: 'fighter', name: 'Corredor Agresivo', icon: '⚔️', cost: 100, hp: 80, damage: 25, range: 0, cooldown: 1000 },
  shooter: { type: 'shooter', name: 'Analista Sniper', icon: '🏹', cost: 150, hp: 50, damage: 15, range: 100, cooldown: 1500 },
};

export default function BattleBoard({ portfolio, event, onComplete }: BattleBoardProps) {
  const GAME_DURATION = 120; // 120 seconds

  // --- REFS FOR GAME LOOP ---
  const stateRef = useRef({
    phase: 'intro' as 'intro' | 'playing' | 'won' | 'lost',
    timeElapsed: 0,
    lives: 10,
    funds: 100, // starting funds
    generators: (() => {
      const gens: any[] = [];
      const grouped: Record<string, any> = {};
      
      portfolio.forEach(p => {
        if (p.groupId) {
          if (!grouped[p.groupId]) {
            grouped[p.groupId] = {
              id: p.groupId,
              name: 'Fondo Defensivo ETF',
              icon: p.asset.icon,
              type: 'etf', // Treated as ETF
              progress: 0,
            };
          } else {
            if (!grouped[p.groupId].icon.includes(p.asset.icon)) {
              grouped[p.groupId].icon += p.asset.icon;
            }
          }
        } else {
          gens.push({
            id: p.asset.id,
            name: p.asset.name,
            icon: p.asset.icon,
            type: p.asset.type,
            progress: 0,
          });
        }
      });
      return [...gens, ...Object.values(grouped)];
    })(),
    troops: [] as { id: string; type: TroopType; col: number; lane: number; hp: number; maxHp: number; lastAttack: number }[],
    enemies: [] as { id: string; lane: number; col: number; hp: number; maxHp: number; speed: number; lastMove: number; lastAttack: number; damage: number }[],
    nextEnemySpawnTime: 2000,
  });

  const [uiState, setUiState] = useState(stateRef.current);
  const [selectedShopTroop, setSelectedShopTroop] = useState<TroopType | null>(null);

  const ROWS = 5;
  const COLS = 9;

  // --- TICK LOOP ---
  useEffect(() => {
    let lastTime = performance.now();
    let animationFrameId: number;

    const tick = (currentTime: number) => {
      const dt = currentTime - lastTime;
      lastTime = currentTime;

      const s = stateRef.current;
      if (s.phase === 'playing') {

      s.timeElapsed += dt / 1000;

      // Check win condition
      if (s.timeElapsed >= GAME_DURATION && s.lives > 0) {
        s.phase = 'won';
        setUiState({ ...s });
        setTimeout(onComplete, 3000);
        return;
      }

      // Check lose condition
      if (s.lives <= 0) {
        s.phase = 'lost';
        setUiState({ ...s });
        setTimeout(onComplete, 3000);
        return;
      }

      // 1. Process Generators
      s.generators.forEach(gen => {
        let speed = 5; // default progress per sec
        if (gen.type === 'stock') speed = 15;
        if (gen.type === 'etf') speed = 10;
        if (gen.type === 'bond') speed = 4;
        if (gen.type === 'crypto') speed = Math.random() > 0.5 ? 25 : 0; // Erratic
        
        if (gen.progress < 100) {
          gen.progress += speed * (dt / 1000);
          if (gen.progress > 100) gen.progress = 100;
        }
      });

      // 2. Spawn Enemies
      // Difficulty increases over time
      const spawnRate = Math.max(2000, 5000 - (s.timeElapsed * 15)); 
      if (currentTime > s.nextEnemySpawnTime) {
         const hp = 30 + Math.floor(s.timeElapsed / 2);
         // Panic level scaling
         const panicMult = event.panicLevel / 50; 
         s.enemies.push({
           id: Math.random().toString(),
           lane: Math.floor(Math.random() * ROWS),
           col: COLS - 1, // Spawn at rightmost column
           hp: hp * panicMult,
           maxHp: hp * panicMult,
           speed: 1500 - (Math.random() * 500), // ms between hops
           lastMove: currentTime,
           damage: 5 + Math.floor(s.timeElapsed / 20),
           lastAttack: 0,
         });
         s.nextEnemySpawnTime = currentTime + spawnRate + (Math.random() * 1000);
      }

      // 3. Move Enemies & Battle
      s.enemies.forEach(enemy => {
         // Find if an allied troop is blocking
         // Enemy hit box: if enemy is adjacent to a troop (in front of them, col-1).
         // This way they stop next to the troop instead of overlapping it.
         const blockingTroop = s.troops.find(t => t.lane === enemy.lane && t.col === enemy.col - 1 && t.hp > 0);

         if (blockingTroop) {
           // Attack troop
           if (currentTime - enemy.lastAttack > 1000) {
              blockingTroop.hp -= enemy.damage;
              enemy.lastAttack = currentTime;
           }
         } else {
           // Move hop
           if (currentTime - enemy.lastMove > enemy.speed) {
             enemy.col -= 1;
             enemy.lastMove = currentTime;
             // Base hit
             if (enemy.col < 0) {
               s.lives -= 1;
               enemy.hp = 0; // kill enemy
             }
           }
         }
      });

      // 4. Troops Attack
      s.troops.forEach(troop => {
         const def = TROOP_DEFS[troop.type];
         if (def.damage === 0) return; // Wall doesn't attack
         if (currentTime - troop.lastAttack > def.cooldown) {
            // Find target
            let target = null;
            if (def.range === 0) {
               // Melee: target must be adjacent (in col + 1)
               target = s.enemies.find(e => e.lane === troop.lane && e.col === troop.col + 1 && e.hp > 0);
            } else {
               // Shooter: find first enemy in lane ahead of troop
               const enemiesInLane = s.enemies.filter(e => e.lane === troop.lane && e.col >= troop.col && e.hp > 0);
               if (enemiesInLane.length > 0) {
                 target = enemiesInLane.reduce((prev, curr) => (prev.col < curr.col ? prev : curr)); // Front-most
               }
            }

            if (target) {
               target.hp -= def.damage;
               troop.lastAttack = currentTime;
            }
         }
      });

      // Cleanup dead entities
      s.enemies = s.enemies.filter(e => e.hp > 0);
      s.troops = s.troops.filter(t => t.hp > 0);

      // Force UI update
      setUiState({ ...s });
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [event.panicLevel, onComplete]);

  // --- ACTIONS ---
  const handleCollect = (genId: string) => {
    const s = stateRef.current;
    const gen = s.generators.find(g => g.id === genId);
    if (!gen) return;

    if (gen.type === 'bond') {
      // Penalty rule for bonds: Full if 100%, tiny if early
      if (gen.progress >= 100) {
        s.funds += 200;
        gen.progress = 0;
      } else {
        s.funds += 10; // Penalty
        gen.progress = 0;
      }
    } else {
      // Normal: proportional or require 100%
      if (gen.progress >= 100) {
        s.funds += (gen.type === 'crypto' ? 100 : 50);
        gen.progress = 0;
      }
    }
    setUiState({ ...s });
  };

  const handleCellClick = (lane: number, col: number) => {
    if (!selectedShopTroop) return;
    const def = TROOP_DEFS[selectedShopTroop];
    
    const s = stateRef.current;
    if (s.funds < def.cost) return; // Not enough funds

    // Check if occupied
    if (s.troops.some(t => t.lane === lane && t.col === col)) return;

    s.funds -= def.cost;
    s.troops.push({
      id: Math.random().toString(),
      type: selectedShopTroop,
      col,
      lane,
      hp: def.hp,
      maxHp: def.hp,
      lastAttack: 0,
    });

    setUiState({ ...s });
    setSelectedShopTroop(null); // Deselect after place
  };

  // --- RENDERING ---
  const s = uiState;

  if (s.phase === 'intro') {
    return (
      <div className="bb-fullscreen">
        <div className="bb-modal">
           <h2>📉 ¡DEFIENDE TU PORTAFOLIO!</h2>
           <p>Tus inversiones a la izquierda generarán <strong>Fondos</strong> con el tiempo.</p>
           <p>Haz clic en "Recolectar" cuando estén listas (¡cuidado con retirar bonos antes de tiempo!).</p>
           <p>Usa los fondos para comprar defensas en la barra inferior y ponlas en el tablero.</p>
           <p>Sobrevive 2 minutos (Meses). Tienes 10 Vidas.</p>
           <button className="bb-btn" onClick={() => { stateRef.current.phase = 'playing'; setUiState({...stateRef.current}); }}>
             INICIAR DEFENSA
           </button>
        </div>
      </div>
    );
  }

  const renderGrid = () => {
    const cells = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
         cells.push(
           <div key={`${r}-${c}`} className="bb-cell" onClick={() => handleCellClick(r, c)}>
              {/* Render troop if exists here */}
              {s.troops.map(t => {
                if (t.lane === r && t.col === c) {
                  const def = TROOP_DEFS[t.type];
                  return (
                    <div key={t.id} className="bb-placed-troop">
                      <span className="bb-troop-emoji">{def.icon}</span>
                      <div className="bb-hp-bar"><div className="bb-hp-fill" style={{width: `${(t.hp/t.maxHp)*100}%`}}></div></div>
                    </div>
                  );
                }
                return null;
              })}
           </div>
         );
      }
    }

    const enemyElements = s.enemies.map(e => (
      <div 
        key={e.id} 
        className="bb-enemy" 
        style={{ top: `${(e.lane / ROWS) * 100}%`, left: `${(e.col / COLS) * 100}%`, width: `${100/COLS}%`, height: `${100/ROWS}%`}}
      >
        <span className="bb-enemy-emoji">👹</span>
        <div className="bb-hp-bar"><div className="bb-hp-fill enemy" style={{width: `${(e.hp/e.maxHp)*100}%`}}></div></div>
      </div>
    ));

    return (
      <div className="bb-grid">
         {cells}
         {enemyElements}
      </div>
    );
  };

  const remainingSeconds = Math.max(0, GAME_DURATION - Math.floor(s.timeElapsed));
  const formatTime = (secs: number) => `${Math.floor(secs/60)}:${(secs%60).toString().padStart(2, '0')}`;
  const progressPct = Math.min(100, (s.timeElapsed / GAME_DURATION) * 100);

  return (
    <div className={`bb-fullscreen ${s.phase === 'playing' ? 'playing' : ''}`}>
       <div className="bb-topbar">
         <div className="bb-top-stats">
           <span className="bb-lives">❤️ {s.lives} Vidas</span>
           <span className="bb-funds">💰 {s.funds} CHF</span>
         </div>
         <div className="bb-timer-container">
           <div className="bb-timer-bar-bg">
             <div className="bb-timer-bar-fill" style={{ width: `${progressPct}%` }}></div>
           </div>
           <div className="bb-timer">⏳ {formatTime(remainingSeconds)}</div>
         </div>
       </div>

       <div className="bb-main-layout">
          <div className="bb-sidebar">
             <h3>Mis Inversiones</h3>
             <div className="bb-generators">
               {s.generators.map(gen => (
                 <div key={gen.id} className="bb-gen-card">
                   <div className="bb-gen-icon">{gen.icon}</div>
                   <div className="bb-gen-info">
                     <span className="bb-gen-name">{gen.name}</span>
                     <div className="bb-progress-bar">
                        <div className="bb-progress-fill" style={{width: `${gen.progress}%`, background: gen.progress >= 100 ? '#f9d423' : '#64b5f6'}}></div>
                     </div>
                   </div>
                   <button 
                     className={`bb-collect-btn ${gen.progress >= 100 ? 'ready' : (gen.type==='bond'?'warning':'')}`}
                     onClick={() => handleCollect(gen.id)}
                     disabled={gen.progress < 100 && gen.type !== 'bond'}
                   >
                     {gen.type === 'bond' && gen.progress < 100 ? 'Penalizado' : (gen.progress >= 100 ? 'Recolectar' : 'Cargando')}
                   </button>
                 </div>
               ))}
             </div>
          </div>

          <div className="bb-board-area">
             <div className="bb-base-zone">
               <div className="bb-base-avatar">YO</div>
             </div>
             {renderGrid()}
          </div>
       </div>

       <div className="bb-bottombar">
          <span className="bb-shop-title">📦 COMPRAR DEFENSAS:</span>
          <div className="bb-shop">
             {(Object.keys(TROOP_DEFS) as TroopType[]).map(key => {
               const def = TROOP_DEFS[key];
               const canAfford = s.funds >= def.cost;
               return (
                 <div 
                   key={key} 
                   className={`bb-shop-item ${selectedShopTroop === key ? 'selected' : ''} ${!canAfford ? 'disabled' : ''}`}
                   onClick={() => canAfford && setSelectedShopTroop(key)}
                 >
                    <span className="bb-shop-icon">{def.icon}</span>
                    <div className="bb-shop-details">
                      <span className="bb-shop-name">{def.name}</span>
                      <span className="bb-shop-cost">💰 {def.cost}</span>
                    </div>
                 </div>
               );
             })}
          </div>
          {selectedShopTroop && <div className="bb-shop-helper">Modo Colocación: Haz clic en el tablero para situar {TROOP_DEFS[selectedShopTroop].name}.</div>}
       </div>

       {(s.phase === 'won' || s.phase === 'lost') && (
         <div className="bb-overlay">
           <div className="bb-modal">
             <h2>{s.phase === 'won' ? '🏆 Sobreviviste a la Ola' : '💀 Tus fondos fueron arrasados'}</h2>
             <p>Cargando resultados...</p>
           </div>
         </div>
       )}
    </div>
  );
}
