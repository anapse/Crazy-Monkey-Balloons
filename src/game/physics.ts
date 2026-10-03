export interface Point {
  x: number;
  y: number;
}

export interface Vector2D {
  x: number;
  y: number;
}

export class PhysicsUtils {
  // Distance between two points
  static distance(p1: Point, p2: Point): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Circle to Circle collision
  static checkCircleCircleCollision(
    c1: Point & { radius: number },
    c2: Point & { radius: number }
  ): boolean {
    const dist = this.distance(c1, c2);
    return dist <= c1.radius + c2.radius;
  }

  // Circle to Axis-Aligned Bounding Box (AABB) collision & bounce calculation
  static checkCircleAABBCollision(
    circle: Point & { radius: number; vx: number; vy: number },
    box: { x: number; y: number; width: number; height: number; bounceFactor?: number }
  ): { collided: boolean; normalX: number; normalY: number } {
    // Find closest point on box to circle center
    const closestX = Math.max(box.x, Math.min(circle.x, box.x + box.width));
    const closestY = Math.max(box.y, Math.min(circle.y, box.y + box.height));

    const distX = circle.x - closestX;
    const distY = circle.y - closestY;
    const distanceSq = distX * distX + distY * distY;

    if (distanceSq <= circle.radius * circle.radius) {
      // Collision detected! Determine surface normal
      let normalX = 0;
      let normalY = 0;

      const overlapLeft = circle.x + circle.radius - box.x;
      const overlapRight = box.x + box.width - (circle.x - circle.radius);
      const overlapTop = circle.y + circle.radius - box.y;
      const overlapBottom = box.y + box.height - (circle.y - circle.radius);

      const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

      if (minOverlap === overlapLeft) normalX = -1;
      else if (minOverlap === overlapRight) normalX = 1;
      else if (minOverlap === overlapTop) normalY = -1;
      else if (minOverlap === overlapBottom) normalY = 1;

      return { collided: true, normalX, normalY };
    }

    return { collided: false, normalX: 0, normalY: 0 };
  }

  // Reflect vector across a normal
  static reflectVector(v: Vector2D, normal: Vector2D, bounceDamping: number = 0.92): Vector2D {
    const dot = v.x * normal.x + v.y * normal.y;
    return {
      x: (v.x - 2 * dot * normal.x) * bounceDamping,
      y: (v.y - 2 * dot * normal.y) * bounceDamping,
    };
  }

  // Calculate aiming trajectory dots
  static calculateAimTrajectory(
    startX: number,
    startY: number,
    angleRad: number,
    power: number,
    bounds: { width: number; height: number },
    stepCount: number = 25
  ): Point[] {
    const points: Point[] = [];
    let curX = startX;
    let curY = startY;
    let vx = Math.cos(angleRad) * power;
    let vy = Math.sin(angleRad) * power;

    const gravity = 0.18;
    const radius = 6;

    for (let i = 0; i < stepCount; i++) {
      curX += vx;
      curY += vy;
      vy += gravity;

      // Wall bounces in trajectory prediction
      if (curX - radius <= 0) {
        curX = radius;
        vx = -vx * 0.9;
      } else if (curX + radius >= bounds.width) {
        curX = bounds.width - radius;
        vx = -vx * 0.9;
      }

      if (curY - radius <= 0) {
        curY = radius;
        vy = -vy * 0.9;
      }

      points.push({ x: curX, y: curY });
    }

    return points;
  }
}
