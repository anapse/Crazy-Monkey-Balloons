export type PowerUpType = 'explosive' | 'triple' | 'piercing' | 'bounce' | 'rainbow' | 'electric';

export interface PowerUpInventory {
  explosive: number;
  triple: number;
  piercing: number;
  bounce: number;
  rainbow: number;
  electric: number;
}

export type BalloonColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'gold' | 'pink' | 'cyan';

export type BalloonType = 'normal' | 'reinforced' | 'heavy' | 'prize';

export interface Balloon {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: BalloonColor;
  type: BalloonType;
  maxHp: number;
  hp: number;
  hasPrize?: boolean;
  stringAngle: number;
  stringLength: number;
  isPopped: boolean;
}

export interface DroppedItem {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  type: 'banana' | 'coconut' | 'bomb' | 'rock' | 'orange' | 'boomerang';
  rotation: number;
  rotSpeed: number;
}

export interface PrizeBox {
  id: string;
  x: number;
  y: number;
  vy: number;
  width: number;
  height: number;
  powerUp: PowerUpType;
  isCollected: boolean;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  type: 'normal' | PowerUpType;
  bouncesLeft: number;
  maxBounces: number;
  piercedCount: number;
  isExpired: boolean;
  color: string;
  trail: { x: number; y: number; alpha: number }[];
}

export interface Obstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'wood' | 'metal' | 'bumper';
  bounceFactor: number;
  moving?: boolean;
  vx?: number;
  minX?: number;
  maxX?: number;
}

export interface LevelConfig {
  id: number;
  name: string;
  theme: 'jungle' | 'sky' | 'ruins' | 'desert' | 'snow' | 'canyon' | 'factory' | 'volcano' | 'temple' | 'mountain';
  bgColor1: string;
  bgColor2: string;
  accentColor: string;
  balloons: {
    x: number; // percentage 0-100
    y: number; // percentage 0-100
    color: BalloonColor;
    type: BalloonType;
    hasPrize?: boolean;
  }[];
  obstacles: {
    x: number;
    y: number;
    w: number;
    h: number;
    type: 'wood' | 'metal' | 'bumper';
    moving?: boolean;
    vx?: number;
    minX?: number;
    maxX?: number;
  }[];
  monkeySpeed: number;
  monkeyDropInterval: number; // in seconds
  monkeyAllowedItems: ('banana' | 'coconut' | 'bomb' | 'rock' | 'orange' | 'boomerang')[];
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape?: 'circle' | 'star' | 'spark';
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  vy: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  size: number;
}

export interface ScoreEntry {
  id: string;
  playerName: string;
  score: number;
  levelReached: number;
  balloonsPopped: number;
  date: string;
  timestamp: number;
}

export interface MatchRecord {
  id: string;
  playerName: string;
  level: number;
  score: number;
  result: 'won' | 'lost';
  durationSeconds: number;
  balloonsDestroyed: number;
  powerUpsUsed: number;
  date: string;
  timestamp: number;
}

export interface AnalyticsSummary {
  totalVisits: number;
  gamesStarted: number;
  gamesCompleted: number;
  uniquePlayers: number;
  totalPoints: number;
  avgScore: number;
  balloonsDestroyed: number;
  powerUpsUsed: number;
  dailyVisits: { [date: string]: number };
}
