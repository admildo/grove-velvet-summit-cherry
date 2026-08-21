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
};

export type Meteor = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  len: number;
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
    meteorWait: 1.4,
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

export function seedScenery(startAt: number): Scenery[] {
  const list: Scenery[] = [];
  let d = startAt + 520;
  for (let i = 0; i < 8; i++) {
    list.push({
      kind: SCENERY_KINDS[i % SCENERY_KINDS.length],
      at: d,
      scale: 0.34 + (i % 3) * 0.05,
      seed: Math.random() * 10,
    });
    d += 860 + ((i * 211) % 420);
  }
  return list;
}

function wrapScenery(s: Session) {
  const horizon = s.distance + W * 8;
  for (const sc of s.scenery) {
    const x = sc.at - s.distance * 0.055;
    if (x < -180) {
      sc.at += 4200 + sc.seed * 180;
      sc.kind = SCENERY_KINDS[Math.floor(Math.random() * SCENERY_KINDS.length)];
      sc.scale = 0.32 + Math.random() * 0.14;
      if (sc.at < horizon) sc.at = horizon + 200 + Math.random() * 500;
    }
  }
}

function spawnMeteor(s: Session) {
  s.meteors.push({
    x: W * (0.35 + Math.random() * 0.6),
    y: 6 + Math.random() * 28,
    vx: -(55 + Math.random() * 80),
    vy: 22 + Math.random() * 36,
    life: 2.4 + Math.random() * 1.1,
    max: 3.2,
    len: 11 + Math.random() * 16,
  });
}

function stepMeteors(s: Session, dt: number) {
  s.meteorWait -= dt;
  if (s.meteorWait <= 0) {
    s.meteorWait = s.mode === "playing" ? 7 + Math.random() * 10 : 11 + Math.random() * 14;
    spawnMeteor(s);
    if (Math.random() < 0.16) spawnMeteor(s);
  }
  const floor = GROUND - 96;
  for (const m of s.meteors) {
    m.x += m.vx * dt;
    m.y += m.vy * dt;
    m.life -= dt;
  }
  s.meteors = s.meteors.filter((m) => m.life > 0 && m.y < floor && m.x > -20);
}

function minGapPx(speed: number) {
  const airTime = (2 * Math.abs(JUMP_V)) / GRAVITY;
  const jumpClear = speed * airTime * 0.38;
  const react = speed * 0.55;
  return Math.max(260, jumpClear + react);
}

function trySpawn(s: Session) {
  if (!s.firstSpawned) {
    if (s.elapsed < 0.7) return;
    spawnObstacle(s, W + 28, "rock");
    s.firstSpawned = true;
    s.nextSpawnAt = s.distance + minGapPx(s.speed) * (1.05 + Math.random() * 0.2);
    return;
  }
  if (s.distance < s.nextSpawnAt) return;
  const last = s.obstacles[s.obstacles.length - 1];
  const spawnX = W + 36;
  const gap = last ? spawnX - (last.x + last.w) : 1e9;
  if (gap < minGapPx(s.speed)) {
    s.nextSpawnAt = s.distance + 12;
    return;
  }
  spawnObstacle(s, spawnX, pickType(s.heat));
  const wait = minGapPx(s.speed) * (0.95 + Math.random() * 0.55);
  s.nextSpawnAt = s.distance + wait;
}

function hitbox(o: Obstacle) {
  const spec = SPEC[o.type];
  const dx = (o.w - spec.hitW) / 2;
  return {
    x: o.x + dx,
    y: GROUND - spec.hitH,
    w: spec.hitW,
    h: spec.hitH,
  };
}

function playerBox(s: Session) {
  return {
    x: PLAYER_X + 22,
    y: s.playerY + 16,
    w: 34,
    h: PLAYER_DRAW - 24,
  };
}

function endRun(s: Session) {
  s.mode = "over";
  s.flash = 0.28;
  s.shake = 0.95;
  s.events.push("crash");
  emitCrash(s, PLAYER_X + 46, s.playerY + 48, "240,228,214", "196,84,58");
  const sc = Math.floor(s.score);
  if (sc > s.best) {
    s.best = sc;
    s.newBest = true;
    saveBest(sc);
  }
}

function stepParticles(list: Particle[], dt: number, g: number) {
  for (const p of list) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += g * dt;
    p.life -= dt;
  }
  return list.filter((p) => p.life > 0);
}

function simulate(s: Session, dt: number) {
  if (s.mode === "title") {
    s.elapsed += dt;
    s.distance += 42 * dt;
    s.particles = stepParticles(s.particles, dt, 160);
    wrapScenery(s);
    stepMeteors(s, dt);
    s.squashX += (1 - s.squashX) * (1 - Math.exp(-10 * dt));
    s.squashY += (1 - s.squashY) * (1 - Math.exp(-10 * dt));
    return;
  }

  if (s.mode === "over") {
    s.flash = Math.max(0, s.flash - dt);
    s.shake = Math.max(0, s.shake - dt * 2.2);
    s.particles = stepParticles(s.particles, dt, 240);
    wrapScenery(s);
    stepMeteors(s, dt);
    return;
  }

  s.elapsed += dt;
  s.speed = Math.min(SPEED_CAP, SPEED_0 + s.elapsed * 5.4 + Math.pow(s.elapsed, 1.12) * 0.4);
  s.distance += s.speed * dt;
  s.score = s.distance * SCORE_PER_PX;
  s.heat = Math.min(1, s.elapsed / 62);

  if (s.onGround) s.coyote = COYOTE;
  else s.coyote = Math.max(0, s.coyote - dt);
  s.buffer = Math.max(0, s.buffer - dt);

  const wasGround = s.onGround;
  s.vy += GRAVITY * dt;
  s.playerY += s.vy * dt;
  const floor = GROUND - PLAYER_DRAW;
  if (s.playerY >= floor) {
    s.playerY = floor;
    s.vy = 0;
    s.onGround = true;
    if (!wasGround) {
      s.squashX = 1.22;
      s.squashY = 0.78;
      s.events.push("land");
      emitDust(s, PLAYER_X + 34, GROUND - 2, "210,198,182");
    }
  } else {
    s.onGround = false;
  }

  if (s.buffer > 0 && (s.onGround || s.coyote > 0)) doJump(s);

  s.squashX += (1 - s.squashX) * (1 - Math.exp(-12 * dt));
  s.squashY += (1 - s.squashY) * (1 - Math.exp(-12 * dt));

  trySpawn(s);

  const pb = playerBox(s);
  for (let i = s.obstacles.length - 1; i >= 0; i--) {
    const o = s.obstacles[i];
    o.x -= s.speed * dt;
    if (o.x + o.w < -50) {
      s.obstacles.splice(i, 1);
      continue;
    }
    const hb = hitbox(o);
    if (pb.x < hb.x + hb.w && pb.x + pb.w > hb.x && pb.y < hb.y + hb.h && pb.y + pb.h > hb.y) {
      endRun(s);
      break;
    }
  }

  wrapScenery(s);
  stepMeteors(s, dt);

  s.particles = stepParticles(s.particles, dt, 260);
  s.shake = Math.max(0, s.shake - dt * 2.4);
}

const STEP = 1 / 60;

export function tick(s: Session, dt: number) {
  s.events = [];
  s.acc += Math.min(dt, 0.05);
  let steps = 0;
  while (s.acc >= STEP && steps < 5) {
    simulate(s, STEP);
    s.acc -= STEP;
    steps++;
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
