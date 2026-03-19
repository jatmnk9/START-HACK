import { useGame } from '../context/GameContext';
import { POWER_CARDS } from '../data/powerCards';
import GameLayout, { LeftPanel, RightPanel } from './ui/GameLayout';
import TopBar from './ui/TopBar';
import PowerCardItem from './ui/PowerCardItem';
import './Shop.css';

export default function Shop() {
  const { state, dispatch } = useGame();
  const player = state.player!;

  const handleBuyCard = (cardId: string) => {
    const card = POWER_CARDS.find((c) => c.id === cardId);
    if (!card) return;
    if (player.xp < card.cost) return;
    dispatch({ type: 'ADD_XP', amount: -card.cost });
    dispatch({ type: 'ADD_POWER_CARD', card });
  };

  return (
    <GameLayout className="shop-bg">
      <LeftPanel className="sh-left" width="300px">
        <TopBar title="🛒 Tienda" showBack backTo="hub" accent="#f9d423" />
        <div className="sh-xp-block">
          <span className="sh-xp-label">XP Disponible</span>
          <span className="sh-xp-val">✨ {player.xp}</span>
        </div>
        <div className="sh-deck">
          <h3>🃏 Tu Mazo ({player.powerCards.length})</h3>
          {player.powerCards.length === 0 ? (
            <p className="sh-empty">Tu mazo está vacío</p>
          ) : (
            <div className="sh-deck-list">
              {player.powerCards.map((card) => (
                <PowerCardItem key={card.id} card={card} mini />
              ))}
            </div>
          )}
        </div>
      </LeftPanel>
      <RightPanel className="sh-right">
        <h2 className="sh-title">Cartas de Poder</h2>
        <div className="sh-grid">
          {POWER_CARDS.map((card) => {
            const owned = player.powerCards.some((c) => c.id === card.id);
            return (
              <PowerCardItem
                key={card.id}
                card={card}
                onBuy={handleBuyCard}
                owned={owned}
                canAfford={player.xp >= card.cost}
              />
            );
          })}
        </div>
      </RightPanel>
    </GameLayout>
  );
}
