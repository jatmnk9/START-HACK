import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { ONBOARDING_MODULES } from '../data/onboarding';
import GameLayout, { LeftPanel } from './ui/GameLayout';
import './Onboarding.css';

export default function Onboarding() {
  const { state, dispatch } = useGame();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const completedLevels = state.player?.completedWaves || 0;

  useEffect(() => {
    if (!state.player) {
      dispatch({
        type: 'CREATE_PLAYER',
        username: 'Camila',
        avatar: '👩‍💻'
      });
    }
  }, [state.player, dispatch]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY, currentTarget } = e;
    const { width, height } = currentTarget.getBoundingClientRect();
    const x = (clientX - width / 2) / 60;
    const y = (clientY - height / 2) / 60;
    setMousePos({ x, y });
  };

  const handleLevelClick = (levelIndex: number) => {
    if (levelIndex <= completedLevels + 1) {
      if (levelIndex >= 4) {
        dispatch({ type: 'SET_SCREEN', screen: 'arena' });
      } else {
        dispatch({ type: 'SET_SCREEN', screen: 'survival' });
      }
    }
  };

  return (
    <GameLayout 
      className="onboarding-bg" 
      style={{ backgroundPosition: `${50 + mousePos.x}% ${50 + mousePos.y}%` }}
    >
      <div className="mouse-tracker" onMouseMove={handleMouseMove} />

      <div className="map-container" style={{ transform: `translate(${mousePos.x * 2}px, ${mousePos.y * 2}px)` }}>
        {[1, 2, 3, 4].map((level) => {
          const isUnlocked = level <= completedLevels + 1;
          const isCompleted = level <= completedLevels;
          return (
            <button
              key={level}
              className={`map-marker marker-${level} ${!isUnlocked ? 'locked' : ''} ${isCompleted ? 'completed' : ''}`}
              onClick={() => isUnlocked && handleLevelClick(level - 1)}
            >
              <img src="/src/assets/player.png" alt={`Level ${level}`} />
              {!isUnlocked && <div className="lock-overlay">🔒</div>}
              <div className="marker-tooltip">
                <span className="tooltip-title">{ONBOARDING_MODULES[level - 1]?.title}</span>
                <span className="tooltip-status">
                  {isCompleted ? 'Completado' : isUnlocked ? 'Disponible' : 'Bloqueado'}
                </span>
              </div>
            </button>
          );
        })}

        {completedLevels >= 4 && (
          <button 
            className="map-marker marker-arena"
            onClick={() => handleLevelClick(4)}
          >
            <div className="arena-pulse">🏰</div>
            <div className="marker-tooltip">
              <span className="tooltip-title">Battle Royale</span>
              <span className="tooltip-status">¡Nivel Final!</span>
            </div>
          </button>
        )}
      </div>

      <button 
        className={`ob-sidebar-toggle ${isSidebarOpen ? 'open' : ''}`}
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <span></span><span></span><span></span>
      </button>

      <LeftPanel className={`onboarding-sidebar ${isSidebarOpen ? 'show' : ''}`}>
        <div className="ob-sidebar-title">🏘️ Vida Rural</div>
        <div className="ob-progress-list">
          {ONBOARDING_MODULES.map((m, idx) => (
            <div 
              key={m.id} 
              className={`ob-step ${idx <= completedLevels ? 'active' : 'locked'}`}
              onClick={() => handleLevelClick(idx)}
              style={{ cursor: idx <= completedLevels + 1 ? 'pointer' : 'not-allowed' }}
            >
              <span className="ob-step-icon">
                {idx < completedLevels ? '✅' : idx === completedLevels ? '🧑‍🌾' : '🔒'}
              </span>
              <div className="ob-step-info">
                <span className="ob-step-num">Cosecha {m.id}</span>
                <span className="ob-step-title">{m.title}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="ob-progress-bar">
          <div 
            className="ob-progress-fill" 
            style={{ width: `${(completedLevels / 4) * 100}%` }}
          />
        </div>
        <div className="ob-progress-text">
          {completedLevels} de 4 niveles completados
        </div>
      </LeftPanel>
    </GameLayout>
  );
}
