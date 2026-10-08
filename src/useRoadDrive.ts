import { useEffect, useRef, type RefObject } from "react";

/**
 * Drives the timeline cart. It is a small simulation, not a CSS transition:
 * position follows an eased path whose duration depends on the distance, and
 * everything else (wheel spin, lean, squash, bumps, speed lines, dust, the
 * scenery sliding by) is derived each frame from the real velocity and
 * acceleration. Groceries drop into the basket as the cart passes each stop and
 * confetti goes off on arrival.
 */

type Particle = {
  kind: "dust" | "confetti";
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  size: number;
  rot: number;
  spin: number;
  color: string;
};

const GROUND = 95; // y of the road's centre line inside .tl-road
const WHEEL_RADIUS = 7.2;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

export type RoadEngine = {
  go: (index: number) => void;
  setColors: (colors: string[]) => void;
  destroy: () => void;
};

export function createRoadEngine(el: HTMLElement, canvas: HTMLCanvasElement, count: number, initial: number): RoadEngine {
  const cart = el.querySelector<HTMLElement>(".cart")!;
  const rig = el.querySelector<HTMLElement>(".cart-rig")!;
  const hop = el.querySelector<HTMLElement>(".cart-hop")!;
  const stops = Array.from(el.querySelectorAll<HTMLElement>(".stop"));
  const ctx = canvas.getContext("2d")!;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let palette = ["#e3261b", "#00382a", "#f6b531", "#f6f0db"];
  let w = 0;
  let edge = 60;
  let x = 0;
  let v = 0;
  let sa = 0;
  let wheel = 0;
  let face = 1;
  let faceCur = 1;
  let from = 0;
  let to = 0;
  let t0 = 0;
  let dur = 1000;
  let moving = false;
  let loaded = -1;
  let dust = 0;
  let raf = 0;
  let last = 0;
  let current = initial;
  const parts: Particle[] = [];

  const stopX = (i: number) => edge + (w - edge * 2) * (count > 1 ? i / (count - 1) : 0);

  const popStop = (i: number) => {
    const stop = stops[i];
    if (!stop) return;
    stop.removeAttribute("data-hit");
    void stop.offsetWidth;
    stop.setAttribute("data-hit", "");
  };

  const emitDust = () => {
    parts.push({
      kind: "dust",
      x: x - faceCur * 30 + (Math.random() - 0.5) * 10,
      y: GROUND + 4 + Math.random() * 3,
      vx: -face * (24 + Math.random() * 46),
      vy: -(8 + Math.random() * 26),
      age: 0,
      life: 0.5 + Math.random() * 0.35,
      size: 3 + Math.random() * 3,
      rot: 0,
      spin: 0,
      color: palette[1],
    });
  };

  const confetti = (cx: number) => {
    for (let i = 0; i < 22; i += 1) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 2.1;
      const speed = 170 + Math.random() * 260;
      parts.push({
        kind: "confetti",
        x: cx,
        y: GROUND - 14,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        age: 0,
        life: 0.9 + Math.random() * 0.6,
        size: 4 + Math.random() * 4,
        rot: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 16,
        color: palette[Math.floor(Math.random() * palette.length)],
      });
    }
  };

  const arrive = () => {
    moving = false;
    x = to;
    el.removeAttribute("data-moving");
    popStop(current);
    hop.classList.remove("hop");
    void hop.offsetWidth;
    hop.classList.add("hop");
    if (!reduce) confetti(x);
  };

  const paint = (dx: number, dt: number) => {
    const speed = Math.abs(v);
    const lean = clamp(-sa / 9000, -1, 1) * 7 * faceCur;
    const stretch = 1 + clamp(speed / 5200, 0, 0.07);
    const bump = Math.abs(Math.sin(x * 0.11)) * clamp(speed / 450, 0, 1) * 2.6;
    cart.style.translate = `${x.toFixed(2)}px 0`;
    rig.style.translate = `0 ${(-bump).toFixed(2)}px`;
    rig.style.rotate = `${lean.toFixed(2)}deg`;
    rig.style.scale = `${(faceCur * stretch).toFixed(3)} ${(1 / stretch).toFixed(3)}`;
    cart.style.setProperty("--wheel", wheel.toFixed(1));
    cart.style.setProperty("--speed", clamp(speed / 650, 0, 1).toFixed(3));
    el.style.setProperty("--cam-near", (-x * 0.26).toFixed(1));
    el.style.setProperty("--cam-far", (-x * 0.11).toFixed(1));
    el.style.setProperty("--fill", `${Math.max(0, x).toFixed(1)}px`);

    let n = 0;
    for (let i = 0; i < count; i += 1) if (stopX(i) <= x + 6) n += 1;
    if (n !== loaded) {
      if (loaded >= 0 && n > loaded) popStop(n - 1);
      loaded = n;
      cart.dataset.n = String(n);
    }

    if (speed > 140) {
      dust += Math.abs(dx);
      while (dust > 15) {
        dust -= 15;
        emitDust();
      }
    }
    void dt;
  };

  const draw = (dt: number) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = parts.length - 1; i >= 0; i -= 1) {
      const p = parts[i];
      p.age += dt;
      if (p.age >= p.life) {
        parts.splice(i, 1);
        continue;
      }
      const t = p.age / p.life;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.kind === "confetti") {
        p.vy += 980 * dt;
        p.vx *= 0.992;
        p.rot += p.spin * dt;
        ctx.save();
        ctx.globalAlpha = 1 - t * t * t;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
        ctx.restore();
      } else {
        p.vx *= 0.95;
        ctx.globalAlpha = (1 - t) * 0.26;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size + t * 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
  };

  const loop = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    const prev = x;
    if (moving) {
      const p = Math.min(1, (now - t0) / dur);
      x = from + (to - from) * ease(p);
      if (p >= 1) arrive();
    }
    const dx = x - prev;
    const nv = dx / dt;
    sa += ((nv - v) / dt - sa) * 0.12;
    v = nv;
    wheel += (dx / WHEEL_RADIUS) * 57.2958;
    faceCur += (face - faceCur) * Math.min(1, dt * 14);
    if (!moving) sa *= 0.8;
    paint(dx, dt);
    draw(dt);
    const settling = Math.abs(faceCur - face) > 0.01 || Math.abs(sa) > 8;
    raf = moving || parts.length || settling ? requestAnimationFrame(loop) : 0;
  };

  const kick = () => {
    if (!raf) {
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }
  };

  const measure = () => {
    w = el.clientWidth;
    edge = parseFloat(getComputedStyle(el).getPropertyValue("--edge")) || 60;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(el.clientWidth * dpr);
    canvas.height = Math.round(el.clientHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!moving) {
      x = stopX(current);
      to = x;
      v = 0;
      paint(0, 0.016);
    }
  };

  const observer = new ResizeObserver(measure);
  observer.observe(el);
  measure();

  return {
    go(index) {
      if (index === current && !moving) return;
      current = index;
      const dest = stopX(index);
      if (reduce) {
        x = dest;
        to = dest;
        paint(0, 0.016);
        popStop(index);
        return;
      }
      from = x;
      to = dest;
      const dist = Math.abs(to - from);
      if (dist < 1) return;
      dur = clamp(0.85 + dist / 1000, 0.95, 2.1) * 1000;
      t0 = performance.now();
      moving = true;
      face = to > from ? 1 : -1;
      el.setAttribute("data-moving", "");
      kick();
    },
    setColors(colors) {
      palette = colors;
    },
    destroy() {
      cancelAnimationFrame(raf);
      observer.disconnect();
    },
  };
}

export function useRoadDrive(
  road: RefObject<HTMLElement | null>,
  canvas: RefObject<HTMLCanvasElement | null>,
  index: number,
  count: number,
  colors: string[],
) {
  const engine = useRef<RoadEngine | null>(null);
  const key = colors.join("|");

  useEffect(() => {
    const el = road.current;
    const cv = canvas.current;
    if (!el || !cv) return;
    const created = createRoadEngine(el, cv, count, index);
    engine.current = created;
    return () => {
      created.destroy();
      engine.current = null;
    };
    // The engine is created once per mount; later index changes go through go().
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [road, canvas, count]);

  useEffect(() => {
    engine.current?.go(index);
  }, [index]);

  useEffect(() => {
    engine.current?.setColors(key.split("|"));
  }, [key]);
}
