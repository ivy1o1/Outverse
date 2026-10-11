import { useEffect, useMemo, useRef } from "react";
import type { Mission } from "../types/mission";
import type { CardRect } from "./MissionCard";

type Props = {
  mission: Mission;
  rect: CardRect;
  onArrive: () => void;
  onDone: () => void;
};

/**
 * Mission selection transition, built on the React Bits ScrollExpand
 * mechanics (see docs/REFERENCE_RESEARCH.md, Reference F): the frame is
 * expanded purely with `clip-path: inset(...)` interpolation, progression
 * runs through smoothstep, and the loop uses the component's exponential
 * rAF smoothing (`k = 1 − e^(−1/(60·smoothing))`, smoothing = 0.1). The
 * official component is scroll-scrubbed; here the same loop is driven from
 * the selection moment (a documented adaptation — there is no scroll span
 * between two routes). The inner panel settles from a slight zoom, echoing
 * the official `mediaZoom → 1` settle at a text-friendly 1.12.
 */
const SMOOTHING = 0.1;
const START_RADIUS = 6;
const END_RADIUS = 0;
const ZOOM_START = 1.12;
const SETTLE_EPSILON = 0.0004;

const clamp = (v: number, a: number, b: number): number => (v < a ? a : v > b ? b : v);

const smoothstep = (edge0: number, edge1: number, x: number): number => {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1e-6), 0, 1);
  return t * t * (3 - 2 * t);
};

function targetGeometry() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = Math.min(vw * 0.9, 900);
  const height = Math.min(vh * 0.66, 620);
  const left = (vw - width) / 2;
  const top = Math.max(vh * 0.19, 120);
  return { left, top, width, height };
}

export function MissionExpansionOverlay({ mission, rect, onArrive, onDone }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const arrived = useRef(false);

  // Latest-callback ref (same pattern as the official ScrollExpand
  // propsRef) so parent re-renders never restart the rAF loop.
  const cbs = useRef({ onArrive, onDone });
  cbs.current = { onArrive, onDone };

  const frame = useMemo(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    return { vw, vh, target: targetGeometry() };
  }, []);
  const { vw, vh, target } = frame;

  const startInset =
    `inset(${rect.top}px ${vw - rect.left - rect.width}px ` +
    `${vh - rect.top - rect.height}px ${rect.left}px round ${START_RADIUS}px)`;

  useEffect(() => {
    const root = rootRef.current;
    const panel = panelRef.current;
    if (!root || !panel) return undefined;

    const start = [
      rect.top,
      vw - rect.left - rect.width,
      vh - rect.top - rect.height,
      rect.left,
    ];
    const end = [
      target.top,
      vw - target.left - target.width,
      vh - target.top - target.height,
      target.left,
    ];

    let doneTimer = 0;

    const apply = (p: number) => {
      const e = smoothstep(0, 1, p);
      const edges = start.map((s, i) => s + (end[i] - s) * e);
      const radius = START_RADIUS + (END_RADIUS - START_RADIUS) * e;
      root.style.clipPath =
        `inset(${edges[0]}px ${edges[1]}px ${edges[2]}px ${edges[3]}px round ${radius}px)`;
      panel.style.transform = `scale(${ZOOM_START + (1 - ZOOM_START) * e})`;
    };

    const finish = () => {
      if (arrived.current) return;
      arrived.current = true;
      cbs.current.onArrive();
      // Cleanup fallback: navigation normally unmounts the tree first.
      doneTimer = window.setTimeout(() => cbs.current.onDone(), 400);
    };

    const k = 1 - Math.exp(-1 / (60 * SMOOTHING));
    let current = 0;
    let raf = 0;

    const tick = () => {
      current += (1 - current) * k;
      if (1 - current < SETTLE_EPSILON) current = 1;
      apply(current);
      if (current === 1) {
        finish();
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(doneTimer);
    };
  }, [rect, frame, vw, vh, target]);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed inset-0 z-40"
      style={{ clipPath: startInset }}
      aria-hidden="true"
    >
      <div
        ref={panelRef}
        className="paper-texture absolute flex flex-col justify-center border border-ink/12 bg-parchment px-7 text-ink will-change-transform sm:px-12"
        style={{ left: target.left, top: target.top, width: target.width, height: target.height }}
      >
        <span className="label-caps mb-5 text-ember-ink">Mission briefing</span>
        <span className="block font-display text-[1.7rem] leading-[1.15] tracking-[-0.01em] sm:text-[2.1rem]">
          {mission.question}
        </span>
      </div>
    </div>
  );
}
