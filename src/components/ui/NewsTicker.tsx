import './NewsTicker.css';

interface NewsTickerProps {
  headlines: string[];
}

export default function NewsTicker({ headlines }: NewsTickerProps) {
  return (
    <div className="news-ticker">
      <div className="ticker-content">
        {headlines.map((h, i) => (
          <span key={i} className="ticker-item">📰 {h}</span>
        ))}
        {headlines.map((h, i) => (
          <span key={`dup-${i}`} className="ticker-item">📰 {h}</span>
        ))}
      </div>
    </div>
  );
}
