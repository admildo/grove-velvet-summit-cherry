import type { SheetName } from "./sprites";

export type Atlas = Record<SheetName, HTMLImageElement[]>;

const frames: Record<SheetName, string[]> = {
  robot: ["/sprites/robot-1.png", "/sprites/robot-2.png", "/sprites/robot-3.png"],
  crash: ["/sprites/crash-1.png"],
  slime: ["/sprites/slime-1.png", "/sprites/slime-2.png", "/sprites/slime-3.png"],
  cluster: ["/sprites/cluster-1.png", "/sprites/cluster-2.png", "/sprites/cluster-3.png"],
  shipA: ["/sprites/ship-a.png"],
  shipB: ["/sprites/ship-b.png"],
  dinoA: ["/sprites/dino-a.png"],
  dinoB: ["/sprites/dino-b.png"],
};

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`sprite ${src}`));
    img.src = src;
  });
}

export async function loadAtlas(): Promise<Atlas> {
  const out = {} as Atlas;
  await Promise.all(
    (Object.keys(frames) as SheetName[]).map(async (name) => {
      out[name] = await Promise.all(frames[name].map(loadImg));
    }),
  );
  return out;
}

const cleaned = new WeakMap<HTMLImageElement, HTMLCanvasElement>();

/** Catch classic chroma magenta AND hot-pink leftover body fills (e.g. 219,2,133). */
function isMagenta(r: number, g: number, b: number, a: number) {
  if (a < 16) return true;
  // Classic sprite chroma (magenta / purple key)
  if (r > 150 && b > 150 && g < 120 && (r + b) / 2 - g > 55) return true;
  // Hot-pink / fuchsia bleed (high R, very low G, mid B)
  if (r > 180 && g < 40 && b > 90 && b < 180) return true;
  // Near-magenta edge pixels
  if (r > 200 && g < 60 && b > 120 && Math.abs(r - b) < 90) return true;
  return false;
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
  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    if (isMagenta(d[i], d[i + 1], d[i + 2], d[i + 3])) {
      d[i + 3] = 0;
    }
  }
  ctx.putImageData(imageData, 0, 0);
  cleaned.set(img, c);
  return c;
}

export type Crop = { sx: number; sy: number; sw: number; sh: number };

const cropCache = new WeakMap<HTMLImageElement, Crop>();

/** Tight bounding box of non-transparent (and non-magenta) pixels. */
export function contentCrop(img: HTMLImageElement): Crop {
  const hit = cropCache.get(img);
  if (hit) return hit;
  const src = cleanedSprite(img);
  const w = src.width;
  const h = src.height;
  const ctx = src.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    const fallback = { sx: 0, sy: 0, sw: w, sh: h };
    cropCache.set(img, fallback);
    return fallback;
  }
  const { data } = ctx.getImageData(0, 0, w, h);
  let minX = w,
    minY = h,
    maxX = 0,
    maxY = 0;
  let found = false;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const a = data[(y * w + x) * 4 + 3];
      if (a > 16) {
        found = true;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  const crop: Crop = found
    ? { sx: minX, sy: minY, sw: maxX - minX + 1, sh: maxY - minY + 1 }
    : { sx: 0, sy: 0, sw: w, sh: h };
  cropCache.set(img, crop);
  return crop;
}

export function blitCrop(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
) {
  const src = cleanedSprite(img);
  const c = contentCrop(img);
  ctx.drawImage(src, c.sx, c.sy, c.sw, c.sh, dx, dy, dw, dh);
}
