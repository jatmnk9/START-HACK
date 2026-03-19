import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { ONBOARDING_MODULES } from '../data/onboarding';
import GameLayout, { LeftPanel, RightPanel } from './ui/GameLayout';
import './Onboarding.css';

export default function Onboarding() {
  const { dispatch } = useGame();
  const [currentModule, setCurrentModule] = useState(0);
  const [phase, setPhase] = useState<'theory' | 'quiz' | 'feedback'>('theory');
  const [, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [shake, setShake] = useState(false);

  const mod = ONBOARDING_MODULES[currentModule];

  const handleAnswer = (idx: number) => {
    setSelectedAnswer(idx);
    const correct = idx === mod.correctAnswer;
    setIsCorrect(correct);
    if (!correct) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
    setPhase('feedback');
  };

  const handleNext = () => {
    if (!isCorrect) {
      setPhase('quiz');
      setSelectedAnswer(null);
      return;
    }
    if (currentModule < ONBOARDING_MODULES.length - 1) {
      setCurrentModule((prev) => prev + 1);
      setPhase('theory');
      setSelectedAnswer(null);
    } else {
      dispatch({ type: 'COMPLETE_ONBOARDING' });
    }
  };

  return (
    <GameLayout className="onboarding-bg">
      {/* Left: Progress sidebar */}
      <LeftPanel width="240px" className="onboarding-sidebar">
        <div className="ob-sidebar-title">📚 Formación</div>
        <div className="ob-progress-list">
          {ONBOARDING_MODULES.map((m, idx) => (
            <div
              key={m.id}
              className={`ob-step ${idx < currentModule ? 'done' : ''} ${idx === currentModule ? 'active' : ''}`}
            >
              <span className="ob-step-icon">{idx < currentModule ? '✅' : m.icon}</span>
              <div className="ob-step-info">
                <span className="ob-step-num">Módulo {m.id}</span>
                <span className="ob-step-title">{m.title}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="ob-progress-bar">
          <div className="ob-progress-fill" style={{ width: `${(currentModule / ONBOARDING_MODULES.length) * 100}%` }} />
        </div>
        <span className="ob-progress-text">{currentModule}/{ONBOARDING_MODULES.length} completados</span>
      </LeftPanel>

      {/* Right: Content */}
      <RightPanel className="onboarding-content">
        <div className={`ob-card ${shake ? 'shake' : ''}`}>
          <div className="ob-card-header">
            <span className="ob-mod-icon">{mod.icon}</span>
            <h2>Módulo {mod.id}: {mod.title}</h2>
          </div>

          {phase === 'theory' && (
            <div className="ob-theory">
              <div className="ob-theory-text" dangerouslySetInnerHTML={{ __html: mod.theory }} />
              <button className="btn-primary" onClick={() => setPhase('quiz')}>
                ¡Entendido! Ir al Quiz →
              </button>
            </div>
          )}

          {phase === 'quiz' && (
            <div className="ob-quiz">
              <h3 className="ob-question">{mod.question}</h3>
              <div className="ob-options">
                {mod.options.map((opt, idx) => (
                  <button key={idx} className="ob-option" onClick={() => handleAnswer(idx)}>
                    <span className="ob-letter">{String.fromCharCode(65 + idx)}</span>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {phase === 'feedback' && (
            <div className={`ob-feedback ${isCorrect ? 'correct' : 'wrong'}`}>
              <div className="ob-feedback-icon">{isCorrect ? '🎉' : '😅'}</div>
              <h3>{isCorrect ? '¡Correcto!' : '¡Casi!'}</h3>
              <p>{isCorrect ? mod.explanation : mod.wrongExplanation}</p>
              <button className="btn-primary" onClick={handleNext}>
                {isCorrect
                  ? currentModule < ONBOARDING_MODULES.length - 1
                    ? 'Siguiente Módulo →'
                    : '¡Empezar a Invertir! 🚀'
                  : 'Intentar de Nuevo ↩'}
              </button>
            </div>
          )}
        </div>
      </RightPanel>
    </GameLayout>
  );
}
