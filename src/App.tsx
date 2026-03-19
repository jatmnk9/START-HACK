import { GameProvider, useGame } from './context/GameContext';
import Registration from './components/Registration';
import Onboarding from './components/Onboarding';
import Hub from './components/Hub';
import Survival from './components/Survival';
import Arena from './components/Arena';
import Shop from './components/Shop';
import './App.css';

function GameRouter() {
  const { state } = useGame();

  switch (state.currentScreen) {
    case 'registration':
      return <Registration />;
    case 'onboarding':
      return <Onboarding />;
    case 'hub':
      return <Hub />;
    case 'survival':
      return <Survival />;
    case 'arena':
      return <Arena />;
    case 'shop':
      return <Shop />;
    default:
      return <Hub />;
  }
}

function App() {
  return (
    <GameProvider>
      <GameRouter />
    </GameProvider>
  );
}

export default App;
