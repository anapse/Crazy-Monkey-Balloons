import { LevelConfig, BalloonColor, BalloonType } from '../types/game';

export const GAME_LEVELS: LevelConfig[] = [
  // LEVEL 1: Selva - Gran racimo de 30 globos multicolores
  {
    id: 1,
    name: 'La Selva Encantada',
    theme: 'jungle',
    bgColor1: '#0f381e',
    bgColor2: '#1b5e20',
    accentColor: '#4caf50',
    monkeySpeed: 1.5,
    monkeyDropInterval: 2.6, // Mono activo y agresivo
    monkeyAllowedItems: ['banana', 'orange', 'rock', 'coconut'],
    obstacles: [],
    balloons: [
      // Fila 1 - Superior (7 globos)
      { x: 22, y: 10, color: 'purple', type: 'normal' },
      { x: 31, y: 9, color: 'red', type: 'normal' },
      { x: 41, y: 8, color: 'blue', type: 'normal' },
      { x: 50, y: 7, color: 'gold', type: 'prize', hasPrize: true }, // Globo especial con estrella
      { x: 59, y: 8, color: 'green', type: 'normal' },
      { x: 69, y: 9, color: 'yellow', type: 'normal' },
      { x: 78, y: 10, color: 'orange', type: 'normal' },

      // Fila 2 - Media Superior (8 globos)
      { x: 18, y: 14, color: 'cyan', type: 'normal' },
      { x: 27, y: 13, color: 'pink', type: 'normal' },
      { x: 36, y: 12, color: 'orange', type: 'reinforced' },
      { x: 45, y: 11, color: 'cyan', type: 'normal' },
      { x: 55, y: 11, color: 'blue', type: 'reinforced' },
      { x: 64, y: 12, color: 'green', type: 'normal' },
      { x: 73, y: 13, color: 'red', type: 'reinforced' },
      { x: 82, y: 14, color: 'yellow', type: 'normal' },

      // Fila 3 - Media (8 globos)
      { x: 20, y: 19, color: 'yellow', type: 'normal' },
      { x: 29, y: 18, color: 'blue', type: 'normal' },
      { x: 38, y: 17, color: 'red', type: 'reinforced' },
      { x: 46, y: 16, color: 'purple', type: 'normal' },
      { x: 54, y: 16, color: 'green', type: 'reinforced' },
      { x: 62, y: 17, color: 'orange', type: 'normal' },
      { x: 71, y: 18, color: 'cyan', type: 'normal' },
      { x: 80, y: 19, color: 'pink', type: 'reinforced' },

      // Fila 4 - Flancos e integración Mono (7 globos)
      { x: 24, y: 24, color: 'orange', type: 'normal' },
      { x: 33, y: 23, color: 'cyan', type: 'normal' },
      { x: 42, y: 22, color: 'yellow', type: 'normal' },
      { x: 50, y: 21, color: 'purple', type: 'reinforced' },
      { x: 58, y: 22, color: 'pink', type: 'normal' },
      { x: 67, y: 23, color: 'blue', type: 'normal' },
      { x: 76, y: 24, color: 'green', type: 'normal' },
    ],
  },

  // LEVEL 2: Cielo Nublado - 30 globos y 2 GRANDES obstáculos de madera visibles
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
      // Obstáculos prominentes, con altura 20px y textura contrastante
      { x: 28, y: 48, w: 24, h: 20, type: 'wood' },
      { x: 72, y: 48, w: 24, h: 20, type: 'wood' },
    ],
    balloons: [
      { x: 18, y: 10, color: 'orange', type: 'normal' },
      { x: 28, y: 9, color: 'yellow', type: 'normal' },
      { x: 38, y: 8, color: 'red', type: 'reinforced' },
      { x: 50, y: 7, color: 'gold', type: 'prize', hasPrize: true },
      { x: 62, y: 8, color: 'purple', type: 'normal' },
      { x: 72, y: 9, color: 'blue', type: 'normal' },
      { x: 82, y: 10, color: 'cyan', type: 'normal' },

      { x: 20, y: 14, color: 'green', type: 'normal' },
      { x: 30, y: 13, color: 'orange', type: 'reinforced' },
      { x: 40, y: 12, color: 'cyan', type: 'normal' },
      { x: 50, y: 11, color: 'red', type: 'heavy' },
      { x: 60, y: 12, color: 'yellow', type: 'reinforced' },
      { x: 70, y: 13, color: 'pink', type: 'normal' },
      { x: 80, y: 14, color: 'purple', type: 'normal' },

      { x: 14, y: 18, color: 'yellow', type: 'reinforced' },
      { x: 25, y: 19, color: 'blue', type: 'reinforced' },
      { x: 35, y: 18, color: 'gold', type: 'prize', hasPrize: true }, // Segundo globo de premio
      { x: 45, y: 17, color: 'green', type: 'normal' },
      { x: 55, y: 17, color: 'orange', type: 'heavy' },
      { x: 65, y: 18, color: 'cyan', type: 'normal' },
      { x: 75, y: 19, color: 'red', type: 'reinforced' },
      { x: 86, y: 18, color: 'purple', type: 'normal' },

      { x: 22, y: 24, color: 'red', type: 'normal' },
      { x: 30, y: 24, color: 'yellow', type: 'normal' },
      { x: 40, y: 23, color: 'purple', type: 'normal' },
      { x: 50, y: 22, color: 'blue', type: 'normal' },
      { x: 60, y: 23, color: 'green', type: 'normal' },
      { x: 70, y: 24, color: 'pink', type: 'normal' },
      { x: 78, y: 24, color: 'green', type: 'reinforced' },
      { x: 50, y: 26, color: 'orange', type: 'reinforced' },
    ],
  },

  // LEVEL 3: Ruinas Antiguas - 30 globos y Barrera de Acero Central
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
    balloons: [
      { x: 15, y: 10, color: 'pink', type: 'normal' },
      { x: 25, y: 9, color: 'orange', type: 'reinforced' },
      { x: 36, y: 7, color: 'purple', type: 'normal' },
      { x: 48, y: 6, color: 'red', type: 'heavy' },
      { x: 52, y: 6, color: 'gold', type: 'prize', hasPrize: true },
      { x: 64, y: 7, color: 'green', type: 'normal' },
      { x: 75, y: 9, color: 'yellow', type: 'reinforced' },
      { x: 85, y: 10, color: 'cyan', type: 'normal' },

      { x: 18, y: 14, color: 'blue', type: 'normal' },
      { x: 28, y: 13, color: 'cyan', type: 'normal' },
      { x: 38, y: 12, color: 'gold', type: 'prize', hasPrize: true },
      { x: 48, y: 11, color: 'red', type: 'heavy' },
      { x: 58, y: 11, color: 'purple', type: 'heavy' },
      { x: 68, y: 12, color: 'orange', type: 'normal' },
      { x: 78, y: 13, color: 'green', type: 'reinforced' },
      { x: 84, y: 14, color: 'pink', type: 'normal' },

      { x: 14, y: 18, color: 'orange', type: 'reinforced' },
      { x: 24, y: 19, color: 'yellow', type: 'reinforced' },
      { x: 34, y: 18, color: 'blue', type: 'heavy' },
      { x: 44, y: 17, color: 'red', type: 'normal' },
      { x: 56, y: 17, color: 'cyan', type: 'reinforced' },
      { x: 66, y: 18, color: 'yellow', type: 'normal' },
      { x: 76, y: 19, color: 'blue', type: 'reinforced' },
      { x: 86, y: 18, color: 'purple', type: 'heavy' },

      { x: 30, y: 24, color: 'green', type: 'reinforced' },
      { x: 40, y: 23, color: 'orange', type: 'normal' },
      { x: 50, y: 22, color: 'purple', type: 'heavy' },
      { x: 60, y: 23, color: 'blue', type: 'reinforced' },
      { x: 70, y: 24, color: 'red', type: 'normal' },
      { x: 50, y: 26, color: 'pink', type: 'normal' },
    ],
  },

  // LEVEL 4: Desierto - 30 globos y Obstáculos móviles
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
    balloons: [
      { x: 14, y: 8, color: 'cyan', type: 'normal' },
      { x: 24, y: 9, color: 'yellow', type: 'normal' },
      { x: 35, y: 7, color: 'red', type: 'reinforced' },
      { x: 45, y: 6, color: 'gold', type: 'prize', hasPrize: true },
      { x: 55, y: 6, color: 'blue', type: 'reinforced' },
      { x: 65, y: 7, color: 'orange', type: 'normal' },
      { x: 76, y: 9, color: 'green', type: 'heavy' },
      { x: 86, y: 8, color: 'pink', type: 'heavy' },

      { x: 18, y: 13, color: 'purple', type: 'heavy' },
      { x: 28, y: 12, color: 'cyan', type: 'normal' },
      { x: 38, y: 11, color: 'red', type: 'heavy' },
      { x: 48, y: 10, color: 'gold', type: 'prize', hasPrize: true },
      { x: 58, y: 10, color: 'blue', type: 'heavy' },
      { x: 68, y: 11, color: 'pink', type: 'normal' },
      { x: 78, y: 12, color: 'yellow', type: 'heavy' },
      { x: 84, y: 13, color: 'orange', type: 'normal' },

      { x: 22, y: 18, color: 'green', type: 'reinforced' },
      { x: 32, y: 17, color: 'yellow', type: 'normal' },
      { x: 42, y: 16, color: 'purple', type: 'heavy' },
      { x: 52, y: 16, color: 'red', type: 'reinforced' },
      { x: 62, y: 16, color: 'cyan', type: 'normal' },
      { x: 72, y: 17, color: 'blue', type: 'reinforced' },
      { x: 80, y: 18, color: 'pink', type: 'normal' },

      { x: 28, y: 23, color: 'orange', type: 'normal' },
      { x: 38, y: 22, color: 'blue', type: 'heavy' },
      { x: 48, y: 21, color: 'green', type: 'reinforced' },
      { x: 58, y: 21, color: 'yellow', type: 'normal' },
      { x: 68, y: 22, color: 'red', type: 'heavy' },
      { x: 45, y: 25, color: 'purple', type: 'normal' },
      { x: 55, y: 25, color: 'gold', type: 'prize', hasPrize: true },
    ],
  },

  // LEVEL 5: Pico Helado - 30 globos y Bumpers Neón
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
    balloons: [
      { x: 22, y: 8, color: 'blue', type: 'heavy' },
      { x: 33, y: 6, color: 'purple', type: 'heavy' },
      { x: 45, y: 5, color: 'gold', type: 'prize', hasPrize: true },
      { x: 55, y: 5, color: 'gold', type: 'prize', hasPrize: true },
      { x: 67, y: 6, color: 'blue', type: 'heavy' },
      { x: 78, y: 8, color: 'cyan', type: 'heavy' },

      { x: 16, y: 12, color: 'red', type: 'normal' },
      { x: 26, y: 11, color: 'yellow', type: 'reinforced' },
      { x: 36, y: 10, color: 'pink', type: 'normal' },
      { x: 46, y: 9, color: 'red', type: 'heavy' },
      { x: 54, y: 9, color: 'blue', type: 'heavy' },
      { x: 64, y: 10, color: 'green', type: 'reinforced' },
      { x: 74, y: 11, color: 'orange', type: 'normal' },
      { x: 84, y: 12, color: 'purple', type: 'heavy' },

      { x: 20, y: 17, color: 'cyan', type: 'reinforced' },
      { x: 30, y: 16, color: 'orange', type: 'heavy' },
      { x: 40, y: 15, color: 'yellow', type: 'reinforced' },
      { x: 50, y: 14, color: 'gold', type: 'prize', hasPrize: true },
      { x: 60, y: 15, color: 'red', type: 'heavy' },
      { x: 70, y: 16, color: 'blue', type: 'reinforced' },
      { x: 80, y: 17, color: 'green', type: 'heavy' },

      { x: 26, y: 22, color: 'purple', type: 'normal' },
      { x: 36, y: 21, color: 'pink', type: 'normal' },
      { x: 46, y: 20, color: 'blue', type: 'heavy' },
      { x: 54, y: 20, color: 'yellow', type: 'reinforced' },
      { x: 64, y: 21, color: 'cyan', type: 'normal' },
      { x: 74, y: 22, color: 'red', type: 'reinforced' },

      { x: 40, y: 25, color: 'orange', type: 'normal' },
      { x: 50, y: 24, color: 'gold', type: 'prize', hasPrize: true },
      { x: 60, y: 25, color: 'purple', type: 'normal' },
    ],
  },
];

export function getLevelConfig(levelNumber: number): LevelConfig {
  const existing = GAME_LEVELS.find((l) => l.id === levelNumber);
  if (existing) return existing;

  // Procedural generator for higher levels (>5) with 24-30 balloons and thick obstacles
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

  const colors: BalloonColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'cyan', 'pink'];
  const balloonCount = 30; // 30 globos para todos los niveles
  const generatedBalloons = [];

  for (let i = 0; i < balloonCount; i++) {
    const color = colors[i % colors.length];
    const isPrize = i === 2 || i === 14 || i === 22;
    const type: BalloonType = isPrize ? 'prize' : (i % 3 === 0 ? 'heavy' : (i % 2 === 0 ? 'reinforced' : 'normal'));

    generatedBalloons.push({
      x: 20 + (i % 6) * 12,
      y: 8 + Math.floor(i / 6) * 5,
      color,
      type,
      hasPrize: isPrize,
    });
  }

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
    balloons: generatedBalloons,
  };
}
