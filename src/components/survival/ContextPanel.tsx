import type { HistoricalEvent } from '../../types';

const WEATHER_MAP: Record<string, string> = {
  storm: '⛈️🌧️💨',
  rain: '🌧️☁️💧',
  cloudy: '☁️🌥️',
  sunny: '☀️🌤️🌈',
  thunder: '⚡🌩️💥',
};

interface ContextPanelProps {
  event: HistoricalEvent;
}

export default function ContextPanel({ event }: ContextPanelProps) {
  return (
    <div className="sv-context-panel">
      <div className="sv-ctx-header">
        <h3>💡 Contexto</h3>
        <span className="sv-ctx-date">{event.date}</span>
      </div>
      <h4 className="sv-ctx-title">{event.name}</h4>
      <p className="sv-ctx-desc">{event.context}</p>

      <div className="sv-ctx-sectors">
        <div className="sv-ctx-sector danger">
          <span className="sv-ctx-sector-label">⚠️ En Peligro</span>
          <div className="sv-ctx-tags">
            {event.dangeredSectors.map((s) => (
              <span key={s} className="sv-tag danger">{s}</span>
            ))}
          </div>
        </div>
        <div className="sv-ctx-sector benefit">
          <span className="sv-ctx-sector-label">✅ Beneficiados</span>
          <div className="sv-ctx-tags">
            {event.benefitedSectors.map((s) => (
              <span key={s} className="sv-tag benefit">{s}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="sv-metrics">
        <div className="sv-metric">
          <span className="sv-metric-label">USD/CHF</span>
          <span className={`sv-metric-val ${event.usdChfChange >= 0 ? 'up' : 'down'}`}>
            {event.usdChfChange >= 0 ? '+' : ''}{event.usdChfChange}%
          </span>
        </div>
        <div className="sv-metric">
          <span className="sv-metric-label">Tasa Interés</span>
          <span className={`sv-metric-val ${event.interestRateChange >= 0 ? 'up' : 'down'}`}>
            {event.interestRateChange >= 0 ? '+' : ''}{event.interestRateChange}%
          </span>
        </div>
        <div className="sv-metric">
          <span className="sv-metric-label">Pánico</span>
          <span className={`sv-metric-val ${event.panicLevel > 60 ? 'down' : 'up'}`}>
            {event.panicLevel}/100
          </span>
        </div>
        <div className="sv-metric">
          <span className="sv-metric-label">Clima</span>
          <span className="sv-metric-val">{WEATHER_MAP[event.weather]}</span>
        </div>
      </div>
    </div>
  );
}
