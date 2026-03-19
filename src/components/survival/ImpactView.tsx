const WEATHER_MAP: Record<string, string> = {
  storm: '⛈️🌧️💨',
  rain: '🌧️☁️💧',
  cloudy: '☁️🌥️',
  sunny: '☀️🌤️🌈',
  thunder: '⚡🌩️💥',
};

interface ImpactResult {
  assetId: string;
  name: string;
  change: number;
  emoji: string;
}

interface ImpactViewProps {
  eventName: string;
  weather: string;
  results: ImpactResult[];
}

export default function ImpactView({ eventName, weather, results }: ImpactViewProps) {
  return (
    <div className="sv-impact">
      <h2>{WEATHER_MAP[weather]} ¡El Impacto!</h2>
      <h3>{eventName}</h3>
      <div className="sv-impact-grid">
        {results.map((r) => (
          <div
            key={r.assetId}
            className={`sv-impact-bldg ${r.change > 0 ? 'rising' : r.change < 0 ? 'falling' : ''}`}
          >
            <span className="sv-ib-emoji">{r.emoji}</span>
            <span className="sv-ib-name">{r.name}</span>
            <span className={`sv-ib-change ${r.change >= 0 ? 'positive' : 'negative'}`}>
              {r.change >= 0 ? '+' : ''}{r.change}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
