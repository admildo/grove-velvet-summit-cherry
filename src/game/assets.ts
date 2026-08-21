export type SheetName =
  | "run"
  | "jump"
  | "crash"
  | "idle"
  | "rock"
  | "spike"
  | "slime"
  | "crawler"
  | "watcher"
  | "cluster"
  | "shipA"
  | "shipB"
  | "dinoA"
  | "dinoB";

const FILES: Record<SheetName, string[]> = {
  run: Array.from({ length: 12 }, (_, i) => `/sprites/run-${String(i + 1).padStart(2, "0")}.png`),
  jump: [
    "/sprites/jump-01.png",
    "/sprites/jump-02.png",
    "/sprites/jump-air.png",
    "/sprites/jump-03.png",
    "/sprites/jump-04.png",
    "/sprites/jump-06.png",
  ],
  crash: ["/sprites/crash-01.png"],
  idle: ["/sprites/idle-01.png"],
  rock: ["/sprites/rock-1.png", "/sprites/rock-2.png", "/sprites/rock-3.png", "/sprites/rock-4.png"],
  spike: ["/sprites/spike-1.png", "/sprites/spike-2.png", "/sprites/spike-3.png", "/sprites/spike-4.png"],
  slime: ["/sprites/slime-1.png", "/sprites/slime-2.png", "/sprites/slime-3.png", "/sprites/slime-4.png"],
  crawler: ["/sprites/crawler-1.png", "/sprites/crawler-2.png", "/sprites/crawler-3.png", "/sprites/crawler-4.png"],
  watcher: ["/sprites/watcher-1.png", "/sprites/watcher-2.png", "/sprites/watcher-3.png", "/sprites/watcher-4.png"],
  cluster: ["/sprites/cluster-1.png", "/sprites/cluster-2.png", "/sprites/cluster-3.png", "/sprites/cluster-4.png"],
  shipA: ["/sprites/bg-ship-a.png"],
  shipB: ["/sprites/bg-ship-b.png"],
  dinoA: ["/sprites/bg-dino-a.png"],
  dinoB: ["/sprites/bg-dino-b.png"],
};

export type Crop = { sx: number; sy: number; sw: number; sh: number };
export type Atlas = Record<SheetName, HTMLImageElement[]>;

const crops = new WeakMap<HTMLImageElement, Crop>();
const cleaned = new WeakMap<HTMLImageElement, HTMLCanvasElement>();

function isMagenta(r: number, g: number, b: number, a: number) {
  if (a < 16) return true;
  return r > 150 && b > 150 && g < 120 && (r + b) / 2 - g > 55;
}

/** Magenta-stripped canvas so leftover chroma never draws as a purple square. */
export function cleanedSprite(img: HTMLImageElement): HTMLCanvasElement {
  const hit = cleaned.get(img);
  if (hit) return hit;
  const w = img.naturalWidth || img.width || 1;
  const h = img.naturalHeight || img.height || 1;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    cleaned.set(img, c);
    return c;
  }
  ctx.drawImage(img, 0, 0);
  if (w < 2 || h < 2) {
    cleaned.set(img, c);
    return c;
  }
  const data = ctx.getImageData(0, 0, w, h);
  const d = data.data;
  for (let i = 0; i < d.length; i += 4) {
    if (isMagenta(d[i], d[i + 1], d[i + 2], d[i + 3])) {
      d[i] = 0;
      d[i + 1] = 0;
      d[i + 2] = 0;
      d[i + 3] = 0;
    }
  }
  ctx.putImageData(data, 0, 0);
  cleaned.set(img, c);
  return c;
}

export function contentCrop(img: HTMLImageElement): Crop {
  const cached = crops.get(img);
  if (cached) return cached;
  const src = cleanedSprite(img);
  const w = src.width;
  const h = src.height;
  const ctx = src.getContext("2d", { willReadFrequently: true });
  if (!ctx || w < 4 || h < 4) {
    const fb = { sx: 0, sy: 0, sw: Math.max(1, w), sh: Math.max(1, h) };
    crops.set(img, fb);
    return fb;
  }
  const data = ctx.getImageData(0, 0, w, h).data;
  let minX = w, minY = h, maxX = 0, maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const a = data[(y * w + x) * 4 + 3];
      if (a > 18) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  const crop =
    maxX <= minX
      ? { sx: 0, sy: 0, sw: w, sh: h }
      : { sx: minX, sy: minY, sw: maxX - minX + 1, sh: maxY - minY + 1 };
  crops.set(img, crop);
  return crop;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

export async function loadAtlas(): Promise<Atlas> {
  const entries = await Promise.all(
    (Object.keys(FILES) as SheetName[]).map(async (key) => {
      const frames = await Promise.all(FILES[key].map(loadImage));
      return [key, frames] as const;
    }),
  );
  return Object.fromEntries(entries) as Atlas;
}
