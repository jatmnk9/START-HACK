interface ResultViewProps {
  survived: boolean;
  totalChange: number;
  feedbackMessage: string;
  balance: number;
  level: number;
  completedWaves: number;
  xp: number;
  onPlayAgain: () => void;
  onBackToHub: () => void;
}

export default function ResultView({
  survived, totalChange, feedbackMessage,
  balance, level, completedWaves, xp,
  onPlayAgain, onBackToHub
}: ResultViewProps) {
  return (
    <div className="sv-result">
      <div className={`sv-result-banner ${survived ? 'survived' : 'swept'}`}>
        <h2>{survived ? '🏆 ¡Ola Superada!' : '🌊 La Ola te Arrastró'}</h2>
        <span className={`sv-result-change ${totalChange >= 0 ? 'positive' : 'negative'}`}>
          {totalChange >= 0 ? '+' : ''}{totalChange.toFixed(1)}%
        </span>
      </div>

      <div className="sv-feedback">
        <h4>📋 Análisis</h4>
        <p>{feedbackMessage}</p>
      </div>

      <div className="sv-result-stats">
        <div className="sv-rs"><span className="sv-rs-label">Balance</span><span className="sv-rs-val">CHF {balance.toLocaleString()}</span></div>
        <div className="sv-rs"><span className="sv-rs-label">Nivel</span><span className="sv-rs-val">{level}</span></div>
        <div className="sv-rs"><span className="sv-rs-label">Olas</span><span className="sv-rs-val">{completedWaves}</span></div>
        <div className="sv-rs"><span className="sv-rs-label">XP</span><span className="sv-rs-val">{xp}</span></div>
      </div>

      <div className="sv-result-actions">
        <button className="btn-primary" onClick={onPlayAgain}>🌊 Siguiente Ola</button>
        <button className="btn-secondary" onClick={onBackToHub}>🏠 Volver al Hub</button>
      </div>
    </div>
  );
}
