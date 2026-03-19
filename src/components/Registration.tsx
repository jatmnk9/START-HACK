import { useState } from 'react';
import { useGame } from '../context/GameContext';
import GameLayout, { CenterPanel } from './ui/GameLayout';
import './Registration.css';

const AVATARS = ['🧑‍💼', '👩‍💼', '🧑‍🚀', '👩‍🔬', '🧙‍♂️', '🦊', '🐺', '🦁', '🐲', '🦅', '🎭', '💎'];

export default function Registration() {
  const { dispatch } = useGame();
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [phase, setPhase] = useState<'form' | 'chest' | 'welcome'>('form');
  const [chestOpen, setChestOpen] = useState(false);

  const handleStart = () => {
    if (!username.trim() || !selectedAvatar) return;
    setPhase('chest');
    setTimeout(() => setChestOpen(true), 1500);
    setTimeout(() => setPhase('welcome'), 4000);
  };

  const handleContinue = () => {
    dispatch({ type: 'CREATE_PLAYER', username: username.trim(), avatar: selectedAvatar });
  };

  if (phase === 'chest') {
    return (
      <GameLayout className="reg-bg">
        <CenterPanel>
          <div className={`chest-container ${chestOpen ? 'open' : 'falling'}`}>
            <div className="chest-emoji">{chestOpen ? '✨' : '📦'}</div>
            {chestOpen && (
              <div className="chest-reveal">
                <div className="coins-burst">💰</div>
                <div className="chest-amount">10,000 CHF</div>
              </div>
            )}
          </div>
        </CenterPanel>
      </GameLayout>
    );
  }

  if (phase === 'welcome') {
    return (
      <GameLayout className="reg-bg">
        <CenterPanel>
          <div className="welcome-card">
            <div className="welcome-avatar">{selectedAvatar}</div>
            <h1>¡Bienvenido, {username}!</h1>
            <p className="welcome-message">
              Estás a punto de comenzar tu aventura para convertirte en un{' '}
              <strong>Maestro Inversor</strong>. Aquí tienes tus primeros{' '}
              <span className="highlight">10,000 CHF</span>. Protégelos y hazlos crecer.
            </p>
            <div className="initial-balance">
              <span className="balance-icon">🏦</span>
              <span className="balance-amount">CHF 10,000</span>
            </div>
            <button className="btn-primary" onClick={handleContinue}>
              Comenzar Aventura →
            </button>
          </div>
        </CenterPanel>
      </GameLayout>
    );
  }

  return (
    <GameLayout className="reg-bg">
      <CenterPanel>
        <div className="reg-container">
          <div className="reg-header">
            <h1 className="game-title">
              <span className="title-icon">📊</span> InvestQuest
            </h1>
            <p className="subtitle">Aprende a invertir sobreviviendo la historia</p>
          </div>

          <div className="reg-form">
            <div className="reg-form-row">
              <div className="form-group">
                <label>Tu Nombre de Inversor</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ej: Jat"
                  maxLength={20}
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label>Elige tu Avatar</label>
                <div className="avatar-grid">
                  {AVATARS.map((av) => (
                    <button
                      key={av}
                      className={`avatar-btn ${selectedAvatar === av ? 'selected' : ''}`}
                      onClick={() => setSelectedAvatar(av)}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={handleStart}
              disabled={!username.trim() || !selectedAvatar}
            >
              Abrir mi Cofre Inicial 📦
            </button>
          </div>
        </div>
      </CenterPanel>
    </GameLayout>
  );
}
