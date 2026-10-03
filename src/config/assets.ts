export interface SpriteCellDef {
  fileName: string;
  col: number;
  row: number;
  totalCols: number;
  totalRows: number;
}

export interface AssetDefinition {
  logicalKey: string;
  category: 'logo' | 'monkey' | 'cannon' | 'backgrounds' | 'balloons' | 'items' | 'powerups' | 'ui' | 'sounds';
  cell?: SpriteCellDef;
  path?: string;
  description: string;
}

// COMPLETE CATALOG OF GRAPHIC ASSETS MAPPED TO PHYSICAL PNG SPRITE SHEETS
export const ASSET_REGISTRY: Record<string, AssetDefinition> = {
  // LOGO
  'logo.main': {
    logicalKey: 'logo.main',
    category: 'logo',
    path: '/assets/sprites/logo.png',
    description: 'Logo Oficial Crazy Monkey Balloons',
  },

  // BACKGROUND
  'backgrounds.jungle': {
    logicalKey: 'backgrounds.jungle',
    category: 'backgrounds',
    path: '/assets/sprites/Valle selvático de templos y cascadas.png',
    description: 'Fondo de pantalla Valle Selvático con Cascadas',
  },

  // BALLOONS (4x4 Grid in "Cuadrícula de globos brillantes multicolor.png")
  'balloons.red': {
    logicalKey: 'balloons.red',
    category: 'balloons',
    cell: { fileName: 'Cuadrícula de globos brillantes multicolor.png', col: 0, row: 0, totalCols: 4, totalRows: 4 },
    description: 'Globo Rojo',
  },
  'balloons.blue': {
    logicalKey: 'balloons.blue',
    category: 'balloons',
    cell: { fileName: 'Cuadrícula de globos brillantes multicolor.png', col: 1, row: 0, totalCols: 4, totalRows: 4 },
    description: 'Globo Azul',
  },
  'balloons.green': {
    logicalKey: 'balloons.green',
    category: 'balloons',
    cell: { fileName: 'Cuadrícula de globos brillantes multicolor.png', col: 2, row: 0, totalCols: 4, totalRows: 4 },
    description: 'Globo Verde',
  },
  'balloons.yellow': {
    logicalKey: 'balloons.yellow',
    category: 'balloons',
    cell: { fileName: 'Cuadrícula de globos brillantes multicolor.png', col: 3, row: 0, totalCols: 4, totalRows: 4 },
    description: 'Globo Amarillo',
  },
  'balloons.purple': {
    logicalKey: 'balloons.purple',
    category: 'balloons',
    cell: { fileName: 'Cuadrícula de globos brillantes multicolor.png', col: 0, row: 1, totalCols: 4, totalRows: 4 },
    description: 'Globo Morado',
  },
  'balloons.orange': {
    logicalKey: 'balloons.orange',
    category: 'balloons',
    cell: { fileName: 'Cuadrícula de globos brillantes multicolor.png', col: 1, row: 1, totalCols: 4, totalRows: 4 },
    description: 'Globo Naranja',
  },
  'balloons.pink': {
    logicalKey: 'balloons.pink',
    category: 'balloons',
    cell: { fileName: 'Cuadrícula de globos brillantes multicolor.png', col: 2, row: 1, totalCols: 4, totalRows: 4 },
    description: 'Globo Rosado',
  },
  'balloons.cyan': {
    logicalKey: 'balloons.cyan',
    category: 'balloons',
    cell: { fileName: 'Cuadrícula de globos brillantes multicolor.png', col: 3, row: 1, totalCols: 4, totalRows: 4 },
    description: 'Globo Celeste',
  },
  'balloons.reinforced': {
    logicalKey: 'balloons.reinforced',
    category: 'balloons',
    cell: { fileName: 'Cuadrícula de globos brillantes multicolor.png', col: 0, row: 2, totalCols: 4, totalRows: 4 },
    description: 'Globo Plateado Reforzado (2 Golpes)',
  },
  'balloons.heavy': {
    logicalKey: 'balloons.heavy',
    category: 'balloons',
    cell: { fileName: 'Cuadrícula de globos brillantes multicolor.png', col: 1, row: 2, totalCols: 4, totalRows: 4 },
    description: 'Globo Negro Pesado (3 Golpes)',
  },
  'balloons.gold': {
    logicalKey: 'balloons.gold',
    category: 'balloons',
    cell: { fileName: 'Cuadrícula de globos brillantes multicolor.png', col: 2, row: 2, totalCols: 4, totalRows: 4 },
    description: 'Globo Dorado Especial',
  },
  'balloons.rainbow': {
    logicalKey: 'balloons.rainbow',
    category: 'balloons',
    cell: { fileName: 'Cuadrícula de globos brillantes multicolor.png', col: 3, row: 2, totalCols: 4, totalRows: 4 },
    description: 'Globo Arcoíris Multicolor',
  },
  'balloons.star_red': {
    logicalKey: 'balloons.star_red',
    category: 'balloons',
    cell: { fileName: 'Cuadrícula de globos brillantes multicolor.png', col: 0, row: 3, totalCols: 4, totalRows: 4 },
    description: 'Globo Rojo con Estrella (Recompensa Especial)',
  },
  'balloons.star_blue': {
    logicalKey: 'balloons.star_blue',
    category: 'balloons',
    cell: { fileName: 'Cuadrícula de globos brillantes multicolor.png', col: 1, row: 3, totalCols: 4, totalRows: 4 },
    description: 'Globo Azul con Estrella (Recompensa Especial)',
  },
  'balloons.star_green': {
    logicalKey: 'balloons.star_green',
    category: 'balloons',
    cell: { fileName: 'Cuadrícula de globos brillantes multicolor.png', col: 2, row: 3, totalCols: 4, totalRows: 4 },
    description: 'Globo Verde con Estrella (Recompensa Especial)',
  },
  'balloons.star_purple': {
    logicalKey: 'balloons.star_purple',
    category: 'balloons',
    cell: { fileName: 'Cuadrícula de globos brillantes multicolor.png', col: 3, row: 3, totalCols: 4, totalRows: 4 },
    description: 'Globo Morado con Estrella (Recompensa Especial)',
  },

  // MONKEY POSES (4x2 Grid in "Hoja de sprites_ Monos en cuerda.png")
  'monkey.swinging_0': {
    logicalKey: 'monkey.swinging_0',
    category: 'monkey',
    cell: { fileName: 'Hoja de sprites_ Monos en cuerda.png', col: 0, row: 0, totalCols: 4, totalRows: 2 },
    description: 'Mono Feliz Colgado - Frame 1',
  },
  'monkey.swinging_1': {
    logicalKey: 'monkey.swinging_1',
    category: 'monkey',
    cell: { fileName: 'Hoja de sprites_ Monos en cuerda.png', col: 1, row: 0, totalCols: 4, totalRows: 2 },
    description: 'Mono Feliz Colgado - Frame 2',
  },
  'monkey.swinging_2': {
    logicalKey: 'monkey.swinging_2',
    category: 'monkey',
    cell: { fileName: 'Hoja de sprites_ Monos en cuerda.png', col: 2, row: 0, totalCols: 4, totalRows: 2 },
    description: 'Mono Picando el Ojo - Frame 3',
  },
  'monkey.swinging_3': {
    logicalKey: 'monkey.swinging_3',
    category: 'monkey',
    cell: { fileName: 'Hoja de sprites_ Monos en cuerda.png', col: 3, row: 0, totalCols: 4, totalRows: 2 },
    description: 'Mono Brazos Abiertos - Frame 4',
  },
  'monkey.worried': {
    logicalKey: 'monkey.worried',
    category: 'monkey',
    cell: { fileName: 'Hoja de sprites_ Monos en cuerda.png', col: 0, row: 1, totalCols: 4, totalRows: 2 },
    description: 'Mono Preocupado',
  },
  'monkey.surprised': {
    logicalKey: 'monkey.surprised',
    category: 'monkey',
    cell: { fileName: 'Hoja de sprites_ Monos en cuerda.png', col: 1, row: 1, totalCols: 4, totalRows: 2 },
    description: 'Mono Surprendido / Asustado',
  },
  'monkey.falling': {
    logicalKey: 'monkey.falling',
    category: 'monkey',
    cell: { fileName: 'Hoja de sprites_ Monos en cuerda.png', col: 2, row: 1, totalCols: 4, totalRows: 2 },
    description: 'Mono Cayendo',
  },
  'monkey.crying': {
    logicalKey: 'monkey.crying',
    category: 'monkey',
    cell: { fileName: 'Hoja de sprites_ Monos en cuerda.png', col: 3, row: 1, totalCols: 4, totalRows: 2 },
    description: 'Mono Llorando con Lágrimas',
  },
  'monkey.taunting': {
    logicalKey: 'monkey.taunting',
    category: 'monkey',
    cell: { fileName: 'Hoja de sprites_ Monos en cuerda.png', col: 3, row: 1, totalCols: 4, totalRows: 2 },
    description: 'Mono Burlándose (Game Over)',
  },

  // CANNON STATES (4x1 Horizontal Strip in "Hoja de sprites_ cuatro cañones estilizados.png")
  'cannon.center': {
    logicalKey: 'cannon.center',
    category: 'cannon',
    cell: { fileName: 'Hoja de sprites_ cuatro cañones estilizados.png', col: 3, row: 0, totalCols: 4, totalRows: 1 },
    description: 'Cañón Apuntando al Centro (Vertical)',
  },
  'cannon.left': {
    logicalKey: 'cannon.left',
    category: 'cannon',
    cell: { fileName: 'Hoja de sprites_ cuatro cañones estilizados.png', col: 2, row: 0, totalCols: 4, totalRows: 1 },
    description: 'Cañón Apuntando a la Izquierda',
  },
  'cannon.right': {
    logicalKey: 'cannon.right',
    category: 'cannon',
    cell: { fileName: 'Hoja de sprites_ cuatro cañones estilizados.png', col: 0, row: 0, totalCols: 4, totalRows: 1 },
    description: 'Cañón Apuntando a la Derecha',
  },
  'cannon.damaged': {
    logicalKey: 'cannon.damaged',
    category: 'cannon',
    cell: { fileName: 'Hoja de sprites_ cuatro cañones estilizados.png', col: 1, row: 0, totalCols: 4, totalRows: 1 },
    description: 'Cañón Dañado con Grietas',
  },

  // POWER-UPS (2x3 Grid in "Hoja de iconos de potenciadores coloridos.png")
  'powerups.explosive': {
    logicalKey: 'powerups.explosive',
    category: 'powerups',
    cell: { fileName: 'Hoja de iconos de potenciadores coloridos.png', col: 0, row: 0, totalCols: 3, totalRows: 2 },
    description: 'Power-Up Explosivo (3 Bombas)',
  },
  'powerups.triple': {
    logicalKey: 'powerups.triple',
    category: 'powerups',
    cell: { fileName: 'Hoja de iconos de potenciadores coloridos.png', col: 1, row: 0, totalCols: 3, totalRows: 2 },
    description: 'Power-Up Triple (3 Esferas Azules)',
  },
  'powerups.piercing': {
    logicalKey: 'powerups.piercing',
    category: 'powerups',
    cell: { fileName: 'Hoja de iconos de potenciadores coloridos.png', col: 2, row: 0, totalCols: 3, totalRows: 2 },
    description: 'Power-Up Perforante (Cohete)',
  },
  'powerups.bounce': {
    logicalKey: 'powerups.bounce',
    category: 'powerups',
    cell: { fileName: 'Hoja de iconos de potenciadores coloridos.png', col: 0, row: 1, totalCols: 3, totalRows: 2 },
    description: 'Power-Up Super Rebote (Esfera Verde Rebotando)',
  },
  'powerups.multicolor': {
    logicalKey: 'powerups.multicolor',
    category: 'powerups',
    cell: { fileName: 'Hoja de iconos de potenciadores coloridos.png', col: 1, row: 1, totalCols: 3, totalRows: 2 },
    description: 'Power-Up Multicolor (Arcoíris)',
  },
  'powerups.electric': {
    logicalKey: 'powerups.electric',
    category: 'powerups',
    cell: { fileName: 'Hoja de iconos de potenciadores coloridos.png', col: 2, row: 1, totalCols: 3, totalRows: 2 },
    description: 'Power-Up Eléctrico (Esfera con Rayos)',
  },

  // MONKEY DROPPED ITEMS (2x3 Grid in "Iconos coloridos en cuadrícula 2×3.png")
  'items.banana': {
    logicalKey: 'items.banana',
    category: 'items',
    cell: { fileName: 'Iconos coloridos en cuadrícula 2×3.png', col: 0, row: 0, totalCols: 3, totalRows: 2 },
    description: 'Banana 🍌',
  },
  'items.coconut': {
    logicalKey: 'items.coconut',
    category: 'items',
    cell: { fileName: 'Iconos coloridos en cuadrícula 2×3.png', col: 1, row: 0, totalCols: 3, totalRows: 2 },
    description: 'Coco 🥥',
  },
  'items.orange': {
    logicalKey: 'items.orange',
    category: 'items',
    cell: { fileName: 'Iconos coloridos en cuadrícula 2×3.png', col: 2, row: 0, totalCols: 3, totalRows: 2 },
    description: 'Naranja 🍊',
  },
  'items.rock': {
    logicalKey: 'items.rock',
    category: 'items',
    cell: { fileName: 'Iconos coloridos en cuadrícula 2×3.png', col: 0, row: 1, totalCols: 3, totalRows: 2 },
    description: 'Piedra 🪨',
  },
  'items.bomb': {
    logicalKey: 'items.bomb',
    category: 'items',
    cell: { fileName: 'Iconos coloridos en cuadrícula 2×3.png', col: 1, row: 1, totalCols: 3, totalRows: 2 },
    description: 'Bomba 💣',
  },
  'items.boomerang': {
    logicalKey: 'items.boomerang',
    category: 'items',
    cell: { fileName: 'Iconos coloridos en cuadrícula 2×3.png', col: 2, row: 1, totalCols: 3, totalRows: 2 },
    description: 'Bumerán 🪃',
  },

  // UI & GAME ITEMS (2x3 Grid in "Iconos de juego brillantes en cuadrícula.png")
  'ui.cannonball': {
    logicalKey: 'ui.cannonball',
    category: 'ui',
    cell: { fileName: 'Iconos de juego brillantes en cuadrícula.png', col: 0, row: 0, totalCols: 3, totalRows: 2 },
    description: 'Bala Normal / Cañonazo Metálico',
  },
  'ui.heart': {
    logicalKey: 'ui.heart',
    category: 'ui',
    cell: { fileName: 'Iconos de juego brillantes en cuadrícula.png', col: 1, row: 0, totalCols: 3, totalRows: 2 },
    description: 'Corazón de Vida',
  },
  'ui.coin': {
    logicalKey: 'ui.coin',
    category: 'ui',
    cell: { fileName: 'Iconos de juego brillantes en cuadrícula.png', col: 2, row: 0, totalCols: 3, totalRows: 2 },
    description: 'Moneda de Oro con Estrella',
  },
  'ui.key': {
    logicalKey: 'ui.key',
    category: 'ui',
    cell: { fileName: 'Iconos de juego brillantes en cuadrícula.png', col: 0, row: 1, totalCols: 3, totalRows: 2 },
    description: 'Llave Dorada',
  },
  'ui.gem': {
    logicalKey: 'ui.gem',
    category: 'ui',
    cell: { fileName: 'Iconos de juego brillantes en cuadrícula.png', col: 1, row: 1, totalCols: 3, totalRows: 2 },
    description: 'Gema Diamante Azul',
  },
  'ui.chest': {
    logicalKey: 'ui.chest',
    category: 'ui',
    cell: { fileName: 'Iconos de juego brillantes en cuadrícula.png', col: 2, row: 1, totalCols: 3, totalRows: 2 },
    description: 'Caja de Premio / Cofre de Recompensas',
  },
  'items.prizebox': {
    logicalKey: 'items.prizebox',
    category: 'items',
    cell: { fileName: 'Iconos de juego brillantes en cuadrícula.png', col: 2, row: 1, totalCols: 3, totalRows: 2 },
    description: 'Caja de Premio que cae',
  },
};
