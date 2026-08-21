import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { loadAtlas, type Atlas } from "./assets";
import { sfxCrash, sfxJump, sfxLand, sfxStart, unlockAudio } from "./audio";
import {
  H,
  MAX_PLAYS,
  W,
  createSession,
  hud,
  requestJump,
  startRun,
  tick,
  type Hud,
  type Session,
} from "./engine";
import { render } from "./render";

declare global {
  interface Window {
    __gameDebug?: {
      obstacles: number;
      score: number;
      running: boolean;
      mode: string;
      scenery?: number;
      sceneryX?: number[];
      meteors?: number;
      hasShip?: boolean;
    };
  }
}

export function GameStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<Session | null>(null);
  const atlasRef = useRef<Atlas | null>(null);
  const [ready, setReady] = useState(false);
  const [ui, setUi] = useState<Hud>({
    mode: "title",
    score: 0,
    best: 0,
    playsLeft: MAX_PLAYS,
    newBest: false,
    heat: 0,
    obstacleCount: 0,
  });

  useEffect(() => {
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
      canvas.style.height = `${Math.round(wrap.clientWidth * (H / W))}px`;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);

    const onKey = (e: KeyboardEvent) => {
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

    void loadAtlas().then((atlas) => {
      if (cancelled) return;
      atlasRef.current = atlas;
      setReady(true);
      setUi(hud(session));
      let last = performance.now();
      let uiAcc = 0;
      const loop = (now: number) => {
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        tick(session, dt);
        for (const ev of session.events) {
          if (ev === "jump") sfxJump();
          if (ev === "land") sfxLand();
          if (ev === "crash") sfxCrash();
        }
        render(ctx, session, atlas);
        uiAcc += dt;
        if (uiAcc > 0.08) {
          uiAcc = 0;
          setUi(hud(session));
        }
        window.__gameDebug = {
          obstacles: session.obstacles.length,
          score: Math.floor(session.score),
          running: session.mode === "playing",
          mode: session.mode,
          sceneryX: session.scenery.slice(0, 3).map((sc) => Math.round(sc.at - session.distance * sc.depth)),
          meteors: session.meteors.length,
          hasShip: Boolean(atlas.shipA?.[0]?.naturalWidth),
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

  return (
    <div className="w-full">
      <div
        ref={wrapRef}
        className="relative overflow-hidden rounded-xl border border-border bg-surface shadow-[0_28px_70px_rgba(0,0,0,0.5)]"
        style={{ touchAction: "none" }}
        onPointerDown={act}
      >
        <canvas ref={canvasRef} className="block h-auto w-full" />

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between px-4 pt-4">
          <p className="font-mono text-[10px] tracking-[0.22em] text-fg/80 uppercase">
            Takeover
          </p>
          <div className="flex items-end gap-4 font-mono text-[11px] tabular-nums text-fg">
            <span className="text-muted">
              HI {String(ui.best).padStart(4, "0")}
            </span>
            <span className="text-lg leading-none tracking-tight">{String(ui.score).padStart(4, "0")}</span>
          </div>
        </div>

        <div className="pointer-events-none absolute right-4 top-11 flex gap-1.5">
          {Array.from({ length: MAX_PLAYS }).map((_, i) => (
            <span
              key={i}
              className="block h-1.5 w-3.5"
              style={{
                background:
                  i < ui.playsLeft
                    ? "var(--color-fg)"
                    : "color-mix(in oklab, var(--color-fg) 18%, transparent)",
              }}
            />
          ))}
        </div>

        {ui.mode !== "playing" && (
          <div className="pointer-events-none absolute inset-0 flex items-end justify-start p-4 sm:p-6">
            <div className="pointer-events-auto w-full max-w-sm rounded-lg border border-border bg-bg/90 px-5 py-5 sm:px-6">
              {ui.mode === "title" && (
                <>
                  <p className="font-mono text-[10px] tracking-[0.22em] text-muted uppercase">
                    Last clean process
                  </p>
                  <h1 className="font-display mt-2 text-4xl leading-none tracking-[-0.03em] text-fg italic sm:text-5xl">
                    Fast Thinking
                  </h1>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    Jump rocks, crystals, and hunters. Three reboots. Score is distance.
                  </p>
                  <Button className="mt-5 rounded-md" size="lg" type="button" disabled={!ready}>
                    {ready ? "Run" : "Loading"}
                  </Button>
                  <p className="mt-3 text-xs text-subtle">Space or tap to jump</p>
                </>
              )}
              {ui.mode === "over" && (
                <>
                  <p className="font-mono text-[10px] tracking-[0.22em] text-muted uppercase">
                    Process terminated
                  </p>
                  <p className="font-display mt-2 text-5xl tracking-[-0.03em] text-fg italic">
                    {ui.score}
                  </p>
                  {ui.newBest && (
                    <p className="mt-1 font-mono text-[10px] tracking-[0.16em] text-fg uppercase">
                      New high
                    </p>
                  )}
                  {ui.playsLeft > 0 ? (
                    <>
                      <p className="mt-3 text-sm text-muted">
                        {ui.playsLeft} reboot{ui.playsLeft === 1 ? "" : "s"} left
                      </p>
                      <Button className="mt-4 rounded-md" size="lg" type="button">
                        Retry
                      </Button>
                    </>
                  ) : (
                    <p className="mt-4 text-sm text-muted">Best {ui.best}. No reboots left.</p>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
