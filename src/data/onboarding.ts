import type { OnboardingModule } from '../types';

export const ONBOARDING_MODULES: OnboardingModule[] = [
  {
    id: 1,
    title: 'Acciones',
    icon: '📈',
    theory:
      'Una <strong>acción</strong> es una parte de una empresa. Si compras acciones de Nestlé, eres dueño de un pedacito de la fábrica de chocolate más grande del mundo. Si a Nestlé le va bien, tu acción sube de valor. Si le va mal, baja.',
    question: 'Si compras acciones, ¿eres dueño de una parte de la empresa?',
    options: ['Sí, soy copropietario', 'No, solo le presto dinero'],
    correctAnswer: 0,
    explanation: '¡Correcto! Al comprar acciones eres literalmente copropietario de la empresa. Si Nestlé vale 300 mil millones y tú tienes 1 acción, esa es tu parte.',
    wrongExplanation: 'Casi... Recuerda que al comprar acciones SÍ eres dueño de una parte de la empresa. Prestar dinero es lo que hacen los bonos. ¡Intenta de nuevo!',
  },
  {
    id: 2,
    title: 'ETFs y Fondos',
    icon: '🧺',
    theory:
      'Un <strong>ETF</strong> es como una canasta de frutas. En vez de comprar solo manzanas (una empresa), compras una canasta con manzanas, naranjas, uvas y plátanos (muchas empresas). Si una fruta se pudre, las demás te protegen. Esto se llama <strong>diversificación</strong>.',
    question: '¿Cuál es la principal ventaja de invertir en un ETF?',
    options: ['Ganas más dinero siempre', 'Diversificas tu riesgo entre muchas empresas'],
    correctAnswer: 1,
    explanation: '¡Exacto! La diversificación reduce tu riesgo. Si una empresa cae, las demás en el ETF pueden compensar la pérdida.',
    wrongExplanation: 'No exactamente... Los ETFs no garantizan ganancias. Su ventaja principal es la diversificación: repartes el riesgo entre muchas empresas. ¡Intenta de nuevo!',
  },
  {
    id: 3,
    title: 'Renta Fija y Bonos',
    icon: '📜',
    theory:
      'Un <strong>bono</strong> es un préstamo que TÚ le haces al gobierno o a una empresa. Por ejemplo, le prestas 1,000 CHF al gobierno suizo y te promete devolvértelos en 10 años + un interés fijo cada año. Es como un pagaré oficial. Más seguro que las acciones, pero con menos rendimiento.',
    question: 'Los bonos son más seguros porque...',
    options: ['Son más baratos', 'Te prometen un interés fijo y devolución del capital'],
    correctAnswer: 1,
    explanation: '¡Correcto! Los bonos te dan una promesa contractual de pago. El gobierno suizo nunca ha fallado en pagar sus bonos en la historia moderna.',
    wrongExplanation: 'Casi... Recuerda que los bonos son más seguros porque te prometen un interés fijo y la devolución del dinero. El precio no tiene que ver con la seguridad. ¡Intenta de nuevo!',
  },
  {
    id: 4,
    title: 'Crypto y Alternativos',
    icon: '₿',
    theory:
      'Las <strong>criptomonedas</strong> como Bitcoin son activos digitales descentralizados. No están controladas por ningún banco central. Pueden subir 100% en un mes o bajar 80%. Son el activo con la <strong>mayor volatilidad</strong>: ganancias gigantes o pérdidas devastadoras.',
    question: '¿Qué caracteriza principalmente a las criptomonedas?',
    options: ['Son extremadamente estables', 'Tienen alta volatilidad (suben y bajan mucho)'],
    correctAnswer: 1,
    explanation: '¡Correcto! Las criptomonedas son famosas por su alta volatilidad. Bitcoin ha caído un 80% tres veces en su historia, pero también ha subido miles de porciento.',
    wrongExplanation: 'No... Las criptomonedas son todo menos estables. Se caracterizan por su ALTA VOLATILIDAD: cambios de precio enormes en poco tiempo. ¡Intenta de nuevo!',
  },
];
