export const W = 840;
export const H = 340;
export const GROUND = 268;
export const PLAYER_X = 86;
export const MAX_PLAYS = 3;
export const GRAVITY = 2400;
export const JUMP_V = -720;
export const SPEED_0 = 360;
export const SPEED_CAP = 680;
export const COYOTE = 0.08;
export const BUFFER = 0.1;
export const BEST_KEY = "fast-thinking-best-v4";
export const PLAYER_DRAW = 78;
export const SCORE_PER_PX = 1 / 22;

export type ObstacleType = "rock" | "spike" | "slime" | "crawler" | "watcher" | "cluster";

export type Obstacle = {
  type: ObstacleType;
  x: number;
  y: number;
  w: number;
  h: number;
  seed: number;
};

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
};

export type Mode = "title" | "playing" | "over";

export type SceneryKind = "shipA" | "shipB" | "dinoA" | "dinoB";

export type Scenery = {
  kind: SceneryKind;
  at: number;
  scale: number;
  seed: number;
  /** Parallax depth: higher = closer / moves faster with world. */
  depth: number;
};

export type Meteor = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  len: number;
  /** Visual weight: thicker / brighter streaks during showers. */
  weight: number;
};

export type Session = {
  mode: Mode;
  playsLeft: number;
  best: number;
  newBest: boolean;
  elapsed: number;
  distance: number;
  score: number;
  speed: number;
  playerY: number;
  vy: number;
  onGround: boolean;
  coyote: number;
  buffer: number;
  squashX: number;
  squashY: number;
  obstacles: Obstacle[];
  nextSpawnAt: number;
  particles: Particle[];
  scenery: Scenery[];
  meteors: Meteor[];
  meteorWait: number;
  shake: number;
  flash: number;
  acc: number;
  heat: number;
  events: Array<"jump" | "land" | "crash">;
  firstSpawned: boolean;
};

/** Visual size vs tight hitbox. Hitbox is the solid body, sprite is larger. */
export const SPEC: Record<
  ObstacleType,
  { drawH: number; maxW: number; hitW: number; hitH: number }
> = {
  rock: { drawH: 50, maxW: 64, hitW: 40, hitH: 38 },
  spike: { drawH: 90, maxW: 46, hitW: 22, hitH: 72 },
  slime: { drawH: 46, maxW: 68, hitW: 48, hitH: 32 },
  crawler: { drawH: 34, maxW: 88, hitW: 70, hitH: 24 },
  watcher: { drawH: 96, maxW: 38, hitW: 22, hitH: 78 },
  cluster: { drawH: 54, maxW: 90, hitW: 68, hitH: 40 },
};

export function loadBest() {
  try {
    return Math.max(0, Number(localStorage.getItem(BEST_KEY) || 0));
  } catch {
    return 0;
  }
}

function saveBest(n: number) {
  try {
    localStorage.setItem(BEST_KEY, String(n));
  } catch {
    /* ignore */
  }
}

export function createSession(): Session {
  return {
    mode: "title",
    playsLeft: MAX_PLAYS,
    best: loadBest(),
    newBest: false,
    elapsed: 0,
    distance: 0,
    score: 0,
    speed: SPEED_0,
    playerY: GROUND - PLAYER_DRAW,
    vy: 0,
    onGround: true,
    coyote: 0,
    buffer: 0,
    squashX: 1,
    squashY: 1,
    obstacles: [],
    nextSpawnAt: 140,
    particles: [],
    scenery: seedScenery(0),
    meteors: [],
    meteorWait: 0.6,
    shake: 0,
    flash: 0,
    acc: 0,
    heat: 0,
    events: [],
    firstSpawned: false,
  };
}

function resetRun(s: Session) {
  s.elapsed = 0;
  s.distance = 0;
  s.score = 0;
  s.speed = SPEED_0;
  s.playerY = GROUND - PLAYER_DRAW;
  s.vy = 0;
  s.onGround = true;
  s.coyote = 0;
  s.buffer = 0;
  s.squashX = 1;
  s.squashY = 1;
  s.obstacles = [];
  s.nextSpawnAt = 90;
  s.particles = [];
  s.scenery = seedScenery(0);
  s.meteors = [];
  s.meteorWait = 1.8 + Math.random() * 3;
  s.shake = 0;
  s.flash = 0;
  s.heat = 0;
  s.newBest = false;
  s.events = [];
  s.firstSpawned = false;
}

export function startRun(s: Session) {
  if (s.mode === "playing") return;
  if (s.playsLeft <= 0 && s.mode === "over") return;
  if (s.mode === "title" || s.mode === "over") {
    if (s.playsLeft <= 0) return;
    s.playsLeft -= 1;
  }
  resetRun(s);
  s.mode = "playing";
}

export function requestJump(s: Session) {
  if (s.mode !== "playing") return;
  s.buffer = BUFFER;
}

function doJump(s: Session) {
  s.vy = JUMP_V;
  s.onGround = false;
  s.coyote = 0;
  s.buffer = 0;
  s.squashX = 0.78;
  s.squashY = 1.26;
  s.events.push("jump");
}

export function emitDust(s: Session, x: number, y: number, color: string) {
  for (let i = 0; i < 9; i++) {
    s.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 110,
      vy: -24 - Math.random() * 80,
      life: 0.28 + Math.random() * 0.25,
      max: 0.55,
      size: 2 + Math.random() * 2.6,
      color,
    });
  }
}

export function emitCrash(s: Session, x: number, y: number, a: string, b: string) {
  for (let i = 0; i < 26; i++) {
    const ang = Math.random() * Math.PI * 2;
    const sp = 50 + Math.random() * 200;
    s.particles.push({
      x,
      y,
      vx: Math.cos(ang) * sp,
      vy: Math.sin(ang) * sp - 50,
      life: 0.4 + Math.random() * 0.5,
      max: 0.95,
      size: 2 + Math.random() * 3.4,
      color: Math.random() > 0.45 ? a : b,
    });
  }
}

function pickType(heat: number): ObstacleType {
  const r = Math.random();
  if (heat < 0.16) return r < 0.55 ? "rock" : "spike";
  if (heat < 0.38) {
    if (r < 0.28) return "rock";
    if (r < 0.5) return "spike";
    if (r < 0.76) return "slime";
    return "cluster";
  }
  if (heat < 0.66) {
    if (r < 0.14) return "spike";
    if (r < 0.34) return "slime";
    if (r < 0.56) return "crawler";
    if (r < 0.76) return "cluster";
    return "watcher";
  }
  if (r < 0.16) return "slime";
  if (r < 0.36) return "crawler";
  if (r < 0.56) return "watcher";
  if (r < 0.76) return "cluster";
  return "spike";
}

function spawnObstacle(s: Session, x: number, type: ObstacleType) {
  const spec = SPEC[type];
  s.obstacles.push({
    type,
    x,
    y: GROUND - spec.drawH,
    w: spec.maxW,
    h: spec.drawH,
    seed: Math.random() * Math.PI * 2,
  });
}

const SCENERY_KINDS: SceneryKind[] = ["shipA", "dinoA", "shipB", "dinoB"];

/** Ships sit closer (higher depth); bone remains mid-ground. */
function sceneryDepth(kind: SceneryKind) {
  return kind.startsWith("ship") ? 0.34 : 0.18;
}

function sceneryScale(kind: SceneryKind, i: number) {
  if (kind.startsWith("ship")) return 1.35 + (i % 3) * 0.12;
  return 0.9 + (i % 2) * 0.15;
}

export function seedScenery(startAt: number): Scenery[] {
  const list: Scenery[] = [];
  // Seed one big bone pile and one looming ship early so title screen reads the mood
  list.push({
    kind: "dinoB",
    at: startAt + 380,
    scale: 1.05,
    seed: 2.4,
    depth: 0.2,
  });
  list.push({
    kind: "shipA",
    at: startAt + 640,
    scale: 1.52,
    seed: 1.1,
    depth: 0.34,
  });
  let d = startAt + 1100;
  for (let i = 0; i < 8; i++) {
    const kind = SCENERY_KINDS[i % SCENERY_KINDS.length];
    list.push({
      kind,
      at: d,
      scale: sceneryScale(kind, i),
      seed: Math.random() * 10,
      depth: sceneryDepth(kind),
    });
    d += 720 + ((i * 211) % 380);
  }
  return list;
}

function wrapScenery(s: Session) {
  const horizon = s.distance + W * 10;
  for (const sc of s.scenery) {
    const x = sc.at - s.distance * sc.depth;
    if (x < -280) {
      sc.at += 4800 + sc.seed * 220;
      sc.kind = SCENERY_KINDS[Math.floor(Math.random() * SCENERY_KINDS.length)];
      sc.scale = sceneryScale(sc.kind, Math.floor(sc.seed * 3));
      sc.depth = sceneryDepth(sc.kind);
      if (sc.at < horizon) sc.at = horizon + 180 + Math.random() * 600;
    }
  }
}

function spawnMeteor(s: Session, weight = 1) {
  const w = weight;
  s.meteors.push({
    x: W * (0.28 + Math.random() * 0.7),
    y: 4 + Math.random() * 36,
    vx: -(70 + Math.random() * 110) * (0.85 + w * 0.2),
    vy: (28 + Math.random() * 48) * (0.9 + w * 0.15),
    life: 2.0 + Math.random() * 1.4,
    max: 3.4,
    len: (14 + Math.random() * 22) * (0.7 + w * 0.45),
    weight: w,
  });
}

function stepMeteors(s: Session, dt: number) {
  s.meteorWait -= dt;
  if (s.meteorWait <= 0) {
    // First streak comes early; then either a quiet single or a brief shower
    const first = s.elapsed < 2.5;
    const shower = !first && s.elapsed > 5.5 && Math.random() < 0.42;
    if (shower) {
      const n = 4 + Math.floor(Math.random() * 5);
      for (let i = 0; i < n; i++) {
        spawnMeteor(s, 1.4 + Math.random() * 0.8);
      }
      s.meteorWait = s.mode === "playing" ? 4.5 + Math.random() * 5 : 8 + Math.random() * 8;
    } else {
      spawnMeteor(s, 0.85 + Math.random() * 0.4);
      if (Math.random() < 0.22) spawnMeteor(s, 1);
      s.meteorWait =
        s.mode === "playing" ? 3.5 + Math.random() * 5.5 : 7 + Math.random() * 10;
    }
  }
  const floor = GROUND - 80;
  for (const m of s.meteors) {
    m.x += m.vx * dt;
    m.y += m.vy * dt;
    m.life -= dt;
  }
  s.meteors = s.meteors.filter((m) => m.life > 0 && m.y < floor && m.x > -40);
}

function minGapPx(speed: number) {
  const airTime = (2 * Math.abs(JUMP_V)) / GRAVITY;
  const jumpClear = speed * airTime * 0.38;
  return Math.max(150, jumpClear);
}

function maybeSpawn(s: Session) {
  if (s.mode !== "playing") return;
  if (s.distance < s.nextSpawnAt) return;
  const type = pickType(s.heat);
  const gap = minGapPx(s.speed) * (0.85 + Math.random() * 0.4);
  const x = W + 40 + Math.random() * 40;
  spawnObstacle(s, x, type);
  s.nextSpawnAt = s.distance + gap;
  if (!s.firstSpawned) s.firstSpawned = true;
}

function stepPlayer(s: Session, dt: number) {
  if (s.buffer > 0) s.buffer -= dt;
  if (s.coyote > 0) s.coyote -= dt;
  if (s.buffer > 0 && (s.onGround || s.coyote > 0)) doJump(s);

  s.vy += GRAVITY * dt;
  s.playerY += s.vy * dt;
  const floor = GROUND - PLAYER_DRAW;
  if (s.playerY >= floor) {
    if (!s.onGround && s.vy > 80) s.events.push("land");
    s.playerY = floor;
    s.vy = 0;
    if (!s.onGround) {
      s.onGround = true;
      s.squashX = 1.18;
      s.squashY = 0.82;
      emitDust(s, PLAYER_X + 20, GROUND - 2, "#c4a574");
    }
  } else {
    if (s.onGround) s.coyote = COYOTE;
    s.onGround = false;
  }
  s.squashX += (1 - s.squashX) * Math.min(1, dt * 12);
  s.squashY += (1 - s.squashY) * Math.min(1, dt * 12);
}

function hitTest(s: Session) {
  const px = PLAYER_X + 18;
  const py = s.playerY + 16;
  const pw = 28;
  const ph = PLAYER_DRAW - 22;
  for (const o of s.obstacles) {
    const spec = SPEC[o.type];
    const ox = o.x + (o.w - spec.hitW) / 2;
    const oy = GROUND - spec.hitH;
    if (px < ox + spec.hitW && px + pw > ox && py < oy + spec.hitH && py + ph > oy) {
      return o;
    }
  }
  return null;
}

function stepParticles(s: Session, dt: number) {
  for (const p of s.particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 420 * dt;
    p.life -= dt;
  }
  s.particles = s.particles.filter((p) => p.life > 0);
}

export function tick(s: Session, dt: number) {
  s.events = [];
  if (s.shake > 0) s.shake = Math.max(0, s.shake - dt * 3.2);
  if (s.flash > 0) s.flash = Math.max(0, s.flash - dt * 4);

  if (s.mode === "title") {
    s.elapsed += dt;
    s.distance += SPEED_0 * 0.22 * dt;
    wrapScenery(s);
    stepMeteors(s, dt);
    stepParticles(s, dt);
    return;
  }

  if (s.mode !== "playing") {
    stepParticles(s, dt);
    stepMeteors(s, dt);
    return;
  }

  s.elapsed += dt;
  s.acc += dt;
  s.heat = Math.min(1, s.elapsed / 90);
  s.speed = SPEED_0 + (SPEED_CAP - SPEED_0) * s.heat;
  s.distance += s.speed * dt;
  s.score = s.distance * SCORE_PER_PX;

  stepPlayer(s, dt);
  maybeSpawn(s);

  for (const o of s.obstacles) o.x -= s.speed * dt;
  s.obstacles = s.obstacles.filter((o) => o.x > -120);

  wrapScenery(s);
  stepMeteors(s, dt);
  stepParticles(s, dt);

  const hit = hitTest(s);
  if (hit) {
    emitCrash(s, PLAYER_X + 30, s.playerY + 40, "#e8d4a8", "#8b4513");
    s.shake = 1;
    s.flash = 1;
    s.mode = "over";
    s.events.push("crash");
    if (s.score > s.best) {
      s.best = Math.floor(s.score);
      s.newBest = true;
      saveBest(s.best);
    }
  }
}

export type Hud = {
  mode: Mode;
  score: number;
  best: number;
  playsLeft: number;
  newBest: boolean;
  heat: number;
  obstacleCount: number;
};

export function hud(s: Session): Hud {
  return {
    mode: s.mode,
    score: Math.floor(s.score),
    best: s.best,
    playsLeft: s.playsLeft,
    newBest: s.newBest,
    heat: s.heat,
    obstacleCount: s.obstacles.length,
  };
}
