import { LevelConfig, BalloonColor, BalloonType } from '../types/game';

function create40Balloons(options: {
  prizeIndices?: number[];
  heavyIndices?: number[];
  reinforcedIndices?: number[];
  colors?: BalloonColor[];
}): LevelConfig['balloons'] {
  const defaultColors: BalloonColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'cyan', 'pink'];
  const colors = options.colors || defaultColors;
  const prizeSet = new Set(options.prizeIndices || [3, 15, 27, 35]);
  const heavySet = new Set(options.heavyIndices || [5, 11, 18, 24, 31, 37]);
  const reinforcedSet = new Set(options.reinforcedIndices || [1, 7, 13, 19, 23, 29, 33, 39]);

  const list: LevelConfig['balloons'] = [];
  for (let i = 0; i < 40; i++) {
    const isPrize = prizeSet.has(i);
    const isHeavy = heavySet.has(i);
    const isReinforced = reinforcedSet.has(i);

    const type: BalloonType = isPrize ? 'prize' : isHeavy ? 'heavy' : isReinforced ? 'reinforced' : 'normal';
    const color: BalloonColor = isPrize ? 'gold' : colors[i % colors.length];

    list.push({
      x: 12 + (i % 8) * 11,
      y: 6 + Math.floor(i / 8) * 4,
      color,
      type,
      hasPrize: isPrize,
    });
  }
  return list;
}

export const GAME_LEVELS: LevelConfig[] = [
  // LEVEL 1: Selva - 40 globos multicolores
  {
    id: 1,
    name: 'La Selva Encantada',
    theme: 'jungle',
    bgColor1: '#0f381e',
    bgColor2: '#1b5e20',
    accentColor: '#4caf50',
    monkeySpeed: 1.5,
    monkeyDropInterval: 2.6,
    monkeyAllowedItems: ['banana', 'orange', 'rock', 'coconut'],
    obstacles: [],
    balloons: create40Balloons({
      prizeIndices: [4, 18, 32],
      heavyIndices: [7, 15, 23, 31],
      reinforcedIndices: [2, 9, 12, 20, 26, 35, 38],
      colors: ['green', 'yellow', 'orange', 'red', 'purple', 'blue', 'cyan', 'pink'],
    }),
  },

  // LEVEL 2: Cielo Nublado - 40 globos y Obstáculos de madera
  {
    id: 2,
    name: 'Cielo Nublado',
    theme: 'sky',
    bgColor1: '#0284c7',
    bgColor2: '#38bdf8',
    accentColor: '#e0f2fe',
    monkeySpeed: 1.8,
    monkeyDropInterval: 2.3,
    monkeyAllowedItems: ['banana', 'rock', 'coconut', 'bomb'],
    obstacles: [
      { x: 28, y: 48, w: 24, h: 20, type: 'wood' },
      { x: 72, y: 48, w: 24, h: 20, type: 'wood' },
    ],
    balloons: create40Balloons({
      prizeIndices: [3, 16, 28, 36],
      heavyIndices: [6, 12, 20, 25, 33, 37],
      reinforcedIndices: [1, 8, 14, 19, 22, 29, 34],
      colors: ['cyan', 'blue', 'purple', 'pink', 'yellow', 'orange', 'red', 'green'],
    }),
  },

  // LEVEL 3: Ruinas Antiguas - 40 globos y Barrera de Acero
  {
    id: 3,
    name: 'Ruinas de Piedra',
    theme: 'ruins',
    bgColor1: '#334155',
    bgColor2: '#475569',
    accentColor: '#fbbf24',
    monkeySpeed: 2.0,
    monkeyDropInterval: 2.1,
    monkeyAllowedItems: ['banana', 'rock', 'coconut', 'bomb', 'orange'],
    obstacles: [
      { x: 50, y: 46, w: 34, h: 22, type: 'metal' },
    ],
    balloons: create40Balloons({
      prizeIndices: [5, 17, 29, 38],
      heavyIndices: [4, 9, 13, 21, 26, 32, 36],
      reinforcedIndices: [0, 6, 11, 16, 22, 28, 34],
      colors: ['orange', 'yellow', 'red', 'purple', 'blue', 'cyan', 'green', 'pink'],
    }),
  },

  // LEVEL 4: Desierto - 40 globos y Obstáculos móviles
  {
    id: 4,
    name: 'Dunas del Desierto',
    theme: 'desert',
    bgColor1: '#78350f',
    bgColor2: '#b45309',
    accentColor: '#fde047',
    monkeySpeed: 2.2,
    monkeyDropInterval: 1.9,
    monkeyAllowedItems: ['banana', 'rock', 'bomb', 'orange', 'boomerang'],
    obstacles: [
      { x: 28, y: 48, w: 22, h: 20, type: 'wood', moving: true, vx: 1.6, minX: 14, maxX: 44 },
      { x: 72, y: 48, w: 22, h: 20, type: 'wood', moving: true, vx: -1.6, minX: 56, maxX: 86 },
    ],
    balloons: create40Balloons({
      prizeIndices: [3, 14, 25, 35],
      heavyIndices: [5, 10, 16, 21, 27, 33, 38],
      reinforcedIndices: [1, 7, 12, 18, 23, 29, 36],
      colors: ['yellow', 'orange', 'red', 'purple', 'cyan', 'green', 'blue', 'pink'],
    }),
  },

  // LEVEL 5: Pico Helado - 40 globos y Bumpers Neón
  {
    id: 5,
    name: 'Pico Helado',
    theme: 'snow',
    bgColor1: '#0f172a',
    bgColor2: '#1e293b',
    accentColor: '#38bdf8',
    monkeySpeed: 2.4,
    monkeyDropInterval: 1.8,
    monkeyAllowedItems: ['rock', 'coconut', 'bomb', 'boomerang', 'orange'],
    obstacles: [
      { x: 50, y: 44, w: 26, h: 22, type: 'bumper' },
      { x: 22, y: 56, w: 18, h: 18, type: 'wood' },
      { x: 78, y: 56, w: 18, h: 18, type: 'wood' },
    ],
    balloons: create40Balloons({
      prizeIndices: [4, 15, 26, 37],
      heavyIndices: [2, 8, 13, 19, 24, 30, 36, 39],
      reinforcedIndices: [0, 6, 11, 17, 22, 28, 33],
      colors: ['blue', 'cyan', 'purple', 'pink', 'yellow', 'green', 'orange', 'red'],
    }),
  },
];

export function getLevelConfig(levelNumber: number): LevelConfig {
  const existing = GAME_LEVELS.find((l) => l.id === levelNumber);
  if (existing) return existing;

  // Procedural generator for higher levels (>5) with exactly 40 balloons
  const themes: LevelConfig['theme'][] = ['jungle', 'sky', 'ruins', 'desert', 'snow', 'canyon', 'factory', 'temple', 'volcano', 'mountain'];
  const theme = themes[(levelNumber - 1) % themes.length];
  const bgColors: { [key: string]: [string, string, string] } = {
    jungle: ['#0f381e', '#1b5e20', '#4caf50'],
    sky: ['#0284c7', '#38bdf8', '#e0f2fe'],
    ruins: ['#334155', '#475569', '#fbbf24'],
    desert: ['#78350f', '#b45309', '#fde047'],
    snow: ['#0f172a', '#1e293b', '#38bdf8'],
    canyon: ['#451a03', '#7c2d12', '#f97316'],
    factory: ['#18181b', '#27272a', '#ef4444'],
    temple: ['#312e81', '#4338ca', '#a855f7'],
    volcano: ['#450a0a', '#7f1d1d', '#f87171'],
    mountain: ['#020617', '#0f172a', '#38bdf8'],
  };

  return {
    id: levelNumber,
    name: `Nivel Extremo ${levelNumber}`,
    theme,
    bgColor1: bgColors[theme][0],
    bgColor2: bgColors[theme][1],
    accentColor: bgColors[theme][2],
    monkeySpeed: Math.min(3.8, 1.8 + levelNumber * 0.1),
    monkeyDropInterval: Math.max(1.6, 2.8 - levelNumber * 0.08),
    monkeyAllowedItems: ['banana', 'rock', 'bomb', 'coconut', 'orange', 'boomerang'],
    obstacles: [
      { x: 30, y: 48, w: 22, h: 20, type: 'wood', moving: true, vx: 1.8, minX: 14, maxX: 44 },
      { x: 70, y: 48, w: 22, h: 20, type: 'metal', moving: true, vx: -1.8, minX: 56, maxX: 86 },
    ],
    balloons: create40Balloons({
      prizeIndices: [3, 14, 25, 36],
      heavyIndices: [2, 7, 12, 18, 23, 29, 34, 39],
      reinforcedIndices: [1, 6, 11, 16, 21, 27, 32, 37],
    }),
  };
}
