// Base de dados local com raças, características e dicas nutricionais
export const BREEDS_DATABASE = [
  // CÃES
  {
    id: 'c1',
    name: 'Vira-lata (SRD - Cão)',
    type: 'dog',
    size: 'Médio',
    description: 'Muito resistente e amoroso. Adapta-se bem a vários tipos de alimentação balanceada.',
    idealMealIntervalHours: 8,
    maxDaysSameFood: 45,
    recommendedComplements: ['Cenoura cozida', 'Chuchu', 'Maçã sem semente']
  },
  {
    id: 'c2',
    name: 'Golden Retriever',
    type: 'dog',
    size: 'Grande',
    description: 'Enérgico e dócil. Tem tendência a ganho de peso e displasia.',
    idealMealIntervalHours: 8,
    maxDaysSameFood: 30,
    recommendedComplements: ['Cenoura crua (ótima para dentes)', 'Abobrinha', 'Banana (com moderação)']
  },
  {
    id: 'c3',
    name: 'Shih Tzu',
    type: 'dog',
    size: 'Pequeno',
    description: 'Braquicefálico e dócil. Digestão sensível e pelagem que exige ômega 3.',
    idealMealIntervalHours: 6,
    maxDaysSameFood: 30,
    recommendedComplements: ['Abóbora cozida', 'Chuchu no vapor', 'Pêra sem sementes']
  },
  {
    id: 'c4',
    name: 'Bulldog Francês',
    type: 'dog',
    size: 'Pequeno',
    description: 'Sensível a alergias alimentares e tendência a gases.',
    idealMealIntervalHours: 6,
    maxDaysSameFood: 25,
    recommendedComplements: ['Cenoura cozida', 'Batata doce em pouca quantidade', 'Brócolis no vapor']
  },
  {
    id: 'c5',
    name: 'Pastor Alemão',
    type: 'dog',
    size: 'Grande',
    description: 'Inteligente e ativo. Estômago sensível com risco de torção gástrica.',
    idealMealIntervalHours: 8,
    maxDaysSameFood: 30,
    recommendedComplements: ['Beterraba cozida', 'Maçã', 'Abobrinha cozida']
  },
  // GATOS
  {
    id: 'g1',
    name: 'Vira-lata (SRD - Gato)',
    type: 'cat',
    size: 'Médio',
    description: 'Curioso e independente. Bebe pouca água, necessita de alimentos úmidos.',
    idealMealIntervalHours: 6,
    maxDaysSameFood: 40,
    recommendedComplements: ['Abóbora cozida (ajuda nas bolas de pelo)', 'Sachê de água morna', 'Cenoura ralada']
  },
  {
    id: 'g2',
    name: 'Siamês',
    type: 'cat',
    size: 'Médio',
    description: 'Muito vocal e carinhoso. Exige estímulo constante.',
    idealMealIntervalHours: 6,
    maxDaysSameFood: 30,
    recommendedComplements: ['Abobrinha cozida no vapor', 'Graminha de trigo', 'Melão em pequenos pedaços']
  },
  {
    id: 'g3',
    name: 'Persa',
    type: 'cat',
    size: 'Médio',
    description: 'Pelagem densa e focinho achatado. Risco de problemas renais e digestivos.',
    idealMealIntervalHours: 5,
    maxDaysSameFood: 30,
    recommendedComplements: ['Purê de abóbora sem tempero', 'Caldo de carne natural sem sal', 'Chuchu cozido']
  }
];

// Alimentos e vegetais seguros e proibidos para consulta
export const FOOD_SAFETY_GUIDE = {
  safe: [
    { name: 'Cenoura', benefit: 'Rica em vitamina A e excelente para mastigação.', prep: 'Pode ser crua ou cozida sem sal.' },
    { name: 'Abóbora / Cabotiá', benefit: 'Rica em fibras, ajuda na digestão e bolas de pelo.', prep: 'Sempre cozida e amassada.' },
    { name: 'Maçã (SEM sementes)', benefit: 'Vitaminas A e C. Nunca dê sementes (tóxicas).', prep: 'Fatiada sem caroço.' },
    { name: 'Chuchu', benefit: 'Hidratação e pouquíssimas calorias.', prep: 'Cozido apenas na água.' },
    { name: 'Abobrinha', benefit: 'Minerais e fibras leves para o estômago.', prep: 'Cozida no vapor sem óleo.' }
  ],
  toxic: [
    { name: 'Chocolate & Café', danger: 'Contém teobromina e cafeína, tóxico para o coração.' },
    { name: 'Cebola & Alho', danger: 'Destrói os glóbulos vermelhos do sangue (anemia severa).' },
    { name: 'Uva & Uva passa', danger: 'Causa falência renal aguda em cães e gatos.' },
    { name: 'Abacate', danger: 'Contém persina, que causa vômito e diarreia.' },
    { name: 'Ossos cozidos', danger: 'Podem lascar e perfurar estômago ou intestino.' }
  ]
};

// Protocolo de vacinas padrão
export const DEFAULT_VACCINES = {
  dog: [
    { name: 'V8 ou V10 (Múltipla)', initialMonths: 2, intervalMonths: 12, dosesTotal: 3 },
    { name: 'Antirrábica', initialMonths: 4, intervalMonths: 12, dosesTotal: 1 },
    { name: 'Gripe Canina', initialMonths: 3, intervalMonths: 12, dosesTotal: 2 },
    { name: 'Giárdia', initialMonths: 3, intervalMonths: 12, dosesTotal: 2 }
  ],
  cat: [
    { name: 'V3, V4 ou V5 Felina', initialMonths: 2, intervalMonths: 12, dosesTotal: 3 },
    { name: 'Antirrábica Felina', initialMonths: 4, intervalMonths: 12, dosesTotal: 1 }
  ]
};
