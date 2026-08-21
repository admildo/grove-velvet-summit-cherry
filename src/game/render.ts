import { cleanedSprite, contentCrop, type Atlas, type SheetName } from "./assets";
import {
  GROUND,
  H,
  PLAYER_DRAW,
  PLAYER_X,
  SPEC,
  W,
  type Obstacle,
  type ObstacleType,
  type SceneryKind,
  type Session,
} from "./engine";

type Theme = {
  skyTop: string;
  skyBot: string;
  far: string;
  mid: string;
  sun: string;
  glow: string;
  ink: string;
  inkHi: string;
  heatAccent: string;
  rail: string;
};

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
}

function lerpHex(a: string, b: string, t: number) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return [0, 1, 2].map((i) => Math.round(A[i] + (B[i] - A[i]) * t)).join(",");
}

function rgb(c: string) {
  return `rgb(${c})`;
}
function rgba(c: string, a: number) {
  return `rgba(${c},${a})`;
}

export function themeAt(heat: number): Theme {
  const stops = [
    { t: 0.0, skyTop: "#c9d6e2", skyBot: "#efe8dc", far: "#9aabbb", mid: "#6f8193", sun: "#fff1c8", glow: "#ffd98a", heatAccent: "#6d8499", rail: "#3a3a38" },
    { t: 0.28, skyTop: "#e4cba8", skyBot: "#f3d9b0", far: "#b89a72", mid: "#8d6d48", sun: "#ffc46a", glow: "#ff9a40", heatAccent: "#c4863a", rail: "#3d342c" },
    { t: 0.55, skyTop: "#d06a3c", skyBot: "#e8984c", far: "#8a4a30", mid: "#6a3220", sun: "#ff7a30", glow: "#ff5418", heatAccent: "#e04828", rail: "#3a241c" },
    { t: 0.78, skyTop: "#6e1c1c", skyBot: "#b43428", far: "#441410", mid: "#32100c", sun: "#ff3c20", glow: "#ff1808", heatAccent: "#ff3020", rail: "#2a1210" },
    { t: 1.0, skyTop: "#100304", skyBot: "#2e0808", far: "#180404", mid: "#100202", sun: "#ff1410", glow: "#ff0000", heatAccent: "#ff2018", rail: "#1a0808" },
  ];
  const t = Math.max(0, Math.min(1, heat));
  let i = 0;
  for (; i < stops.length - 1; i++) {
    if (t >= stops[i].t && t <= stops[i + 1].t) break;
  }
  if (i >= stops.length - 1) i = stops.length - 2;
  const a = stops[i];
  const b = stops[i + 1];
  const lt = (t - a.t) / (b.t - a.t || 1);
  const skyBot = lerpHex(a.skyBot, b.skyBot, lt);
  const [sr, sg, sb] = skyBot.split(",").map(Number);
  const lum = (0.299 * sr + 0.587 * sg + 0.114 * sb) / 255;
  return {
    skyTop: lerpHex(a.skyTop, b.skyTop, lt),
    skyBot,
    far: lerpHex(a.far, b.far, lt),
    mid: lerpHex(a.mid, b.mid, lt),
    sun: lerpHex(a.sun, b.sun, lt),
    glow: lerpHex(a.glow, b.glow, lt),
    heatAccent: lerpHex(a.heatAccent, b.heatAccent, lt),
    rail: lerpHex(a.rail, b.rail, lt),
    ink: lum > 0.5 ? "26,24,22" : "244,238,230",
    inkHi: lum > 0.5 ? "70,62,54" : "255,250,244",
  };
}

function ridge(ctx: CanvasRenderingContext2D, color: string, baseY: number, peak: number, span: number, offset: number) {
  ctx.fillStyle = rgb(color);
  ctx.beginPath();
  ctx.moveTo(-span, H);
  ctx.lineTo(-span, baseY);
  for (let x = -span; x < W + span; x += span) {
    const px = x - (offset % span);
    ctx.lineTo(px + span * 0.22, baseY - peak * 0.45);
    ctx.lineTo(px + span * 0.38, baseY - peak * 0.7);
    ctx.lineTo(px + span * 0.52, baseY - peak);
    ctx.lineTo(px + span * 0.7, baseY - peak * 0.55);
    ctx.lineTo(px + span, baseY);
  }
  ctx.lineTo(W + span, H);
  ctx.closePath();
  ctx.fill();
}

function pylons(ctx: CanvasRenderingContext2D, color: string, offset: number, heat: number) {
  ctx.fillStyle = rgb(color);
  const span = 220;
  const o = offset % span;
  for (let x = -span; x < W + span; x += span) {
    const px = x - o;
    const h = 38 + ((x / span) % 3) * 10;
    ctx.fillRect(px + 18, GROUND - 8 - h, 6, h);
    ctx.fillRect(px + 10, GROUND - 8 - h, 22, 4);
    if (heat > 0.4) {
      ctx.strokeStyle = rgba("255,80,50", (heat - 0.4) * 0.5);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px + 32, GROUND - 8 - h + 2);
      ctx.lineTo(px + span - 10, GROUND - 28);
      ctx.stroke();
    }
  }
}

function drawSun(ctx: CanvasRenderingContext2D, th: Theme, heat: number) {
  const x = 640 - heat * 90;
  const y = 38 + heat * 140;
  const r = Math.max(9, 15 + heat * 9 - Math.max(0, heat - 0.82) * 36);
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4.4);
  g.addColorStop(0, rgba(th.glow, 0.4 + heat * 0.22));
  g.addColorStop(1, rgba(th.glow, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r * 4.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = rgb(th.sun);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function blitCrop(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  sx = 1,
  sy = 1,
) {
  const crop = contentCrop(img);
  const cx = x + w / 2;
  const cy = y + h;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(sx, sy);
  ctx.translate(-cx, -cy);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(cleanedSprite(img), crop.sx, crop.sy, crop.sw, crop.sh, x, y, w, h);
  ctx.restore();
}

function sized(img: HTMLImageElement, drawH: number, maxW: number) {
  const c = contentCrop(img);
  const aspect = c.sw / Math.max(1, c.sh);
  const w = Math.min(maxW, drawH * aspect);
  return { w, h: drawH };
}

function frameOf(atlas: Atlas, name: SheetName, t: number, seed = 0, fps = 8) {
  const frames = atlas[name];
  const i = Math.floor(t * fps + seed * 3) % frames.length;
  return frames[i];
}

function drawObstacle(ctx: CanvasRenderingContext2D, atlas: Atlas, o: Obstacle, t: number) {
  const spec = SPEC[o.type as ObstacleType];
  const img = frameOf(atlas, o.type, t, o.seed, o.type === "crawler" ? 10 : 7);
  const dim = sized(img, spec.drawH, spec.maxW);
  blitCrop(ctx, img, o.x + (o.w - dim.w) / 2, GROUND - dim.h, dim.w, dim.h);
}

const SCENERY_SHEET: Record<SceneryKind, SheetName> = {
  shipA: "shipA",
  shipB: "shipB",
  dinoA: "dinoA",
  dinoB: "dinoB",
};

function drawScenery(ctx: CanvasRenderingContext2D, atlas: Atlas, s: Session) {
  for (const sc of s.scenery) {
    const img = atlas[SCENERY_SHEET[sc.kind]][0];
    if (!img?.naturalWidth) continue;
    const src = cleanedSprite(img);
    const crop = contentCrop(img);
    const baseW = sc.kind.startsWith("dino") ? 168 : 128;
    const w = baseW * (sc.scale / 0.34);
    const h = w * (crop.sh / Math.max(1, crop.sw));
    const x = sc.at - s.distance * 0.055;
    const y = GROUND - 70 - h * 0.62;
    if (x + w < 240 || x > W + 16) continue;
    ctx.save();
    ctx.globalAlpha = 0.88;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(src, crop.sx, crop.sy, crop.sw, crop.sh, x, y, w, h);
    ctx.restore();
  }
}

function drawMeteors(ctx: CanvasRenderingContext2D, s: Session, th: Theme) {
  for (const m of s.meteors) {
    const a = Math.max(0, m.life / m.max);
    const sp = Math.hypot(m.vx, m.vy) || 1;
    const tx = m.x - (m.vx / sp) * m.len;
    const ty = m.y - (m.vy / sp) * m.len;
    ctx.save();
    ctx.strokeStyle = rgba(th.sun, a * 0.32);
    ctx.lineWidth = 2.1;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(m.x, m.y);
    ctx.stroke();
    ctx.strokeStyle = rgba("255,248,230", a * 0.88);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(tx + (m.x - tx) * 0.5, ty + (m.y - ty) * 0.5);
    ctx.lineTo(m.x, m.y);
    ctx.stroke();
    ctx.fillStyle = rgba("255,252,245", a);
    ctx.beginPath();
    ctx.arc(m.x, m.y, 1.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function robotFrame(atlas: Atlas, s: Session) {
  if (s.mode === "over") return atlas.crash[0];
  if (!s.onGround) {
    const j = atlas.jump;
    if (s.vy < -480) return j[0];
    if (s.vy < -220) return j[1];
    if (s.vy < 40) return j[2];
    if (s.vy < 260) return j[3];
    return j[4] ?? j[j.length - 1];
  }
  if (s.mode === "title") return frameOf(atlas, "run", s.elapsed, 0, 10);
  return frameOf(atlas, "run", s.elapsed, 0, 14);
}

export function render(ctx: CanvasRenderingContext2D, s: Session, atlas: Atlas) {
  const heat = s.mode === "title" ? 0.06 : s.heat;
  const th = themeAt(heat);
  const t = s.elapsed;

  ctx.save();
  if (s.shake > 0.02) {
    const mag = s.shake * s.shake * 11;
    ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag * 0.6);
  }

  const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
  sky.addColorStop(0, rgb(th.skyTop));
  sky.addColorStop(1, rgb(th.skyBot));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  drawSun(ctx, th, heat);

  const scroll = s.distance;
  ridge(ctx, th.far, GROUND - 10, 36, 200, scroll * 0.07);
  drawScenery(ctx, atlas, s);
  ridge(ctx, th.mid, GROUND - 4, 54, 148, scroll * 0.16);
  pylons(ctx, th.mid, scroll * 0.16, heat);
  drawMeteors(ctx, s, th);

  ctx.fillStyle = rgb(th.rail);
  ctx.fillRect(0, GROUND, W, 5);
  ctx.fillStyle = rgba(th.ink, 0.55);
  const go = scroll % 32;
  for (let x = -32; x < W + 32; x += 32) {
    ctx.fillRect(x - go, GROUND + 8, 16, 3);
  }
  ctx.fillStyle = rgba(th.ink, 0.28);
  for (let x = -44; x < W + 44; x += 44) {
    ctx.fillRect(x - go * 1.2 + 18, GROUND + 18, 4, 4);
  }
  ctx.fillStyle = rgba(th.ink, 0.14);
  ctx.fillRect(0, GROUND + 5, W, H - GROUND);

  if (heat > 0.38) {
    ctx.strokeStyle = rgba(th.heatAccent, (heat - 0.38) * 0.5);
    ctx.lineWidth = 1.3;
    for (let i = 0; i < 7; i++) {
      const cx = ((i * 139 + scroll * 0.45) % (W + 50)) - 20;
      ctx.beginPath();
      ctx.moveTo(cx, GROUND + 4);
      ctx.lineTo(cx + 11, GROUND + 13);
      ctx.lineTo(cx + 24, GROUND + 6);
      ctx.stroke();
    }
  }

  for (const o of s.obstacles) drawObstacle(ctx, atlas, o, t);

  for (const p of s.particles) {
    ctx.fillStyle = rgba(p.color, Math.max(0, p.life / p.max) * 0.8);
    ctx.fillRect(p.x, p.y, p.size, p.size);
  }

  const robot = robotFrame(atlas, s);
  const flashOn = s.mode === "over" && s.flash > 0 && Math.floor(s.flash * 18) % 2 === 0;
  if (flashOn) ctx.globalCompositeOperation = "lighter";
  const dim = sized(robot, PLAYER_DRAW, 64);
  blitCrop(ctx, robot, PLAYER_X + (PLAYER_DRAW - dim.w) / 2, s.playerY, dim.w, dim.h, s.squashX, s.squashY);
  ctx.globalCompositeOperation = "source-over";

  if (heat > 0.52) {
    const va = ((heat - 0.52) / 0.48) * 0.4;
    const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.18, W / 2, H / 2, W * 0.62);
    vg.addColorStop(0, rgba(th.heatAccent, 0));
    vg.addColorStop(1, rgba(th.heatAccent, va));
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);
  }

  ctx.restore();
}
