import { useState, useEffect } from 'react';
import { HISTORICAL_EVENTS } from '../../data/events';
import type { HistoricalEvent } from '../../types';

interface RoulettePhaseProps {
  onEventSelected: (event: HistoricalEvent) => void;
}

export default function RoulettePhase({ onEventSelected }: RoulettePhaseProps) {
  const [rouletteIdx, setRouletteIdx] = useState(0);
  const [spinning, setSpinning] = useState(true);
  const [selected, setSelected] = useState<HistoricalEvent | null>(null);

  useEffect(() => {
    if (!spinning) return;
    const interval = setInterval(() => {
      setRouletteIdx((prev) => (prev + 1) % HISTORICAL_EVENTS.length);
    }, 150);

    const stopTimeout = setTimeout(() => {
      setSpinning(false);
      clearInterval(interval);
      const chosen = HISTORICAL_EVENTS[Math.floor(Math.random() * HISTORICAL_EVENTS.length)];
      setSelected(chosen);
    }, 3000);

    return () => { clearInterval(interval); clearTimeout(stopTimeout); };
  }, [spinning]);

  const displayEvent = spinning ? HISTORICAL_EVENTS[rouletteIdx] : selected;

  return (
    <div className="sv-roulette">
      <h2>🎰 La Ruleta del Tiempo</h2>
      <p className="sv-subtitle">¿Qué momento de la historia te tocará?</p>
      <div className="sv-roulette-display">
        <div className={`sv-roulette-card ${spinning ? 'spinning' : 'selected'}`}>
          <span className="sv-roulette-date">{displayEvent?.date}</span>
          <span className="sv-roulette-name">{displayEvent?.name}</span>
        </div>
      </div>
      {!spinning && selected && (
        <div className="sv-roulette-reveal">
          <p className="sv-wave-warning">
            🌊 La Ola se acerca: <strong>{selected.name}</strong>
          </p>
          <button className="btn-primary" onClick={() => onEventSelected(selected)}>
            Ver Contexto 💡
          </button>
        </div>
      )}
    </div>
  );
}
