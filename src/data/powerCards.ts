import type { PowerCard } from '../types';

export const POWER_CARDS: PowerCard[] = [
  {
    id: 'fog_of_war',
    name: 'Niebla de Guerra',
    description: 'Bloquea el módulo de contexto de tu oponente. Tendrá que invertir a ciegas.',
    icon: '🌫️',
    cost: 50,
    type: 'offensive',
    effect: 'fog_of_war',
  },
  {
    id: 'time_machine',
    name: 'Máquina del Tiempo',
    description: 'Cambia el evento histórico por uno aleatorio diferente. Tu oponente tiene 30s para adaptarse.',
    icon: '⏳',
    cost: 80,
    type: 'offensive',
    effect: 'time_machine',
  },
  {
    id: 'shield',
    name: 'Escudo Suizo',
    description: 'Reduce tus pérdidas en un 50% durante esta ola.',
    icon: '🛡️',
    cost: 60,
    type: 'defensive',
    effect: 'shield',
  },
  {
    id: 'insider',
    name: 'Información Privilegiada',
    description: 'Revela un sector adicional que se beneficiará del evento.',
    icon: '🔍',
    cost: 40,
    type: 'defensive',
    effect: 'insider',
  },
  {
    id: 'double_down',
    name: 'Doble o Nada',
    description: 'Duplica tus ganancias... pero también tus pérdidas.',
    icon: '🎲',
    cost: 70,
    type: 'offensive',
    effect: 'double_down',
  },
];
