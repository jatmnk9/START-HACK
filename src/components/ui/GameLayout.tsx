import type { ReactNode, CSSProperties } from 'react';
import './GameLayout.css';

interface GameLayoutProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  weather?: string;
}

export default function GameLayout({ children, className = '', style, weather }: GameLayoutProps) {
  return (
    <div className={`game-layout ${className} ${weather ? `weather-${weather}` : ''}`} style={style}>
      {children}
    </div>
  );
}

interface PanelProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  width?: string;
}

export function LeftPanel({ children, className = '', style, width }: PanelProps) {
  const combinedStyle: CSSProperties = {
    ...(style || {}),
    ...(width ? { flex: `0 0 ${width}` } : {})
  };
  return (
    <div className={`panel left-panel ${className}`} style={combinedStyle}>
      {children}
    </div>
  );
}

export function RightPanel({ children, className = '', style }: PanelProps) {
  return (
    <div className={`panel right-panel ${className}`} style={style}>
      {children}
    </div>
  );
}

export function CenterPanel({ children, className = '', style }: PanelProps) {
  return (
    <div className={`panel center-panel ${className}`} style={style}>
      {children}
    </div>
  );
}
