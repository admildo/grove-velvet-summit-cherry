import { i as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CkL995BV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-opacity duration-[var(--motion-quick)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]", {
	variants: {
		variant: {
			default: "bg-accent text-accent-foreground hover:opacity-90",
			outline: "border border-border bg-transparent text-foreground hover:bg-surface",
			ghost: "text-muted hover:text-foreground"
		},
		size: {
			default: "h-11 px-6 text-sm",
			lg: "h-12 px-8 text-base",
			sm: "h-9 px-4 text-sm"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		ref,
		...props
	});
});
Button.displayName = "Button";
var FILES = {
	run: Array.from({ length: 12 }, (_, i) => `/sprites/run-${String(i + 1).padStart(2, "0")}.png`),
	jump: [
		"/sprites/jump-01.png",
		"/sprites/jump-02.png",
		"/sprites/jump-air.png",
		"/sprites/jump-03.png",
		"/sprites/jump-04.png",
		"/sprites/jump-06.png"
	],
	crash: ["/sprites/crash-01.png"],
	idle: ["/sprites/idle-01.png"],
	rock: [
		"/sprites/rock-1.png",
		"/sprites/rock-2.png",
		"/sprites/rock-3.png",
		"/sprites/rock-4.png"
	],
	spike: [
		"/sprites/spike-1.png",
		"/sprites/spike-2.png",
		"/sprites/spike-3.png",
		"/sprites/spike-4.png"
	],
	slime: [
		"/sprites/slime-1.png",
		"/sprites/slime-2.png",
		"/sprites/slime-3.png",
		"/sprites/slime-4.png"
	],
	crawler: [
		"/sprites/crawler-1.png",
		"/sprites/crawler-2.png",
		"/sprites/crawler-3.png",
		"/sprites/crawler-4.png"
	],
	watcher: [
		"/sprites/watcher-1.png",
		"/sprites/watcher-2.png",
		"/sprites/watcher-3.png",
		"/sprites/watcher-4.png"
	],
	cluster: [
		"/sprites/cluster-1.png",
		"/sprites/cluster-2.png",
		"/sprites/cluster-3.png",
		"/sprites/cluster-4.png"
	],
	shipA: ["/sprites/bg-ship-a.png"],
	shipB: ["/sprites/bg-ship-b.png"],
	dinoA: ["/sprites/bg-dino-a.png"],
	dinoB: ["/sprites/bg-dino-b.png"]
};
var crops = /* @__PURE__ */ new WeakMap();
var cleaned = /* @__PURE__ */ new WeakMap();
function isMagenta(r, g, b, a) {
	if (a < 16) return true;
	return r > 150 && b > 150 && g < 120 && (r + b) / 2 - g > 55;
}
/** Magenta-stripped canvas so leftover chroma never draws as a purple square. */
function cleanedSprite(img) {
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
	for (let i = 0; i < d.length; i += 4) if (isMagenta(d[i], d[i + 1], d[i + 2], d[i + 3])) {
		d[i] = 0;
		d[i + 1] = 0;
		d[i + 2] = 0;
		d[i + 3] = 0;
	}
	ctx.putImageData(data, 0, 0);
	cleaned.set(img, c);
	return c;
}
function contentCrop(img) {
	const cached = crops.get(img);
	if (cached) return cached;
	const src = cleanedSprite(img);
	const w = src.width;
	const h = src.height;
	const ctx = src.getContext("2d", { willReadFrequently: true });
	if (!ctx || w < 4 || h < 4) {
		const fb = {
			sx: 0,
			sy: 0,
			sw: Math.max(1, w),
			sh: Math.max(1, h)
		};
		crops.set(img, fb);
		return fb;
	}
	const data = ctx.getImageData(0, 0, w, h).data;
	let minX = w, minY = h, maxX = 0, maxY = 0;
	for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (data[(y * w + x) * 4 + 3] > 18) {
		if (x < minX) minX = x;
		if (y < minY) minY = y;
		if (x > maxX) maxX = x;
		if (y > maxY) maxY = y;
	}
	const crop = maxX <= minX ? {
		sx: 0,
		sy: 0,
		sw: w,
		sh: h
	} : {
		sx: minX,
		sy: minY,
		sw: maxX - minX + 1,
		sh: maxY - minY + 1
	};
	crops.set(img, crop);
	return crop;
}
function loadImage(src) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.decoding = "async";
		img.onload = () => resolve(img);
		img.onerror = () => reject(/* @__PURE__ */ new Error(`Failed to load ${src}`));
		img.src = src;
	});
}
async function loadAtlas() {
	const entries = await Promise.all(Object.keys(FILES).map(async (key) => {
		return [key, await Promise.all(FILES[key].map(loadImage))];
	}));
	return Object.fromEntries(entries);
}
var ctx = null;
var master = null;
var sfx = null;
function unlockAudio() {
	if (!ctx) {
		ctx = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: "interactive" });
		master = ctx.createGain();
		sfx = ctx.createGain();
		sfx.gain.value = .22;
		master.gain.value = .85;
		sfx.connect(master);
		master.connect(ctx.destination);
	}
	if (ctx.state === "suspended") ctx.resume();
}
function beep(freq, dur, type, gain = .8) {
	if (!ctx || !sfx) return;
	const t = ctx.currentTime;
	const osc = ctx.createOscillator();
	const g = ctx.createGain();
	osc.type = type;
	osc.frequency.setValueAtTime(freq, t);
	g.gain.setValueAtTime(1e-4, t);
	g.gain.exponentialRampToValueAtTime(gain, t + .012);
	g.gain.exponentialRampToValueAtTime(1e-4, t + dur);
	osc.connect(g);
	g.connect(sfx);
	osc.start(t);
	osc.stop(t + dur + .02);
}
function sfxJump() {
	beep(420, .09, "square", .5);
	beep(680, .07, "triangle", .35);
}
function sfxLand() {
	beep(90, .08, "sine", .7);
}
function sfxCrash() {
	beep(140, .28, "sawtooth", .9);
	beep(70, .35, "square", .5);
}
function sfxStart() {
	beep(520, .08, "triangle", .4);
	beep(780, .12, "triangle", .3);
}
var GRAVITY = 2400;
var JUMP_V = -720;
var COYOTE = .08;
var BUFFER = .1;
var BEST_KEY = "fast-thinking-best-v4";
var SCORE_PER_PX = 1 / 22;
/** Visual size vs tight hitbox. Hitbox is the solid body, sprite is larger. */
var SPEC = {
	rock: {
		drawH: 50,
		maxW: 64,
		hitW: 40,
		hitH: 38
	},
	spike: {
		drawH: 90,
		maxW: 46,
		hitW: 22,
		hitH: 72
	},
	slime: {
		drawH: 46,
		maxW: 68,
		hitW: 48,
		hitH: 32
	},
	crawler: {
		drawH: 34,
		maxW: 88,
		hitW: 70,
		hitH: 24
	},
	watcher: {
		drawH: 96,
		maxW: 38,
		hitW: 22,
		hitH: 78
	},
	cluster: {
		drawH: 54,
		maxW: 90,
		hitW: 68,
		hitH: 40
	}
};
function loadBest() {
	try {
		return Math.max(0, Number(localStorage.getItem("fast-thinking-best-v4") || 0));
	} catch {
		return 0;
	}
}
function saveBest(n) {
	try {
		localStorage.setItem(BEST_KEY, String(n));
	} catch {}
}
function createSession() {
	return {
		mode: "title",
		playsLeft: 3,
		best: loadBest(),
		newBest: false,
		elapsed: 0,
		distance: 0,
		score: 0,
		speed: 360,
		playerY: 190,
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
		firstSpawned: false
	};
}
function resetRun(s) {
	s.elapsed = 0;
	s.distance = 0;
	s.score = 0;
	s.speed = 360;
	s.playerY = 190;
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
function startRun(s) {
	if (s.mode === "playing") return;
	if (s.playsLeft <= 0 && s.mode === "over") return;
	if (s.mode === "title" || s.mode === "over") {
		if (s.playsLeft <= 0) return;
		s.playsLeft -= 1;
	}
	resetRun(s);
	s.mode = "playing";
}
function requestJump(s) {
	if (s.mode !== "playing") return;
	s.buffer = BUFFER;
}
function doJump(s) {
	s.vy = JUMP_V;
	s.onGround = false;
	s.coyote = 0;
	s.buffer = 0;
	s.squashX = .78;
	s.squashY = 1.26;
	s.events.push("jump");
}
function emitDust(s, x, y, color) {
	for (let i = 0; i < 9; i++) s.particles.push({
		x,
		y,
		vx: (Math.random() - .5) * 110,
		vy: -24 - Math.random() * 80,
		life: .28 + Math.random() * .25,
		max: .55,
		size: 2 + Math.random() * 2.6,
		color
	});
}
function emitCrash(s, x, y, a, b) {
	for (let i = 0; i < 26; i++) {
		const ang = Math.random() * Math.PI * 2;
		const sp = 50 + Math.random() * 200;
		s.particles.push({
			x,
			y,
			vx: Math.cos(ang) * sp,
			vy: Math.sin(ang) * sp - 50,
			life: .4 + Math.random() * .5,
			max: .95,
			size: 2 + Math.random() * 3.4,
			color: Math.random() > .45 ? a : b
		});
	}
}
function pickType(heat) {
	const r = Math.random();
	if (heat < .16) return r < .55 ? "rock" : "spike";
	if (heat < .38) {
		if (r < .28) return "rock";
		if (r < .5) return "spike";
		if (r < .76) return "slime";
		return "cluster";
	}
	if (heat < .66) {
		if (r < .14) return "spike";
		if (r < .34) return "slime";
		if (r < .56) return "crawler";
		if (r < .76) return "cluster";
		return "watcher";
	}
	if (r < .16) return "slime";
	if (r < .36) return "crawler";
	if (r < .56) return "watcher";
	if (r < .76) return "cluster";
	return "spike";
}
function spawnObstacle(s, x, type) {
	const spec = SPEC[type];
	s.obstacles.push({
		type,
		x,
		y: 268 - spec.drawH,
		w: spec.maxW,
		h: spec.drawH,
		seed: Math.random() * Math.PI * 2
	});
}
var SCENERY_KINDS = [
	"shipA",
	"dinoA",
	"shipB",
	"dinoB"
];
function seedScenery(startAt) {
	const list = [];
	let d = startAt + 520;
	for (let i = 0; i < 8; i++) {
		list.push({
			kind: SCENERY_KINDS[i % SCENERY_KINDS.length],
			at: d,
			scale: .34 + i % 3 * .05,
			seed: Math.random() * 10
		});
		d += 860 + i * 211 % 420;
	}
	return list;
}
function wrapScenery(s) {
	const horizon = s.distance + 6720;
	for (const sc of s.scenery) if (sc.at - s.distance * .055 < -180) {
		sc.at += 4200 + sc.seed * 180;
		sc.kind = SCENERY_KINDS[Math.floor(Math.random() * SCENERY_KINDS.length)];
		sc.scale = .32 + Math.random() * .14;
		if (sc.at < horizon) sc.at = horizon + 200 + Math.random() * 500;
	}
}
function spawnMeteor(s) {
	s.meteors.push({
		x: 840 * (.35 + Math.random() * .6),
		y: 6 + Math.random() * 28,
		vx: -(55 + Math.random() * 80),
		vy: 22 + Math.random() * 36,
		life: 2.4 + Math.random() * 1.1,
		max: 3.2,
		len: 11 + Math.random() * 16
	});
}
function stepMeteors(s, dt) {
	s.meteorWait -= dt;
	if (s.meteorWait <= 0) {
		s.meteorWait = s.mode === "playing" ? 7 + Math.random() * 10 : 11 + Math.random() * 14;
		spawnMeteor(s);
		if (Math.random() < .16) spawnMeteor(s);
	}
	const floor = 172;
	for (const m of s.meteors) {
		m.x += m.vx * dt;
		m.y += m.vy * dt;
		m.life -= dt;
	}
	s.meteors = s.meteors.filter((m) => m.life > 0 && m.y < floor && m.x > -20);
}
function minGapPx(speed) {
	const jumpClear = speed * (2 * Math.abs(JUMP_V) / GRAVITY) * .38;
	const react = speed * .55;
	return Math.max(260, jumpClear + react);
}
function trySpawn(s) {
	if (!s.firstSpawned) {
		if (s.elapsed < .7) return;
		spawnObstacle(s, 868, "rock");
		s.firstSpawned = true;
		s.nextSpawnAt = s.distance + minGapPx(s.speed) * (1.05 + Math.random() * .2);
		return;
	}
	if (s.distance < s.nextSpawnAt) return;
	const last = s.obstacles[s.obstacles.length - 1];
	const spawnX = 876;
	if ((last ? spawnX - (last.x + last.w) : 1e9) < minGapPx(s.speed)) {
		s.nextSpawnAt = s.distance + 12;
		return;
	}
	spawnObstacle(s, spawnX, pickType(s.heat));
	const wait = minGapPx(s.speed) * (.95 + Math.random() * .55);
	s.nextSpawnAt = s.distance + wait;
}
function hitbox(o) {
	const spec = SPEC[o.type];
	const dx = (o.w - spec.hitW) / 2;
	return {
		x: o.x + dx,
		y: 268 - spec.hitH,
		w: spec.hitW,
		h: spec.hitH
	};
}
function playerBox(s) {
	return {
		x: 108,
		y: s.playerY + 16,
		w: 34,
		h: 54
	};
}
function endRun(s) {
	s.mode = "over";
	s.flash = .28;
	s.shake = .95;
	s.events.push("crash");
	emitCrash(s, 132, s.playerY + 48, "240,228,214", "196,84,58");
	const sc = Math.floor(s.score);
	if (sc > s.best) {
		s.best = sc;
		s.newBest = true;
		saveBest(sc);
	}
}
function stepParticles(list, dt, g) {
	for (const p of list) {
		p.x += p.vx * dt;
		p.y += p.vy * dt;
		p.vy += g * dt;
		p.life -= dt;
	}
	return list.filter((p) => p.life > 0);
}
function simulate(s, dt) {
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
	s.speed = Math.min(680, 360 + s.elapsed * 5.4 + Math.pow(s.elapsed, 1.12) * .4);
	s.distance += s.speed * dt;
	s.score = s.distance * SCORE_PER_PX;
	s.heat = Math.min(1, s.elapsed / 62);
	if (s.onGround) s.coyote = COYOTE;
	else s.coyote = Math.max(0, s.coyote - dt);
	s.buffer = Math.max(0, s.buffer - dt);
	const wasGround = s.onGround;
	s.vy += GRAVITY * dt;
	s.playerY += s.vy * dt;
	const floor = 190;
	if (s.playerY >= floor) {
		s.playerY = floor;
		s.vy = 0;
		s.onGround = true;
		if (!wasGround) {
			s.squashX = 1.22;
			s.squashY = .78;
			s.events.push("land");
			emitDust(s, 120, 266, "210,198,182");
		}
	} else s.onGround = false;
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
var STEP = 1 / 60;
function tick(s, dt) {
	s.events = [];
	s.acc += Math.min(dt, .05);
	let steps = 0;
	while (s.acc >= STEP && steps < 5) {
		simulate(s, STEP);
		s.acc -= STEP;
		steps++;
	}
}
function hud(s) {
	return {
		mode: s.mode,
		score: Math.floor(s.score),
		best: s.best,
		playsLeft: s.playsLeft,
		newBest: s.newBest,
		heat: s.heat,
		obstacleCount: s.obstacles.length
	};
}
function hexToRgb(hex) {
	const n = parseInt(hex.slice(1), 16);
	return [
		n >> 16 & 255,
		n >> 8 & 255,
		n & 255
	];
}
function lerpHex(a, b, t) {
	const A = hexToRgb(a);
	const B = hexToRgb(b);
	return [
		0,
		1,
		2
	].map((i) => Math.round(A[i] + (B[i] - A[i]) * t)).join(",");
}
function rgb(c) {
	return `rgb(${c})`;
}
function rgba(c, a) {
	return `rgba(${c},${a})`;
}
function themeAt(heat) {
	const stops = [
		{
			t: 0,
			skyTop: "#c9d6e2",
			skyBot: "#efe8dc",
			far: "#9aabbb",
			mid: "#6f8193",
			sun: "#fff1c8",
			glow: "#ffd98a",
			heatAccent: "#6d8499",
			rail: "#3a3a38"
		},
		{
			t: .28,
			skyTop: "#e4cba8",
			skyBot: "#f3d9b0",
			far: "#b89a72",
			mid: "#8d6d48",
			sun: "#ffc46a",
			glow: "#ff9a40",
			heatAccent: "#c4863a",
			rail: "#3d342c"
		},
		{
			t: .55,
			skyTop: "#d06a3c",
			skyBot: "#e8984c",
			far: "#8a4a30",
			mid: "#6a3220",
			sun: "#ff7a30",
			glow: "#ff5418",
			heatAccent: "#e04828",
			rail: "#3a241c"
		},
		{
			t: .78,
			skyTop: "#6e1c1c",
			skyBot: "#b43428",
			far: "#441410",
			mid: "#32100c",
			sun: "#ff3c20",
			glow: "#ff1808",
			heatAccent: "#ff3020",
			rail: "#2a1210"
		},
		{
			t: 1,
			skyTop: "#100304",
			skyBot: "#2e0808",
			far: "#180404",
			mid: "#100202",
			sun: "#ff1410",
			glow: "#ff0000",
			heatAccent: "#ff2018",
			rail: "#1a0808"
		}
	];
	const t = Math.max(0, Math.min(1, heat));
	let i = 0;
	for (; i < stops.length - 1; i++) if (t >= stops[i].t && t <= stops[i + 1].t) break;
	if (i >= stops.length - 1) i = stops.length - 2;
	const a = stops[i];
	const b = stops[i + 1];
	const lt = (t - a.t) / (b.t - a.t || 1);
	const skyBot = lerpHex(a.skyBot, b.skyBot, lt);
	const [sr, sg, sb] = skyBot.split(",").map(Number);
	const lum = (.299 * sr + .587 * sg + .114 * sb) / 255;
	return {
		skyTop: lerpHex(a.skyTop, b.skyTop, lt),
		skyBot,
		far: lerpHex(a.far, b.far, lt),
		mid: lerpHex(a.mid, b.mid, lt),
		sun: lerpHex(a.sun, b.sun, lt),
		glow: lerpHex(a.glow, b.glow, lt),
		heatAccent: lerpHex(a.heatAccent, b.heatAccent, lt),
		rail: lerpHex(a.rail, b.rail, lt),
		ink: lum > .5 ? "26,24,22" : "244,238,230",
		inkHi: lum > .5 ? "70,62,54" : "255,250,244"
	};
}
function ridge(ctx, color, baseY, peak, span, offset) {
	ctx.fillStyle = rgb(color);
	ctx.beginPath();
	ctx.moveTo(-span, 340);
	ctx.lineTo(-span, baseY);
	for (let x = -span; x < 840 + span; x += span) {
		const px = x - offset % span;
		ctx.lineTo(px + span * .22, baseY - peak * .45);
		ctx.lineTo(px + span * .38, baseY - peak * .7);
		ctx.lineTo(px + span * .52, baseY - peak);
		ctx.lineTo(px + span * .7, baseY - peak * .55);
		ctx.lineTo(px + span, baseY);
	}
	ctx.lineTo(840 + span, 340);
	ctx.closePath();
	ctx.fill();
}
function pylons(ctx, color, offset, heat) {
	ctx.fillStyle = rgb(color);
	const span = 220;
	const o = offset % span;
	for (let x = -220; x < 1060; x += span) {
		const px = x - o;
		const h = 38 + x / span % 3 * 10;
		ctx.fillRect(px + 18, 260 - h, 6, h);
		ctx.fillRect(px + 10, 260 - h, 22, 4);
		if (heat > .4) {
			ctx.strokeStyle = rgba("255,80,50", (heat - .4) * .5);
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(px + 32, 260 - h + 2);
			ctx.lineTo(px + span - 10, 240);
			ctx.stroke();
		}
	}
}
function drawSun(ctx, th, heat) {
	const x = 640 - heat * 90;
	const y = 38 + heat * 140;
	const r = Math.max(9, 15 + heat * 9 - Math.max(0, heat - .82) * 36);
	const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4.4);
	g.addColorStop(0, rgba(th.glow, .4 + heat * .22));
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
function blitCrop(ctx, img, x, y, w, h, sx = 1, sy = 1) {
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
function sized(img, drawH, maxW) {
	const c = contentCrop(img);
	const aspect = c.sw / Math.max(1, c.sh);
	return {
		w: Math.min(maxW, drawH * aspect),
		h: drawH
	};
}
function frameOf(atlas, name, t, seed = 0, fps = 8) {
	const frames = atlas[name];
	return frames[Math.floor(t * fps + seed * 3) % frames.length];
}
function drawObstacle(ctx, atlas, o, t) {
	const spec = SPEC[o.type];
	const img = frameOf(atlas, o.type, t, o.seed, o.type === "crawler" ? 10 : 7);
	const dim = sized(img, spec.drawH, spec.maxW);
	blitCrop(ctx, img, o.x + (o.w - dim.w) / 2, 268 - dim.h, dim.w, dim.h);
}
var SCENERY_SHEET = {
	shipA: "shipA",
	shipB: "shipB",
	dinoA: "dinoA",
	dinoB: "dinoB"
};
function drawScenery(ctx, atlas, s) {
	for (const sc of s.scenery) {
		const img = atlas[SCENERY_SHEET[sc.kind]][0];
		if (!img?.naturalWidth) continue;
		const src = cleanedSprite(img);
		const crop = contentCrop(img);
		const w = (sc.kind.startsWith("dino") ? 168 : 128) * (sc.scale / .34);
		const h = w * (crop.sh / Math.max(1, crop.sw));
		const x = sc.at - s.distance * .055;
		const y = 198 - h * .62;
		if (x + w < 240 || x > 856) continue;
		ctx.save();
		ctx.globalAlpha = .88;
		ctx.imageSmoothingEnabled = true;
		ctx.imageSmoothingQuality = "high";
		ctx.drawImage(src, crop.sx, crop.sy, crop.sw, crop.sh, x, y, w, h);
		ctx.restore();
	}
}
function drawMeteors(ctx, s, th) {
	for (const m of s.meteors) {
		const a = Math.max(0, m.life / m.max);
		const sp = Math.hypot(m.vx, m.vy) || 1;
		const tx = m.x - m.vx / sp * m.len;
		const ty = m.y - m.vy / sp * m.len;
		ctx.save();
		ctx.strokeStyle = rgba(th.sun, a * .32);
		ctx.lineWidth = 2.1;
		ctx.beginPath();
		ctx.moveTo(tx, ty);
		ctx.lineTo(m.x, m.y);
		ctx.stroke();
		ctx.strokeStyle = rgba("255,248,230", a * .88);
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(tx + (m.x - tx) * .5, ty + (m.y - ty) * .5);
		ctx.lineTo(m.x, m.y);
		ctx.stroke();
		ctx.fillStyle = rgba("255,252,245", a);
		ctx.beginPath();
		ctx.arc(m.x, m.y, 1.1, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	}
}
function robotFrame(atlas, s) {
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
function render(ctx, s, atlas) {
	const heat = s.mode === "title" ? .06 : s.heat;
	const th = themeAt(heat);
	const t = s.elapsed;
	ctx.save();
	if (s.shake > .02) {
		const mag = s.shake * s.shake * 11;
		ctx.translate((Math.random() - .5) * mag, (Math.random() - .5) * mag * .6);
	}
	const sky = ctx.createLinearGradient(0, 0, 0, 268);
	sky.addColorStop(0, rgb(th.skyTop));
	sky.addColorStop(1, rgb(th.skyBot));
	ctx.fillStyle = sky;
	ctx.fillRect(0, 0, 840, 340);
	drawSun(ctx, th, heat);
	const scroll = s.distance;
	ridge(ctx, th.far, 258, 36, 200, scroll * .07);
	drawScenery(ctx, atlas, s);
	ridge(ctx, th.mid, 264, 54, 148, scroll * .16);
	pylons(ctx, th.mid, scroll * .16, heat);
	drawMeteors(ctx, s, th);
	ctx.fillStyle = rgb(th.rail);
	ctx.fillRect(0, 268, 840, 5);
	ctx.fillStyle = rgba(th.ink, .55);
	const go = scroll % 32;
	for (let x = -32; x < 872; x += 32) ctx.fillRect(x - go, 276, 16, 3);
	ctx.fillStyle = rgba(th.ink, .28);
	for (let x = -44; x < 884; x += 44) ctx.fillRect(x - go * 1.2 + 18, 286, 4, 4);
	ctx.fillStyle = rgba(th.ink, .14);
	ctx.fillRect(0, 273, 840, 72);
	if (heat > .38) {
		ctx.strokeStyle = rgba(th.heatAccent, (heat - .38) * .5);
		ctx.lineWidth = 1.3;
		for (let i = 0; i < 7; i++) {
			const cx = (i * 139 + scroll * .45) % 890 - 20;
			ctx.beginPath();
			ctx.moveTo(cx, 272);
			ctx.lineTo(cx + 11, 281);
			ctx.lineTo(cx + 24, 274);
			ctx.stroke();
		}
	}
	for (const o of s.obstacles) drawObstacle(ctx, atlas, o, t);
	for (const p of s.particles) {
		ctx.fillStyle = rgba(p.color, Math.max(0, p.life / p.max) * .8);
		ctx.fillRect(p.x, p.y, p.size, p.size);
	}
	const robot = robotFrame(atlas, s);
	if (s.mode === "over" && s.flash > 0 && Math.floor(s.flash * 18) % 2 === 0) ctx.globalCompositeOperation = "lighter";
	const dim = sized(robot, 78, 64);
	blitCrop(ctx, robot, 86 + (78 - dim.w) / 2, s.playerY, dim.w, dim.h, s.squashX, s.squashY);
	ctx.globalCompositeOperation = "source-over";
	if (heat > .52) {
		const va = (heat - .52) / .48 * .4;
		const vg = ctx.createRadialGradient(420, 170, 340 * .18, 420, 170, 520.8);
		vg.addColorStop(0, rgba(th.heatAccent, 0));
		vg.addColorStop(1, rgba(th.heatAccent, va));
		ctx.fillStyle = vg;
		ctx.fillRect(0, 0, 840, 340);
	}
	ctx.restore();
}
function GameStage() {
	const canvasRef = (0, import_react.useRef)(null);
	const wrapRef = (0, import_react.useRef)(null);
	const sessionRef = (0, import_react.useRef)(null);
	const atlasRef = (0, import_react.useRef)(null);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [ui, setUi] = (0, import_react.useState)({
		mode: "title",
		score: 0,
		best: 0,
		playsLeft: 3,
		newBest: false,
		heat: 0,
		obstacleCount: 0
	});
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		const wrap = wrapRef.current;
		if (!canvas || !wrap) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		let cancelled = false;
		let raf = 0;
		const session = createSession();
		sessionRef.current = session;
		const fit = () => {
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			canvas.style.width = `${wrap.clientWidth}px`;
			canvas.style.height = `${Math.round(wrap.clientWidth * (340 / 840))}px`;
			canvas.width = Math.round(840 * dpr);
			canvas.height = Math.round(340 * dpr);
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			ctx.imageSmoothingEnabled = false;
		};
		fit();
		const ro = new ResizeObserver(fit);
		ro.observe(wrap);
		const onKey = (e) => {
			if (e.code !== "Space" && e.code !== "ArrowUp") return;
			e.preventDefault();
			unlockAudio();
			if (session.mode === "playing") requestJump(session);
			else if (session.playsLeft > 0 && atlasRef.current) {
				sfxStart();
				startRun(session);
				setUi(hud(session));
			}
		};
		window.addEventListener("keydown", onKey);
		loadAtlas().then((atlas) => {
			if (cancelled) return;
			atlasRef.current = atlas;
			setReady(true);
			setUi(hud(session));
			let last = performance.now();
			let uiAcc = 0;
			const loop = (now) => {
				const dt = Math.min((now - last) / 1e3, .05);
				last = now;
				tick(session, dt);
				for (const ev of session.events) {
					if (ev === "jump") sfxJump();
					if (ev === "land") sfxLand();
					if (ev === "crash") sfxCrash();
				}
				render(ctx, session, atlas);
				uiAcc += dt;
				if (uiAcc > .08) {
					uiAcc = 0;
					setUi(hud(session));
				}
				window.__gameDebug = {
					obstacles: session.obstacles.length,
					score: Math.floor(session.score),
					running: session.mode === "playing",
					mode: session.mode,
					sceneryX: session.scenery.slice(0, 3).map((sc) => Math.round(sc.at - session.distance * .055)),
					meteors: session.meteors.length,
					hasShip: Boolean(atlas.shipA?.[0]?.naturalWidth)
				};
				raf = requestAnimationFrame(loop);
			};
			raf = requestAnimationFrame(loop);
		});
		return () => {
			cancelled = true;
			cancelAnimationFrame(raf);
			window.removeEventListener("keydown", onKey);
			ro.disconnect();
			sessionRef.current = null;
		};
	}, []);
	const act = () => {
		unlockAudio();
		const s = sessionRef.current;
		if (!s || !atlasRef.current) return;
		if (s.mode === "playing") requestJump(s);
		else if (s.playsLeft > 0) {
			sfxStart();
			startRun(s);
			setUi(hud(s));
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "w-full",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref: wrapRef,
			className: "relative overflow-hidden rounded-xl border border-border bg-surface shadow-[0_28px_70px_rgba(0,0,0,0.5)]",
			style: { touchAction: "none" },
			onPointerDown: act,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
					ref: canvasRef,
					className: "block h-auto w-full"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between px-4 pt-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-[10px] tracking-[0.22em] text-fg/80 uppercase",
						children: "Takeover"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-end gap-4 font-mono text-[11px] tabular-nums text-fg",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted",
							children: ["HI ", String(ui.best).padStart(4, "0")]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-lg leading-none tracking-tight",
							children: String(ui.score).padStart(4, "0")
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pointer-events-none absolute right-4 top-11 flex gap-1.5",
					children: Array.from({ length: 3 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block h-1.5 w-3.5",
						style: { background: i < ui.playsLeft ? "var(--color-fg)" : "color-mix(in oklab, var(--color-fg) 18%, transparent)" }
					}, i))
				}),
				ui.mode !== "playing" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pointer-events-none absolute inset-0 flex items-end justify-start p-4 sm:p-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pointer-events-auto w-full max-w-sm rounded-lg border border-border bg-bg/90 px-5 py-5 sm:px-6",
						children: [ui.mode === "title" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-[10px] tracking-[0.22em] text-muted uppercase",
								children: "Last clean process"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "font-display mt-2 text-4xl leading-none tracking-[-0.03em] text-fg italic sm:text-5xl",
								children: "Fast Thinking"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm leading-relaxed text-muted",
								children: "Jump rocks, crystals, and hunters. Three reboots. Score is distance."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "mt-5 rounded-md",
								size: "lg",
								type: "button",
								disabled: !ready,
								children: ready ? "Run" : "Loading"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-xs text-subtle",
								children: "Space or tap to jump"
							})
						] }), ui.mode === "over" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-[10px] tracking-[0.22em] text-muted uppercase",
								children: "Process terminated"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display mt-2 text-5xl tracking-[-0.03em] text-fg italic",
								children: ui.score
							}),
							ui.newBest && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 font-mono text-[10px] tracking-[0.16em] text-fg uppercase",
								children: "New high"
							}),
							ui.playsLeft > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-3 text-sm text-muted",
								children: [
									ui.playsLeft,
									" reboot",
									ui.playsLeft === 1 ? "" : "s",
									" left"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "mt-4 rounded-md",
								size: "lg",
								type: "button",
								children: "Retry"
							})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-4 text-sm text-muted",
								children: [
									"Best ",
									ui.best,
									". No reboots left."
								]
							})
						] })]
					})
				})
			]
		})
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "flex min-h-dvh flex-col bg-bg text-fg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-6 sm:px-8 sm:py-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameStage, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-center text-xs text-subtle",
				children: "One button. Increasing speed. Distance is the score."
			})]
		})
	});
}
//#endregion
export { Home as component };
