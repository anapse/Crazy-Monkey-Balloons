import { ASSET_REGISTRY, AssetDefinition, SpriteCellDef } from '../config/assets';

export function resolveAssetPath(assetPath: string): string {
  const base = import.meta.env.BASE_URL || './';
  const cleanPath = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  return `${cleanBase}${cleanPath}`;
}

type AssetStatus = 'unloaded' | 'loading' | 'loaded' | 'missing';

class AssetManagerService {
  private images: Map<string, HTMLImageElement> = new Map();
  private statusMap: Map<string, AssetStatus> = new Map();
  private dataUrlCache: Map<string, string> = new Map();

  constructor() {
    Object.keys(ASSET_REGISTRY).forEach((key) => {
      this.statusMap.set(key, 'unloaded');
    });
  }

  public getDefinition(key: string): AssetDefinition | null {
    if (ASSET_REGISTRY[key]) return ASSET_REGISTRY[key];
    const match = Object.values(ASSET_REGISTRY).find((def) => def.logicalKey === key);
    return match || null;
  }

  // Preload single sheet or image
  public loadSheet(fileName: string, fullPath: string): Promise<boolean> {
    if (this.images.has(fileName)) return Promise.resolve(true);

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.images.set(fileName, img);
        resolve(true);
      };
      img.onerror = () => {
        console.warn(`ASSET FALTANTE:\n${fullPath}`);
        resolve(false);
      };
      img.src = fullPath;
    });
  }

  // Preload all assets and sheets in parallel
  public preloadAll(): Promise<void> {
    const promises: Promise<boolean>[] = [];

    Object.values(ASSET_REGISTRY).forEach((def) => {
      if (def.path) {
        promises.push(this.loadSheet(def.logicalKey, resolveAssetPath(def.path)));
      } else if (def.cell) {
        promises.push(this.loadSheet(def.cell.fileName, resolveAssetPath(`assets/sprites/${def.cell.fileName}`)));
      }
    });

    return Promise.all(promises).then(() => {});
  }

  // Draw any asset on Canvas Context by logical key
  public drawAsset(
    ctx: CanvasRenderingContext2D,
    logicalKey: string,
    dx: number,
    dy: number,
    dw: number,
    dh: number
  ): boolean {
    const def = this.getDefinition(logicalKey);
    if (!def) return false;

    if (def.path) {
      const img = this.images.get(def.logicalKey);
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, dx, dy, dw, dh);
        return true;
      }
    } else if (def.cell) {
      return this.drawCell(ctx, def.cell, dx, dy, dw, dh);
    }

    return false;
  }

  // Draw specific cell from a sprite sheet grid
  public drawCell(
    ctx: CanvasRenderingContext2D,
    cell: SpriteCellDef,
    dx: number,
    dy: number,
    dw: number,
    dh: number
  ): boolean {
    const img = this.images.get(cell.fileName);
    if (!img || !img.complete || img.naturalWidth === 0) return false;

    const cellW = img.naturalWidth / cell.totalCols;
    const cellH = img.naturalHeight / cell.totalRows;
    const sx = cell.col * cellW;
    const sy = cell.row * cellH;

    ctx.drawImage(img, sx, sy, cellW, cellH, dx, dy, dw, dh);
    return true;
  }

  // Get Data URL of a cropped cell for HTML <img src="..."> elements
  public getSpriteDataUrl(logicalKey: string, width = 64, height = 64): string {
    if (this.dataUrlCache.has(logicalKey)) {
      return this.dataUrlCache.get(logicalKey)!;
    }

    const def = this.getDefinition(logicalKey);
    if (!def) return '';

    if (def.path) {
      return def.path;
    }

    if (def.cell) {
      const img = this.images.get(def.cell.fileName);
      if (!img || !img.complete || img.naturalWidth === 0) return '';

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        this.drawCell(ctx, def.cell, 0, 0, width, height);
        const url = canvas.toDataURL('image/png');
        this.dataUrlCache.set(logicalKey, url);
        return url;
      }
    }

    return '';
  }

  public isLoaded(logicalKey: string): boolean {
    const def = this.getDefinition(logicalKey);
    if (!def) return false;
    if (def.path) return this.images.has(def.logicalKey);
    if (def.cell) return this.images.has(def.cell.fileName);
    return false;
  }
}

export const assetManager = new AssetManagerService();
