import {
  LevelConfig,
  Balloon,
  BalloonColor,
  Projectile,
  DroppedItem,
  PrizeBox,
  Obstacle,
  Particle,
  FloatingText,
  PowerUpType,
  PowerUpInventory,
} from '../types/game';
import { PhysicsUtils } from './physics';
import { soundManager } from './audio';
import { assetManager } from '../services/assetManager';

export interface GameCallbacks {
  onLevelWin: (score: number, balloonsPopped: number) => void;
  onGameOver: (score: number, levelReached: number) => void;
  onScoreUpdate: (score: number) => void;
  onLivesUpdate: (lives: number) => void;
  onBalloonsUpdate: (remaining: number, total: number) => void;
  onInventoryUpdate: (inventory: PowerUpInventory) => void;
  onActivePowerUpChange?: (type: PowerUpType | 'normal') => void;
}

interface BalloonOffset {
  relX: number;
  relY: number;
  isFront: boolean;
  swayPhase: number;
}

export class GameEngine {
  public width: number = 480;
  public height: number = 853; // Strict 9:16 portrait canvas

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private callbacks: GameCallbacks;

  // Game State
  public level: LevelConfig;
  public score: number = 0;
  public lives: number = 3;
  public isPaused: boolean = false;
  public isGameOver: boolean = false;
  public isLevelWon: boolean = false;

  // Inventory (Initial: ONLY 1 NORMAL BULLET, 0 FREE POWER-UPS)
  public inventory: PowerUpInventory = {
    explosive: 0,
    triple: 0,
    piercing: 0,
    bounce: 0,
    rainbow: 0,
    electric: 0,
  };
  public activePowerUp: PowerUpType | 'normal' = 'normal';

  // SLOW, DELIBERATE CANNON CADENCE (Cooldown timer - halved for faster responsiveness)
  public shootCooldownTimer: number = 0;
  public baseCooldown: number = 0.67; // Delay de disparos a la mitad (0.67s en vez de 1.35s)

  // CANNON (PROMINENT, BIGGER & LOWERED DOWN SEPARATED FROM POWER-UPS: 135x135px, X = 330, Y = 675)
  public cannonX: number = 330;
  public cannonY: number = 675;
  public cannonWidth: number = 135;
  public cannonHeight: number = 135;
  public cannonAngle: number = -Math.PI * 0.65; // Aiming towards balloon bouquet center (-117 deg)
  public cannonRecoil: number = 0;
  public cannonVibrate: number = 0;

  // Aiming state
  public isAiming: boolean = false;
  public aimX: number = 240;
  public aimY: number = 320;

  // BALLOON_GROUP & MONKEY (LARGE MONKEY: 135x160px, LOWERED AT Y = 230)
  public groupX: number = 240;
  public groupY: number = 230;
  public groupBaseY: number = 230;
  public groupVx: number = 1.6;
  public monkeyWidth: number = 135;
  public monkeyHeight: number = 160;
  public monkeyState: 'swinging' | 'worried' | 'falling' | 'crying' | 'taunting' = 'swinging';

  // AGGRESSIVE ATTACK BEHAVIOR & ANIMATION
  public monkeyDropTimer: number = 0;
  public monkeyAttackState: 'idle' | 'preparing' | 'throwing' = 'idle';
  public monkeyNextItemType: 'banana' | 'coconut' | 'bomb' | 'rock' | 'orange' | 'boomerang' = 'banana';
  private itemSequenceIndex: number = 0;

  public groupSway: number = 0;
  public animTime: number = 0;

  // Map of relative offsets for each balloon in the integrated bouquet
  private balloonOffsets: Map<string, BalloonOffset> = new Map();

  // Game Objects
  public balloons: Balloon[] = [];
  public projectiles: Projectile[] = [];
  public droppedItems: DroppedItem[] = [];
  public prizeBoxes: PrizeBox[] = [];
  public obstacles: Obstacle[] = [];
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];

  // Stats
  public totalBalloonsInLevel: number = 0;
  public balloonsPoppedInLevel: number = 0;
  public totalBalloonsPoppedGame: number = 0;
  public powerUpsUsedGame: number = 0;

  private animFrameId: number | null = null;
  private lastTime: number = 0;

  constructor(canvas: HTMLCanvasElement, level: LevelConfig, callbacks: GameCallbacks) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2d context');
    this.ctx = ctx;

    this.level = level;
    this.callbacks = callbacks;

    this.initLevel(level);
    assetManager.preloadAll();
  }

  public initLevel(levelConfig: LevelConfig) {
    this.level = levelConfig;
    this.isLevelWon = false;
    this.isGameOver = false;

    // Reset Group Anchor Position firmly in the Upper-Center of the arena
    this.groupX = 240;
    this.groupY = 230;
    this.groupBaseY = 230;
    this.groupVx = levelConfig.monkeySpeed;
    this.groupSway = 0;

    this.monkeyState = 'swinging';
    this.monkeyDropTimer = levelConfig.monkeyDropInterval;
    this.monkeyAttackState = 'idle';
    this.shootCooldownTimer = 0;

    this.projectiles = [];
    this.droppedItems = [];
    this.prizeBoxes = [];
    this.particles = [];
    this.floatingTexts = [];

    // Load High-Contrast Obstacles (in Mid Airspace Y ~ 420-530)
    this.obstacles = levelConfig.obstacles.map((o, idx) => ({
      id: `obs_${idx}`,
      x: (o.x / 100) * this.width - ((o.w / 100) * this.width) / 2,
      y: (o.y / 100) * this.height,
      width: (o.w / 100) * this.width,
      height: Math.max(18, o.h), // Force solid, visible height
      type: o.type,
      bounceFactor: o.type === 'bumper' ? 1.5 : 0.95,
      moving: o.moving,
      vx: o.vx || 1,
      minX: o.minX ? (o.minX / 100) * this.width : undefined,
      maxX: o.maxX ? (o.maxX / 100) * this.width : undefined,
    }));

    // Dense 40-Position Organic Balloon Bouquet Layout surrounding & crowning the monkey
    this.balloonOffsets.clear();
    const rawBalloons = levelConfig.balloons;

    const bouquetPositions: { relX: number; relY: number; isFront: boolean }[] = [
      // Row 1: Top Apex Row (7 balloons) - Y = -182 to -165
      { relX: -90, relY: -165, isFront: false },
      { relX: -60, relY: -172, isFront: false },
      { relX: -30, relY: -178, isFront: false },
      { relX: 0, relY: -182, isFront: false },
      { relX: 30, relY: -178, isFront: false },
      { relX: 60, relY: -172, isFront: false },
      { relX: 90, relY: -165, isFront: false },

      // Row 2: Upper Mid Tier (9 balloons) - Y = -160 to -142
      { relX: -115, relY: -142, isFront: false },
      { relX: -85, relY: -148, isFront: true },
      { relX: -55, relY: -154, isFront: false },
      { relX: -25, relY: -158, isFront: false },
      { relX: 0, relY: -160, isFront: true },
      { relX: 25, relY: -158, isFront: false },
      { relX: 55, relY: -154, isFront: false },
      { relX: 85, relY: -148, isFront: true },
      { relX: 115, relY: -142, isFront: false },

      // Row 3: Mid-Upper Tier (9 balloons) - Y = -136 to -118
      { relX: -125, relY: -118, isFront: true },
      { relX: -95, relY: -124, isFront: false },
      { relX: -65, relY: -130, isFront: true },
      { relX: -35, relY: -134, isFront: false },
      { relX: 0, relY: -136, isFront: true },
      { relX: 35, relY: -134, isFront: false },
      { relX: 65, relY: -130, isFront: true },
      { relX: 95, relY: -124, isFront: false },
      { relX: 125, relY: -118, isFront: true },

      // Row 4: Center Overlap Tier (8 balloons) - Y = -108 to -92
      { relX: -110, relY: -92, isFront: false },
      { relX: -75, relY: -98, isFront: true },
      { relX: -45, relY: -105, isFront: false },
      { relX: -15, relY: -108, isFront: true },
      { relX: 15, relY: -108, isFront: true },
      { relX: 45, relY: -105, isFront: false },
      { relX: 75, relY: -98, isFront: true },
      { relX: 110, relY: -92, isFront: false },

      // Row 5: Lower Flanking Tier around Monkey (7 balloons) - Y = -82 to -65
      { relX: -95, relY: -65, isFront: true },
      { relX: -65, relY: -74, isFront: true },
      { relX: -35, relY: -80, isFront: false },
      { relX: 0, relY: -82, isFront: true },
      { relX: 35, relY: -80, isFront: false },
      { relX: 65, relY: -74, isFront: true },
      { relX: 95, relY: -65, isFront: true },
    ];

    this.balloons = rawBalloons.map((b, idx) => {
      const id = `bal_${idx}`;
      const maxHp = b.type === 'heavy' ? 3 : b.type === 'reinforced' ? 2 : 1;
      const pos = bouquetPositions[idx % bouquetPositions.length];

      this.balloonOffsets.set(id, {
        relX: pos.relX,
        relY: pos.relY,
        isFront: pos.isFront,
        swayPhase: idx * 0.55,
      });

      return {
        id,
        x: this.groupX + pos.relX,
        y: this.groupY + pos.relY,
        radius: b.type === 'heavy' ? 24 : b.type === 'prize' ? 23 : 21,
        color: b.color,
        type: b.type,
        maxHp,
        hp: maxHp,
        hasPrize: b.hasPrize || b.type === 'prize',
        stringAngle: 0,
        stringLength: 40,
        isPopped: false,
      };
    });

    this.totalBalloonsInLevel = this.balloons.length;
    this.balloonsPoppedInLevel = 0;

    this.callbacks.onBalloonsUpdate(this.totalBalloonsInLevel, this.totalBalloonsInLevel);
    this.callbacks.onLivesUpdate(this.lives);
    this.callbacks.onScoreUpdate(this.score);
    this.callbacks.onInventoryUpdate(this.inventory);
  }

  public start() {
    this.lastTime = performance.now();
    soundManager.startCircusMusic();
    this.loop(this.lastTime);
  }

  public stop() {
    soundManager.stopCircusMusic();
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public togglePause(): boolean {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      soundManager.pauseCircusMusic();
    } else {
      soundManager.resumeCircusMusic();
    }
    return this.isPaused;
  }

  public selectPowerUp(type: PowerUpType | 'normal') {
    if (type === 'normal') {
      this.activePowerUp = 'normal';
    } else if (this.inventory[type] > 0) {
      this.activePowerUp = type;
    } else {
      this.activePowerUp = 'normal';
    }
    this.callbacks.onActivePowerUpChange?.(this.activePowerUp);
    this.callbacks.onInventoryUpdate(this.inventory);
  }

  // Aiming Controls (Always pointing upward into the arena, never inverted)
  public updateAim(canvasX: number, canvasY: number) {
    this.aimX = canvasX;
    this.aimY = canvasY;

    let dx = canvasX - this.cannonX;
    let dy = canvasY - this.cannonY;

    // If user touches below or near cannon, force upward vector so it never aims into the ground
    if (dy >= -20) {
      dy = -Math.max(40, dy);
    }

    let angle = Math.atan2(dy, dx);
    const minAngle = -Math.PI * 0.90; // High left limit
    const maxAngle = -Math.PI * 0.10; // High right limit

    if (angle > maxAngle) angle = maxAngle;
    if (angle < minAngle) angle = minAngle;

    this.cannonAngle = angle;
  }

  public moveCannonHorizontal(targetX: number) {
    this.cannonX = Math.max(80, Math.min(this.width - 80, targetX));
  }

  // CONTROLLED SLOW SHOOTING CADENCE (Cooldown & progression)
  public fireCannon() {
    if (this.isPaused || this.isGameOver || this.isLevelWon) return;

    // Cooldown check!
    if (this.shootCooldownTimer > 0) return;

    // When shooting normal bullet, allow up to 2 bullets in flight at a time
    if (this.activePowerUp === 'normal') {
      const normalActive = this.projectiles.filter((p) => p.type === 'normal' && !p.isExpired).length;
      if (normalActive >= 2) return;
    }

    const currentType = this.activePowerUp;

    // Set cooldown based on weapon progression (all delays cut in half)
    if (currentType === 'normal') {
      this.shootCooldownTimer = this.baseCooldown; // 0.67s reload cadence
    } else if (currentType === 'triple') {
      this.shootCooldownTimer = 0.42; // Fast triple
    } else if (currentType === 'bounce') {
      this.shootCooldownTimer = 0.38;
    } else if (currentType === 'rainbow') {
      this.shootCooldownTimer = 0.32;
    } else {
      this.shootCooldownTimer = 0.45;
    }

    this.cannonRecoil = 20;

    const speed = 15;
    const tipDistance = 75; // for 135px cannon
    const spawnX = this.cannonX + Math.cos(this.cannonAngle) * tipDistance;
    const spawnY = this.cannonY + Math.sin(this.cannonAngle) * tipDistance;

    if (currentType !== 'normal' && this.inventory[currentType] > 0) {
      this.inventory[currentType]--;
      this.powerUpsUsedGame++;
      this.callbacks.onInventoryUpdate(this.inventory);
      if (this.inventory[currentType] <= 0) {
        this.activePowerUp = 'normal';
        this.callbacks.onActivePowerUpChange?.('normal');
      }
    }

    soundManager.playShoot(currentType);

    if (currentType === 'triple') {
      const spreadAngles = [-0.15, 0, 0.15];
      spreadAngles.forEach((spread) => {
        const angle = this.cannonAngle + spread;
        this.projectiles.push({
          id: 'proj_' + Math.random(),
          x: spawnX,
          y: spawnY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 12,
          type: 'triple',
          bouncesLeft: 5,
          maxBounces: 5,
          piercedCount: 0,
          isExpired: false,
          color: '#38bdf8',
          trail: [],
        });
      });
    } else {
      let color = '#38bdf8';
      let bouncesLeft = 6;
      let radius = 13;

      if (currentType === 'explosive') {
        color = '#ef4444';
        radius = 15;
      } else if (currentType === 'piercing') {
        color = '#a855f7';
        radius = 12;
      } else if (currentType === 'bounce') {
        color = '#22c55e';
        bouncesLeft = 12;
      } else if (currentType === 'rainbow') {
        color = '#f59e0b';
        radius = 16;
      } else if (currentType === 'electric') {
        color = '#06b6d4';
        radius = 13;
      }

      this.projectiles.push({
        id: 'proj_' + Math.random(),
        x: spawnX,
        y: spawnY,
        vx: Math.cos(this.cannonAngle) * speed,
        vy: Math.sin(this.cannonAngle) * speed,
        radius,
        type: currentType,
        bouncesLeft,
        maxBounces: bouncesLeft,
        piercedCount: 0,
        isExpired: false,
        color,
        trail: [],
      });
    }
  }

  // Main Loop
  private loop = (timestamp: number) => {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;

    if (!this.isPaused) {
      this.update(dt);
    }
    this.render();

    this.animFrameId = requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    this.animTime += dt;
    if (this.cannonRecoil > 0) this.cannonRecoil = Math.max(0, this.cannonRecoil - 26 * dt);
    if (this.cannonVibrate > 0) this.cannonVibrate = Math.max(0, this.cannonVibrate - 35 * dt);
    if (this.shootCooldownTimer > 0) this.shootCooldownTimer = Math.max(0, this.shootCooldownTimer - dt);

    this.updateBalloonGroup(dt);
    this.updateObstacles(dt);
    this.updateProjectiles(dt);
    this.updateDroppedItems(dt);
    this.updatePrizeBoxes(dt);
    this.updateParticles(dt);
    this.checkGameConditions();
  }

  // INTEGRATED MOTION OF BALLOON_GROUP (MONKEY + ALL BALLOONS AS ONE ENTITY)
  private updateBalloonGroup(dt: number) {
    if (this.monkeyState === 'falling') {
      // Falling monkey after all balloons popped
      this.groupY += 290 * dt;
      if (this.groupY >= 660) {
        this.groupY = 660;
        this.monkeyState = 'crying';
        soundManager.playWin();

        // Award +1 life gift upon completing the level (max 5 lives)
        if (this.lives < 5) {
          this.lives = Math.min(5, this.lives + 1);
          this.callbacks.onLivesUpdate(this.lives);
          this.addFloatingText('+1 ❤️ VIDA EXTRA', this.cannonX, this.cannonY - 45, '#ec4899');
        }

        setTimeout(() => {
          this.callbacks.onLevelWin(this.score, this.totalBalloonsPoppedGame);
        }, 1200);
      }
      return;
    }

    if (this.monkeyState === 'crying' || this.monkeyState === 'taunting') return;

    // Sway oscillation of the unified structure
    this.groupSway += dt * 2.5;
    this.groupX += this.groupVx * 60 * dt;

    // Side bouncing bounds for the entire group
    if (this.groupX < 120) {
      this.groupX = 120;
      this.groupVx = Math.abs(this.groupVx);
    } else if (this.groupX > this.width - 120) {
      this.groupX = this.width - 120;
      this.groupVx = -Math.abs(this.groupVx);
    }

    // Ratio of remaining balloons
    const remainingBalloons = this.balloons.filter((b) => !b.isPopped).length;
    const ratio = remainingBalloons / Math.max(1, this.totalBalloonsInLevel);

    // Group descends slightly when few balloons remain
    this.groupBaseY = 230 + (1 - ratio) * 50;
    this.groupY = this.groupBaseY + Math.sin(this.groupSway) * 7;

    // Update positions of ALL balloons in the integrated structure
    this.balloons.forEach((b) => {
      if (!b.isPopped) {
        const offset = this.balloonOffsets.get(b.id);
        if (offset) {
          const swayX = Math.sin(this.groupSway + offset.swayPhase) * 3;
          const swayY = Math.cos(this.groupSway + offset.swayPhase) * 2;

          b.x = this.groupX + offset.relX + swayX;
          b.y = this.groupY + offset.relY + swayY;
        }
      }
    });

    if (ratio < 0.35) {
      this.monkeyState = 'worried';
    } else {
      this.monkeyState = 'swinging';
    }

    // ACTIVE & AGGRESSIVE MONKEY ATTACK SEQUENCE
    this.monkeyDropTimer -= dt;
    if (this.monkeyDropTimer <= 0.45 && this.monkeyAttackState === 'idle') {
      // Wind-up: prepare item in hand
      this.monkeyAttackState = 'preparing';
      const items = this.level.monkeyAllowedItems;
      this.itemSequenceIndex = (this.itemSequenceIndex + 1) % items.length;
      this.monkeyNextItemType = items[this.itemSequenceIndex];
    }

    if (this.monkeyDropTimer <= 0) {
      this.monkeyDropTimer = this.level.monkeyDropInterval * (0.85 + Math.random() * 0.3);
      this.dropMonkeyItem();
      this.monkeyAttackState = 'idle';
    }
  }

  // Launch item with unique trajectory and physical characteristics
  private dropMonkeyItem() {
    if (this.isLevelWon || this.isGameOver) return;
    const type = this.monkeyNextItemType;

    // Fling from monkey's throwing hand
    const handX = this.groupX + (this.groupVx > 0 ? 45 : -45);
    const handY = this.groupY + 30;

    let vx = (Math.random() - 0.5) * 80;
    let vy = 110;
    let radius = 26;

    if (type === 'rock') {
      vy = 180; // Heavy ballistic plunge
      radius = 28;
    } else if (type === 'coconut') {
      vy = 160; // Fast dense drop
      radius = 27;
    } else if (type === 'bomb') {
      vx = (Math.random() - 0.5) * 90;
      vy = 95; // Arched lob
      radius = 29;
    } else if (type === 'banana') {
      vx = (Math.random() - 0.5) * 120;
      vy = 100;
      radius = 26;
    } else if (type === 'boomerang') {
      vx = this.groupX > this.cannonX ? -110 : 110;
      vy = 85;
      radius = 28;
    } else if (type === 'orange') {
      vy = 120;
      radius = 26;
    }

    this.droppedItems.push({
      id: 'item_' + Math.random(),
      x: handX,
      y: handY,
      vx,
      vy,
      radius,
      type,
      rotation: 0,
      rotSpeed: (Math.random() - 0.5) * 6,
    });
  }

  private updateObstacles(dt: number) {
    this.obstacles.forEach((o) => {
      if (o.moving && o.minX !== undefined && o.maxX !== undefined) {
        o.x += (o.vx || 1) * 60 * dt;
        if (o.x < o.minX) {
          o.x = o.minX;
          o.vx = Math.abs(o.vx || 1);
        } else if (o.x > o.maxX) {
          o.x = o.maxX;
          o.vx = -Math.abs(o.vx || 1);
        }
      }
    });
  }

  private updateProjectiles(dt: number) {
    const gravity = 0.18;

    this.projectiles.forEach((p) => {
      if (p.isExpired) return;

      p.x += p.vx;
      p.y += p.vy;
      p.vy += gravity;

      p.trail.push({ x: p.x, y: p.y, alpha: 1.0 });
      if (p.trail.length > 8) p.trail.shift();
      p.trail.forEach((t) => (t.alpha -= 0.12));

      // Side wall bounces
      if (p.x - p.radius <= 0) {
        p.x = p.radius;
        p.vx = -p.vx * 0.92;
        p.bouncesLeft--;
        soundManager.playBounce();
        this.addSparkParticles(p.x, p.y, p.color);
      } else if (p.x + p.radius >= this.width) {
        p.x = this.width - p.radius;
        p.vx = -p.vx * 0.92;
        p.bouncesLeft--;
        soundManager.playBounce();
        this.addSparkParticles(p.x, p.y, p.color);
      }

      // Ceiling bounce
      if (p.y - p.radius <= 0) {
        p.y = p.radius;
        p.vy = -p.vy * 0.92;
        p.bouncesLeft--;
        soundManager.playBounce();
        this.addSparkParticles(p.x, p.y, p.color);
      }

      // Ground or expiry
      if (p.y + p.radius >= 745 || p.bouncesLeft <= 0) {
        p.isExpired = true;
      }

      // Obstacle collisions (Real physical reflection & bounce)
      this.obstacles.forEach((o) => {
        const res = PhysicsUtils.checkCircleAABBCollision(p, o);
        if (res.collided) {
          const normal = { x: res.normalX, y: res.normalY };
          const reflected = PhysicsUtils.reflectVector({ x: p.vx, y: p.vy }, normal, o.bounceFactor);
          p.vx = reflected.x;
          p.vy = reflected.y;
          p.bouncesLeft--;
          soundManager.playBounce();
          this.addSparkParticles(p.x, p.y, o.type === 'metal' ? '#e2e8f0' : o.type === 'bumper' ? '#ec4899' : '#f59e0b');
        }
      });

      // Balloon collisions
      this.balloons.forEach((b) => {
        if (b.isPopped) return;
        const dist = PhysicsUtils.distance(p, b);
        if (dist <= p.radius + b.radius) {
          this.handleBalloonHit(b, p);
        }
      });

      // Collision with BIG Prize Chest boxes
      this.prizeBoxes.forEach((box) => {
        if (box.isCollected) return;
        const boxCenter = { x: box.x, y: box.y };
        if (PhysicsUtils.distance(p, boxCenter) <= p.radius + box.width / 2) {
          box.isCollected = true;
          soundManager.playPowerUpCollect();

          const countToAdd = box.powerUp === 'rainbow' ? 1 : 2;
          this.inventory[box.powerUp] += countToAdd;
          // Note: Power-Ups do NOT activate automatically upon collection.
          // Player chooses and activates them from the bottom bar.

          this.addExplosionParticles(box.x, box.y);
          this.addFloatingText(`+${countToAdd} ${box.powerUp.toUpperCase()}`, box.x, box.y, '#4ade80');
          this.callbacks.onInventoryUpdate(this.inventory);
        }
      });

      // MID-AIR INTERCEPTION OF DROPPED ITEMS (Active defense!)
      this.droppedItems.forEach((item) => {
        if (item.y > this.height) return;
        const dist = PhysicsUtils.distance(p, item);
        if (dist <= p.radius + item.radius) {
          item.y = this.height + 200; // neutralize
          soundManager.playBalloonPop();
          if (item.type === 'bomb') {
            this.addExplosionParticles(item.x, item.y);
            this.addFloatingText('¡BOMBA DESARMADA! +100', item.x, item.y, '#facc15');
            this.score += 100;
          } else {
            this.addSparkParticles(item.x, item.y, '#facc15');
            this.addFloatingText('¡INTERCEPTADO! +50', item.x, item.y, '#4ade80');
            this.score += 50;
          }
          this.callbacks.onScoreUpdate(this.score);
          p.isExpired = true;
        }
      });
    });

    this.projectiles = this.projectiles.filter((p) => !p.isExpired);
  }

  private handleBalloonHit(b: Balloon, p: Projectile) {
    let damage = 1;

    if (p.type === 'rainbow') damage = 3;
    if (p.type === 'piercing') damage = 2;
    if (p.type === 'explosive') {
      damage = 3;
      this.triggerExplosion(p.x, p.y, 85);
    }
    if (p.type === 'electric') {
      this.triggerElectricChain(b);
    }

    b.hp -= damage;

    if (b.hp <= 0) {
      b.isPopped = true;
      this.balloonsPoppedInLevel++;
      this.totalBalloonsPoppedGame++;
      this.score += b.type === 'heavy' ? 80 : b.type === 'reinforced' ? 50 : 30;

      soundManager.playBalloonPop();
      this.addBalloonPopParticles(b.x, b.y, b.color);
      this.addFloatingText(`+${b.type === 'heavy' ? 80 : b.type === 'reinforced' ? 50 : 30}`, b.x, b.y, '#fde047');

      // Drop Prize Box ONLY if Star Prize Balloon!
      if (b.hasPrize || b.type === 'prize') {
        this.dropPrizeBox(b.x, b.y);
      }

      this.callbacks.onScoreUpdate(this.score);
      this.callbacks.onBalloonsUpdate(this.totalBalloonsInLevel - this.balloonsPoppedInLevel, this.totalBalloonsInLevel);
    } else {
      soundManager.playBalloonHit();
      this.addSparkParticles(b.x, b.y, '#ffffff');
      this.addFloatingText(`-1 HP (${b.hp}/${b.maxHp})`, b.x, b.y, '#38bdf8');
    }

    if (p.type !== 'piercing' && p.type !== 'rainbow') {
      p.isExpired = true;
    }
  }

  private triggerExplosion(x: number, y: number, radius: number) {
    soundManager.playBalloonPop();
    this.addExplosionParticles(x, y);

    this.balloons.forEach((b) => {
      if (b.isPopped) return;
      const dist = PhysicsUtils.distance({ x, y }, b);
      if (dist <= radius) {
        b.hp = 0;
        b.isPopped = true;
        this.balloonsPoppedInLevel++;
        this.totalBalloonsPoppedGame++;
        this.score += 150;

        this.addBalloonPopParticles(b.x, b.y, b.color);
        this.addFloatingText('+150', b.x, b.y, '#f87171');

        if (b.hasPrize || b.type === 'prize') this.dropPrizeBox(b.x, b.y);
      }
    });

    this.callbacks.onScoreUpdate(this.score);
    this.callbacks.onBalloonsUpdate(this.totalBalloonsInLevel - this.balloonsPoppedInLevel, this.totalBalloonsInLevel);
  }

  private triggerElectricChain(startBalloon: Balloon) {
    const chainTargets = [startBalloon];
    this.balloons.forEach((b) => {
      if (!b.isPopped && b.id !== startBalloon.id) {
        const dist = PhysicsUtils.distance(startBalloon, b);
        if (dist <= 95) {
          chainTargets.push(b);
        }
      }
    });

    chainTargets.forEach((b) => {
      b.hp = 0;
      b.isPopped = true;
      this.balloonsPoppedInLevel++;
      this.totalBalloonsPoppedGame++;
      this.score += 120;
      this.addSparkParticles(b.x, b.y, '#06b6d4');
      this.addFloatingText('⚡ +120', b.x, b.y, '#38bdf8');
      if (b.hasPrize || b.type === 'prize') this.dropPrizeBox(b.x, b.y);
    });

    this.callbacks.onScoreUpdate(this.score);
    this.callbacks.onBalloonsUpdate(this.totalBalloonsInLevel - this.balloonsPoppedInLevel, this.totalBalloonsInLevel);
  }

  // SPAWN BIG, CLEARLY VISIBLE PRIZE CHEST BOX (Requirement 14)
  private dropPrizeBox(x: number, y: number) {
    const powerUps: PowerUpType[] = ['explosive', 'triple', 'piercing', 'bounce', 'rainbow', 'electric'];
    const chosen = powerUps[Math.floor(Math.random() * powerUps.length)];

    this.prizeBoxes.push({
      id: 'box_' + Math.random(),
      x,
      y,
      vy: 95, // Graceful visible descent
      width: 70, // Increased from 52
      height: 65, // Increased from 48
      powerUp: chosen,
      isCollected: false,
    });
  }

  private updatePrizeBoxes(dt: number) {
    this.prizeBoxes.forEach((box) => {
      box.y += box.vy * dt;
    });
    this.prizeBoxes = this.prizeBoxes.filter((b) => !b.isCollected && b.y < 740);
  }

  // DISTINCT PHYSICS FOR DROPPED ITEMS (Requirement 11)
  private updateDroppedItems(dt: number) {
    this.droppedItems.forEach((item) => {
      if (item.type === 'banana') {
        // Curved aerodynamic sine sweep
        item.x += Math.sin(this.animTime * 5 + item.id.length) * 110 * dt;
        item.vy += 35 * dt;
      } else if (item.type === 'boomerang') {
        // Curve downward and sweep horizontally across playfield
        item.vx += (this.groupX < this.cannonX ? -110 : 110) * dt;
      } else if (item.type === 'rock' || item.type === 'coconut') {
        item.vy += 95 * dt; // Rapid gravity acceleration
      }

      item.x += item.vx * dt;
      item.y += item.vy * dt;
      item.rotation += item.rotSpeed * dt;

      // Sizzling sparks on falling bomb
      if (item.type === 'bomb' && Math.random() < 0.35) {
        this.particles.push({
          x: item.x,
          y: item.y - 10,
          vx: (Math.random() - 0.5) * 50,
          vy: -Math.random() * 40,
          radius: 2.5,
          color: Math.random() < 0.5 ? '#f59e0b' : '#ef4444',
          alpha: 1,
          life: 0,
          maxLife: 0.25,
        });
      }

      // Check collision with Cannon hitbox (Cannon at Y = 675)
      const dist = PhysicsUtils.distance({ x: item.x, y: item.y }, { x: this.cannonX, y: this.cannonY });
      if (dist <= item.radius + 45) {
        this.lives--;
        this.cannonVibrate = 24;
        soundManager.playCannonHit();

        if (item.type === 'bomb') {
          this.addExplosionParticles(this.cannonX, this.cannonY - 10);
          this.addFloatingText('¡EXPLOSIÓN -1 ❤️!', this.cannonX, this.cannonY - 45, '#ef4444');
        } else if (item.type === 'coconut') {
          this.addSparkParticles(this.cannonX, this.cannonY, '#78350f');
          this.addFloatingText('¡COCOAZO -1 ❤️!', this.cannonX, this.cannonY - 45, '#ea580c');
        } else {
          this.addSparkParticles(this.cannonX, this.cannonY - 10, '#ffffff');
          this.addFloatingText('¡DAÑO -1 ❤️!', this.cannonX, this.cannonY - 45, '#ef4444');
        }

        this.callbacks.onLivesUpdate(this.lives);
        item.y = this.height + 100;
      }
    });

    this.droppedItems = this.droppedItems.filter((i) => i.y < 750);
  }

  private checkGameConditions() {
    if (this.isGameOver || this.isLevelWon) return;

    const activeBalloons = this.balloons.filter((b) => !b.isPopped);

    // Trigger Win & Falling sequence when all balloons are popped
    if (activeBalloons.length === 0 && this.monkeyState !== 'falling' && this.monkeyState !== 'crying') {
      this.isLevelWon = true;
      this.monkeyState = 'falling';
      return;
    }

    if (this.lives <= 0) {
      this.isGameOver = true;
      this.monkeyState = 'taunting';
      soundManager.playGameOver();
      setTimeout(() => {
        this.callbacks.onGameOver(this.score, this.level.id);
      }, 1000);
    }
  }

  private addSparkParticles(x: number, y: number, color: string) {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 180,
        vy: (Math.random() - 0.5) * 180,
        radius: 2 + Math.random() * 3,
        color,
        alpha: 1,
        life: 0,
        maxLife: 0.35 + Math.random() * 0.2,
      });
    }
  }

  private addBalloonPopParticles(x: number, y: number, colorKey: string) {
    const colorMap: { [k: string]: string } = {
      red: '#ef4444',
      blue: '#3b82f6',
      green: '#22c55e',
      yellow: '#eab308',
      purple: '#a855f7',
      orange: '#f97316',
      cyan: '#06b6d4',
      pink: '#ec4899',
      gold: '#f59e0b',
    };
    const color = colorMap[colorKey] || '#3b82f6';

    for (let i = 0; i < 14; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 230,
        vy: (Math.random() - 0.5) * 230,
        radius: 3 + Math.random() * 4,
        color,
        alpha: 1,
        life: 0,
        maxLife: 0.45 + Math.random() * 0.25,
      });
    }
  }

  private addExplosionParticles(x: number, y: number) {
    for (let i = 0; i < 22; i++) {
      const colors = ['#f59e0b', '#ef4444', '#facc15', '#ea580c'];
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 320,
        vy: (Math.random() - 0.5) * 320,
        radius: 4 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 0,
        maxLife: 0.55 + Math.random() * 0.3,
      });
    }
  }

  private addFloatingText(text: string, x: number, y: number, color: string = '#fde047') {
    this.floatingTexts.push({
      id: 'ft_' + Math.random(),
      text,
      x,
      y,
      vy: -55,
      alpha: 1,
      color,
      size: 16,
      life: 0,
      maxLife: 0.85,
    });
  }

  private updateParticles(dt: number) {
    this.particles.forEach((p) => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life += dt;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);
    });
    this.particles = this.particles.filter((p) => p.life < p.maxLife);

    this.floatingTexts.forEach((ft) => {
      ft.y += ft.vy * dt;
      ft.life += dt;
      ft.alpha = Math.max(0, 1 - ft.life / ft.maxLife);
    });
    this.floatingTexts = this.floatingTexts.filter((ft) => ft.life < ft.maxLife);
  }

  // STRICT LAYER RENDERING ORDER WITH VIBRANT COLOR & VISUAL DEPTH
  public render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. BACKGROUND LAYER (Full 9:16 Canvas coverage, no solid black cutoff!)
    assetManager.drawAsset(ctx, 'backgrounds.jungle', 0, 0, this.width, this.height);

    // Subtle atmospheric vignette
    const vignGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    vignGrad.addColorStop(0, 'rgba(15, 23, 42, 0.25)');
    vignGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
    vignGrad.addColorStop(1, 'rgba(15, 23, 42, 0.35)');
    ctx.fillStyle = vignGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. SCENARIO OBSTACLES (High contrast, clearly visible in airspace)
    this.renderObstacles();

    // 3. BACK BALLOONS (Layer 1)
    this.renderBalloonsLayer(false);

    // 4. BALLOON ROPES & STRINGS (Converging to Monkey's holding hand)
    this.renderBalloonStrings();

    // 5. FRONT BALLOONS (Layer 2)
    this.renderBalloonsLayer(true);

    // 6. MONKEY (Center anchor of cluster, Large & Suspended with attack states)
    this.renderMonkey();

    // 7. BIG PRIZE CHESTS & DROPPED DANGER ITEMS
    this.renderPrizeBoxes();
    this.renderDroppedItems();

    // 8. AIM TRAJECTORY GUIDE (Vibrant glowing celestial dots)
    this.renderAimGuide();

    // 9. STYLIZED STONE PEDESTAL UNDER CANNON (Natural integrated platform, no black cut-off band)
    this.renderGroundPlatform();

    // 10. CANNON (Prominent 135x135px, Lowered at X = 330, Y = 675, with Reload Ring)
    this.renderCannon();

    // 11. PROJECTILES (Traversing airspace)
    this.renderProjectiles();

    // 12. PARTICLES & FLOATING TEXTS
    this.renderParticles();
  }

  // Natural Ancient Temple Pedestal for the Cannon (Eliminates the extra bottom zone!)
  private renderGroundPlatform() {
    const ctx = this.ctx;
    ctx.save();

    // Cannon is at Y = 675, base at Y = 742
    const ledgeY = 735;
    const ledgeLeft = Math.max(160, this.cannonX - 95);
    const ledgeRight = Math.min(this.width - 20, this.cannonX + 95);
    const ledgeW = ledgeRight - ledgeLeft;

    // Stylized Carved Stone Pedestal
    const stoneGrad = ctx.createLinearGradient(0, ledgeY, 0, ledgeY + 32);
    stoneGrad.addColorStop(0, '#334155');
    stoneGrad.addColorStop(0.3, '#1e293b');
    stoneGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = stoneGrad;

    ctx.beginPath();
    ctx.roundRect(ledgeLeft, ledgeY, ledgeW, 28, [8, 8, 4, 4]);
    ctx.fill();

    // Golden engraved rim
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Top gold highlight
    ctx.fillStyle = '#fde047';
    ctx.fillRect(ledgeLeft + 4, ledgeY + 1, ledgeW - 8, 2);

    // Decorative carved masonry lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1.5;
    for (let x = ledgeLeft + 25; x < ledgeRight - 15; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, ledgeY + 5);
      ctx.lineTo(x, ledgeY + 24);
      ctx.stroke();
    }

    // Glowing subtle movement arrows
    const arrowY = ledgeY + 14;
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const pulse = Math.sin(this.animTime * 5) * 3;
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 6;
    ctx.fillText('◀', this.cannonX - 75 - pulse, arrowY);
    ctx.fillText('▶', this.cannonX + 75 + pulse, arrowY);

    ctx.restore();
  }

  // HIGH-CONTRAST, HIGHLY VISIBLE OBSTACLES (Requirement 12 & 13)
  private renderObstacles() {
    const ctx = this.ctx;
    this.obstacles.forEach((o) => {
      ctx.save();
      if (o.type === 'metal') {
        // High-contrast steel barrier with hazard stripes
        ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;

        // Base metallic plate
        const metGrad = ctx.createLinearGradient(o.x, o.y, o.x, o.y + o.height);
        metGrad.addColorStop(0, '#94a3b8');
        metGrad.addColorStop(0.4, '#475569');
        metGrad.addColorStop(1, '#1e293b');
        ctx.fillStyle = metGrad;
        ctx.beginPath();
        ctx.roundRect(o.x, o.y, o.width, o.height, 6);
        ctx.fill();

        // Diagonal Warning Hazard Stripes (Yellow & Dark Slate)
        ctx.save();
        ctx.clip();
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 6;
        for (let sx = o.x - 30; sx < o.x + o.width + 30; sx += 14) {
          ctx.beginPath();
          ctx.moveTo(sx, o.y + o.height);
          ctx.lineTo(sx + 14, o.y);
          ctx.stroke();
        }
        ctx.restore();

        // Shiny steel frame & bolts
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(o.x + 5, o.y + o.height / 2, 2.5, 0, Math.PI * 2);
        ctx.arc(o.x + o.width - 5, o.y + o.height / 2, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (o.type === 'bumper') {
        // Neon Pulsing Bumper
        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = 14;
        const bumpGrad = ctx.createLinearGradient(o.x, o.y, o.x, o.y + o.height);
        bumpGrad.addColorStop(0, '#f472b6');
        bumpGrad.addColorStop(0.5, '#db2777');
        bumpGrad.addColorStop(1, '#831843');
        ctx.fillStyle = bumpGrad;
        ctx.strokeStyle = '#fdf2f8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(o.x, o.y, o.width, o.height, 10);
        ctx.fill();
        ctx.stroke();

        // Center glowing energy stripe
        ctx.fillStyle = '#fbcfe8';
        ctx.fillRect(o.x + 8, o.y + o.height / 2 - 2, o.width - 16, 4);
      } else {
        // Sturdy Oak Wooden Plank with Brass Brackets
        ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;

        const woodGrad = ctx.createLinearGradient(o.x, o.y, o.x, o.y + o.height);
        woodGrad.addColorStop(0, '#d97706');
        woodGrad.addColorStop(0.3, '#b45309');
        woodGrad.addColorStop(1, '#78350f');
        ctx.fillStyle = woodGrad;
        ctx.beginPath();
        ctx.roundRect(o.x, o.y, o.width, o.height, 6);
        ctx.fill();

        // Top bevel highlight
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(o.x + 4, o.y + 1, o.width - 8, 2);

        // Brass corner braces
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(o.x, o.y, 6, o.height);
        ctx.fillRect(o.x + o.width - 6, o.y, 6, o.height);

        // Golden rim outline
        ctx.strokeStyle = '#fcd34d';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Brass rivets
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(o.x + 3, o.y + o.height / 2, 1.5, 0, Math.PI * 2);
        ctx.arc(o.x + o.width - 3, o.y + o.height / 2, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  private renderBalloonStrings() {
    if (this.monkeyState === 'falling' || this.monkeyState === 'crying') return;

    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.9)';
    ctx.lineWidth = 2.0;

    const monkeyHandX = this.groupX - 25;
    const monkeyHandY = this.groupY - 55;

    this.balloons.forEach((b) => {
      if (!b.isPopped) {
        ctx.beginPath();
        ctx.moveTo(b.x, b.y + b.radius * 0.7);
        ctx.quadraticCurveTo(
          (b.x + monkeyHandX) / 2 + Math.sin(this.groupSway) * 6,
          (b.y + monkeyHandY) / 2,
          monkeyHandX,
          monkeyHandY
        );
        ctx.stroke();
      }
    });
    ctx.restore();
  }

  private renderBalloonsLayer(isFrontLayer: boolean) {
    const ctx = this.ctx;

    this.balloons.forEach((b) => {
      if (b.isPopped) return;
      const offset = this.balloonOffsets.get(b.id);
      if (!offset || offset.isFront !== isFrontLayer) return;

      const isPrize = b.hasPrize || b.type === 'prize';
      let key = `balloons.${b.color}`;

      if (isPrize) {
        // STAR BALLOON = POWER-UP REWARD!
        if (b.color === 'red') key = 'balloons.star_red';
        else if (b.color === 'blue') key = 'balloons.star_blue';
        else if (b.color === 'green') key = 'balloons.star_green';
        else key = 'balloons.star_purple';

        // Radiant Golden Aura around Star Prize Balloons
        ctx.save();
        const auraRadius = b.radius + 5 + Math.sin(this.animTime * 5 + offset.swayPhase) * 3;
        const auraGrad = ctx.createRadialGradient(b.x, b.y, b.radius * 0.8, b.x, b.y, auraRadius);
        auraGrad.addColorStop(0, 'rgba(250, 204, 21, 0.5)');
        auraGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, auraRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.save();
      // Draw Sliced Balloon Sprite
      assetManager.drawAsset(ctx, key, b.x - b.radius, b.y - b.radius, b.radius * 2, b.radius * 2);

      // Glossy 3D Highlight Reflection
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.beginPath();
      ctx.ellipse(b.x - b.radius * 0.35, b.y - b.radius * 0.35, b.radius * 0.3, b.radius * 0.18, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      // Visual Armor Bands for Resistant Balloons
      if (b.type === 'reinforced') {
        // Metallic Silver/Gold Reinforced Ring
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(b.x, b.y, b.radius * 0.92, b.radius * 0.38, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(b.x - b.radius * 0.6, b.y, 2, 0, Math.PI * 2);
        ctx.arc(b.x + b.radius * 0.6, b.y, 2, 0, Math.PI * 2);
        ctx.arc(b.x, b.y + b.radius * 0.3, 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (b.type === 'heavy') {
        // Heavy Studded Titanium Dark Steel Band
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(b.x, b.y, b.radius * 0.95, b.radius * 0.45, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(b.x - b.radius * 0.6, b.y, 2.5, 0, Math.PI * 2);
        ctx.arc(b.x + b.radius * 0.6, b.y, 2.5, 0, Math.PI * 2);
        ctx.arc(b.x, b.y + b.radius * 0.35, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Damage cracks for reinforced / heavy balloons when damaged
      if ((b.type === 'heavy' || b.type === 'reinforced') && b.hp < b.maxHp) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(b.x - 9, b.y - 6);
        ctx.lineTo(b.x - 2, b.y + 1);
        ctx.lineTo(b.x + 3, b.y - 5);
        ctx.lineTo(b.x + 8, b.y + 4);
        ctx.stroke();

        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.restore();
    });
  }

  // RENDER MONKEY & ATTACK ANIMATION (Requirement 8, 9, 10)
  private renderMonkey() {
    const ctx = this.ctx;
    let monkeyKey = 'monkey.swinging_0';

    if (this.monkeyState === 'swinging') {
      const frame = Math.floor(this.animTime * 4) % 4;
      monkeyKey = `monkey.swinging_${frame}`;
    } else if (this.monkeyState === 'worried') {
      monkeyKey = 'monkey.worried';
    } else if (this.monkeyState === 'falling') {
      monkeyKey = 'monkey.falling';
    } else if (this.monkeyState === 'crying') {
      monkeyKey = 'monkey.crying';
    } else if (this.monkeyState === 'taunting') {
      monkeyKey = 'monkey.taunting';
    }

    ctx.save();
    assetManager.drawAsset(
      ctx,
      monkeyKey,
      this.groupX - this.monkeyWidth / 2,
      this.groupY - this.monkeyHeight / 2,
      this.monkeyWidth,
      this.monkeyHeight
    );

    // Render prepared item in monkey's free throwing hand (Enlarged 44x44)
    if (this.monkeyAttackState === 'preparing' && this.monkeyState === 'swinging') {
      const handX = this.groupX + (this.groupVx > 0 ? 45 : -45);
      const handY = this.groupY + 30;

      // Glow effect around weapon in hand
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 10;
      assetManager.drawAsset(ctx, `items.${this.monkeyNextItemType}`, handX - 22, handY - 22, 44, 44);
    }

    ctx.restore();
  }

  // RENDER BIG PRIZE CHESTS (Requirement 14)
  private renderPrizeBoxes() {
    const ctx = this.ctx;
    this.prizeBoxes.forEach((box) => {
      ctx.save();
      // Glowing golden aura around falling prize chest
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 16;
      assetManager.drawAsset(ctx, 'items.prizebox', box.x - box.width / 2, box.y - box.height / 2, box.width, box.height);
      ctx.restore();
    });
  }

  // Render Dropped Items with Distinct Visual Danger Effects (Enlarged & High Visibility)
  private renderDroppedItems() {
    const ctx = this.ctx;
    this.droppedItems.forEach((item) => {
      ctx.save();

      // Ground hazard warning indicator for dangerous Bomb
      if (item.type === 'bomb') {
        const groundY = 735;
        const pulse = Math.sin(this.animTime * 10) * 4;
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(item.x, groundY, 26 + pulse, 7, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚠️ PELIGRO', item.x, groundY - 10);
      }

      ctx.translate(item.x, item.y);
      ctx.rotate(item.rotation);

      // Distinct high-contrast aura per item type
      ctx.shadowColor =
        item.type === 'bomb'
          ? '#ef4444'
          : item.type === 'banana'
          ? '#eab308'
          : item.type === 'boomerang'
          ? '#38bdf8'
          : item.type === 'coconut'
          ? '#854d0e'
          : '#fb923c';
      ctx.shadowBlur = 14;

      assetManager.drawAsset(
        ctx,
        `items.${item.type}`,
        -item.radius,
        -item.radius,
        item.radius * 2,
        item.radius * 2
      );

      ctx.restore();
    });
  }

  // Glowing Celestial Aiming Trajectory Guide
  private renderAimGuide() {
    if (this.isLevelWon || this.isGameOver) return;
    const ctx = this.ctx;

    const tipDistance = 75; // For 135px cannon
    const points = PhysicsUtils.calculateAimTrajectory(
      this.cannonX + Math.cos(this.cannonAngle) * tipDistance,
      this.cannonY + Math.sin(this.cannonAngle) * tipDistance,
      this.cannonAngle,
      15,
      { width: this.width, height: this.height }
    );

    ctx.save();
    points.forEach((p, idx) => {
      const alpha = Math.max(0.2, 0.95 - (idx / points.length) * 0.7);
      const radius = Math.max(2.5, 6 - idx * 0.16);

      ctx.shadowColor = idx < 8 ? '#38bdf8' : '#fde047';
      ctx.shadowBlur = 6;
      ctx.fillStyle = idx < 8 ? `rgba(56, 189, 248, ${alpha})` : `rgba(254, 240, 138, ${alpha})`;

      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Reticle at end of trajectory
    if (points.length > 0) {
      const lastP = points[points.length - 1];
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(lastP.x, lastP.y, 8, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  // CANNON RENDERING (Prominent 135x135px, Lowered at X = 330, Y = 675, with Reload Cooldown Arc)
  private renderCannon() {
    const ctx = this.ctx;
    const vibrX = this.cannonVibrate > 0 ? (Math.random() - 0.5) * this.cannonVibrate : 0;
    const vibrY = this.cannonVibrate > 0 ? (Math.random() - 0.5) * this.cannonVibrate : 0;

    let cannonState = 'cannon.center';

    if (this.lives <= 1) {
      cannonState = 'cannon.damaged';
    } else if (this.cannonAngle < -Math.PI * 0.56) {
      cannonState = 'cannon.left';
    } else if (this.cannonAngle > -Math.PI * 0.44) {
      cannonState = 'cannon.right';
    }

    ctx.save();
    const recoilOffsetY = Math.sin(this.cannonAngle) * this.cannonRecoil;
    const recoilOffsetX = Math.cos(this.cannonAngle) * this.cannonRecoil;

    // Pivot at base of carriage/wheels
    const pivotX = this.cannonX + vibrX + recoilOffsetX;
    const pivotY = this.cannonY + vibrY + recoilOffsetY + 32;

    ctx.translate(pivotX, pivotY);

    // Smooth subtle rotational lean following the aiming angle
    let baseSlant = -Math.PI / 2;
    if (cannonState === 'cannon.left') baseSlant = -Math.PI * 0.65;
    else if (cannonState === 'cannon.right') baseSlant = -Math.PI * 0.35;

    const rotDelta = Math.max(-0.35, Math.min(0.35, this.cannonAngle - baseSlant));
    ctx.rotate(rotDelta);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 12;

    assetManager.drawAsset(
      ctx,
      cannonState,
      -this.cannonWidth / 2,
      -this.cannonHeight / 2 - 32,
      this.cannonWidth,
      this.cannonHeight
    );

    // Visual Reload Ring (Requirement 4)
    if (this.shootCooldownTimer > 0) {
      const reloadDuration = this.activePowerUp === 'normal' ? this.baseCooldown : 0.42;
      const reloadRatio = Math.min(1, Math.max(0, 1 - this.shootCooldownTimer / reloadDuration));
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.85)';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(0, -32, 28, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * reloadRatio);
      ctx.stroke();
    }

    ctx.restore();
  }

  private renderProjectiles() {
    const ctx = this.ctx;
    this.projectiles.forEach((p) => {
      ctx.save();

      // Radiant energy trail
      p.trail.forEach((t) => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, t.alpha * 0.45);
        ctx.beginPath();
        ctx.arc(t.x, t.y, p.radius * 0.75, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1.0;

      let key = 'ui.cannonball';
      if (p.type !== 'normal') {
        key = `powerups.${p.type}`;
      }

      // Glow effect for special projectile types
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 12;

      assetManager.drawAsset(ctx, key, p.x - p.radius, p.y - p.radius, p.radius * 2, p.radius * 2);

      ctx.restore();
    });
  }

  private renderParticles() {
    const ctx = this.ctx;
    this.particles.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    this.floatingTexts.forEach((ft) => {
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.fillStyle = ft.color;
      ctx.font = `black ${ft.size}px Fredoka, sans-serif`;
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 6;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });
  }
}
