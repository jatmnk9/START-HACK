import { useGame } from '../../context/GameContext';
import type { GameScreen } from '../../types';
import './TopBar.css';

interface TopBarProps {
  title: string;
  showBack?: boolean;
  backTo?: GameScreen;
  rightContent?: React.ReactNode;
  accent?: string;
}

export default function TopBar({ title, showBack = true, backTo = 'hub', rightContent, accent }: TopBarProps) {
  const { state, dispatch } = useGame();
  const player = state.player;

  return (
    <div className="topbar" style={accent ? { borderBottomColor: accent } : undefined}>
      <div className="topbar-left">
        {showBack && (
          <button className="back-btn" onClick={() => dispatch({ type: 'SET_SCREEN', screen: backTo })}>
            ←
          </button>
        )}
        <span className="topbar-title">{title}</span>
      </div>
      {player && (
        <div className="topbar-stats">
          <span className="tb-stat">
            <span className="tb-avatar">{player.avatar}</span>
            <span className="tb-name">{player.username}</span>
          </span>
          <span className="tb-stat gold">💰 {player.balance.toLocaleString()}</span>
          <span className="tb-stat xp">✨ {player.xp} XP</span>
          <span className="tb-stat level">Lv.{player.level}</span>
        </div>
      )}
      {rightContent && <div className="topbar-right">{rightContent}</div>}
    </div>
  );
}
