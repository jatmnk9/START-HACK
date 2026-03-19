import type { ReactNode } from 'react';
import './GameLayout.css';

interface GameLayoutProps {
  children: ReactNode;
  className?: string;
  weather?: string;
}

export default function GameLayout({ children, className = '', weather }: GameLayoutProps) {
  return (
    <div className={`game-layout ${className} ${weather ? `weather-${weather}` : ''}`}>
      {children}
    </div>
  );
}

interface PanelProps {
  children: ReactNode;
  className?: string;
  width?: string;
}

export function LeftPanel({ children, className = '', width }: PanelProps) {
  return (
    <div className={`panel left-panel ${className}`} style={width ? { flex: `0 0 ${width}` } : undefined}>
      {children}
    </div>
  );
}

export function RightPanel({ children, className = '' }: PanelProps) {
  return (
    <div className={`panel right-panel ${className}`}>
      {children}
    </div>
  );
}

export function CenterPanel({ children, className = '' }: PanelProps) {
  return (
    <div className={`panel center-panel ${className}`}>
      {children}
    </div>
  );
}
