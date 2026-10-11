import { motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from "motion/react";

/**
 * Original topographic artwork — hand-built SVG contour lines and layered
 * terrain silhouettes (no image assets). Layer depth is driven by an external
 * scroll progress value (the pinned hero wrapper) so the terrain separates at
 * different rates as the page scrolls — the "changing visual depth" state
 * transition from Reference A.
 */

function contourPath(y: number, amp: number, phase: number): string {
  const pts: string[] = [];
  const width = 1520;
  const steps = 8;
  for (let i = 0; i <= steps; i += 1) {
    const x = -40 + (width / steps) * i;
    const wobble =
      Math.sin(i * 0.9 + phase) * amp + Math.sin(i * 2.1 + phase * 1.7) * (amp * 0.32);
    pts.push(`${x.toFixed(1)} ${(y + wobble).toFixed(1)}`);
  }
  // Catmull-Rom-ish smoothing via quadratic midpoint joins.
  let d = `M ${pts[0]}`;
  for (let i = 1; i < pts.length - 1; i += 1) {
    const [x1, y1] = pts[i].split(" ").map(Number);
    const [x2, y2] = pts[i + 1].split(" ").map(Number);
    d += ` Q ${x1} ${y1} ${(x1 + x2) / 2} ${(y1 + y2) / 2}`;
  }
  const last = pts[pts.length - 1].split(" ").map(Number);
  d += ` L ${last[0]} ${last[1]}`;
  return d;
}

const CONTOURS = Array.from({ length: 13 }, (_, i) => ({
  d: contourPath(252 + i * 26, 10 + (i % 4) * 5, i * 0.7),
  opacity: 0.1 + (i % 5) * 0.045,
}));

export function TopographicArt({
  className = "",
  progress,
}: {
  className?: string;
  /** Scroll progress of the pinned hero wrapper, 0 → 1. */
  progress?: MotionValue<number>;
}) {
  const reduce = useReducedMotion();
  const fallback = useMotionValue(0);
  const source = progress ?? fallback;

  const farY = useTransform(source, [0, 1], [0, -34]);
  const midY = useTransform(source, [0, 1], [0, -84]);
  const nearY = useTransform(source, [0, 1], [0, -148]);
  const nearScale = useTransform(source, [0, 1], [1, 1.045]);
  const lineY = useTransform(source, [0, 1], [0, 54]);
  const lineOpacity = useTransform(source, [0, 0.7], [1, 0.4]);
  const mistOpacity = useTransform(source, [0, 1], [1, 1.7]);
  const wholeFade = useTransform(source, [0, 0.9], [1, 0.7]);

  const layer = (value: MotionValue<number>) => (reduce ? undefined : { y: value });

  return (
    <div className={`pointer-events-none ${className}`} aria-hidden="true">
      <motion.svg
        viewBox="0 0 1440 620"
        preserveAspectRatio="xMidYMax slice"
        className="h-full w-full"
        style={reduce ? undefined : { opacity: wholeFade }}
        fill="none"
      >
        <defs>
          <linearGradient id="ov-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1d251b" stopOpacity="0" />
            <stop offset="34%" stopColor="#2b3628" stopOpacity="0.85" />
            <stop offset="62%" stopColor="#35422f" />
            <stop offset="100%" stopColor="#40513b" />
          </linearGradient>
          <linearGradient id="ov-far" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4c6043" />
            <stop offset="100%" stopColor="#3c4c36" />
          </linearGradient>
          <linearGradient id="ov-mid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#44573c" />
            <stop offset="100%" stopColor="#33422e" />
          </linearGradient>
          <linearGradient id="ov-near" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2f3d2a" />
            <stop offset="100%" stopColor="#232d20" />
          </linearGradient>
          <linearGradient id="ov-mist" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e5d9b6" stopOpacity="0" />
            <stop offset="100%" stopColor="#e5d9b6" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        <rect width="1440" height="620" fill="url(#ov-sky)" />

        {/* Contour field — drifts against the ridges and thins with depth */}
        <motion.g style={layer(lineY)} stroke="#e5d9b6" strokeOpacity="0.5">
          <motion.g style={reduce ? undefined : { opacity: lineOpacity }}>
            {CONTOURS.map((c, i) => (
              <path key={i} d={c.d} strokeOpacity={c.opacity} strokeWidth="1" />
            ))}
          </motion.g>
        </motion.g>

        {/* Far ridge */}
        <motion.g style={layer(farY)}>
          <path
            d="M0 432 C 120 386, 214 408, 320 362 S 520 302, 640 332 S 880 252, 1010 288 S 1252 244, 1440 278 L1440 620 L0 620 Z"
            fill="url(#ov-far)"
            fillOpacity="0.85"
          />
          <path
            d="M0 432 C 120 386, 214 408, 320 362 S 520 302, 640 332 S 880 252, 1010 288 S 1252 244, 1440 278"
            stroke="#e5d9b6"
            strokeOpacity="0.22"
            strokeWidth="1.2"
          />
        </motion.g>

        {/* Mid ridge */}
        <motion.g style={layer(midY)}>
          <path
            d="M0 476 C 150 436, 262 474, 402 440 S 642 386, 792 420 S 1032 366, 1182 400 S 1330 380, 1440 396 L1440 620 L0 620 Z"
            fill="url(#ov-mid)"
          />
          <path
            d="M0 476 C 150 436, 262 474, 402 440 S 642 386, 792 420 S 1032 366, 1182 400 S 1330 380, 1440 396"
            stroke="#e5d9b6"
            strokeOpacity="0.28"
            strokeWidth="1.2"
          />
          <path
            d="M180 468 C 300 448, 380 462, 470 444"
            stroke="#e67e22"
            strokeOpacity="0.5"
            strokeWidth="1.4"
            strokeDasharray="5 9"
          />
        </motion.g>

        {/* Near ridge — rises fastest, as if walking into the terrain */}
        <motion.g style={layer(nearY)}>
          <motion.g style={reduce ? undefined : { scale: nearScale, originY: 1 }}>
            <path
              d="M0 536 C 180 504, 322 550, 472 524 S 762 476, 922 506 S 1182 476, 1440 512 L1440 620 L0 620 Z"
              fill="url(#ov-near)"
            />
            <path
              d="M0 536 C 180 504, 322 550, 472 524 S 762 476, 922 506 S 1182 476, 1440 512"
              stroke="#e5d9b6"
              strokeOpacity="0.34"
              strokeWidth="1.3"
            />
            {/* Sparse "spot height" ticks, like a survey map */}
            {[
              [246, 528],
              [612, 512],
              [968, 500],
              [1268, 500],
            ].map(([x, y]) => (
              <g key={x} stroke="#e5d9b6" strokeOpacity="0.3">
                <path d={`M${x - 4} ${y} L${x + 4} ${y}`} />
                <path d={`M${x} ${y - 4} L${x} ${y + 4}`} />
              </g>
            ))}
          </motion.g>
        </motion.g>

        <motion.rect
          y="470"
          width="1440"
          height="150"
          fill="url(#ov-mist)"
          style={reduce ? undefined : { opacity: mistOpacity }}
        />
      </motion.svg>
    </div>
  );
}

/** Compact contour band used as a section divider / texture. */
export function ContourBand({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 120"
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      {Array.from({ length: 6 }, (_, i) => (
        <path
          key={i}
          d={contourPath(20 + i * 18, 8 + i * 2, i * 1.1)}
          stroke="currentColor"
          strokeOpacity={0.5 - i * 0.06}
          strokeWidth="1"
        />
      ))}
    </svg>
  );
}
