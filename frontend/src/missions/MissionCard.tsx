import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { X } from "lucide-react";
import { useCallback, useEffect, useRef, type KeyboardEvent, type MouseEvent, type PointerEvent } from "react";
import type { Mission } from "../types/mission";
import { getPillar } from "../pillars/pillarData";

export type CardRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

/**
 * Orbit card stack geometry, from the Componentry orbit-card-stack registry
 * source (see docs/REFERENCE_RESEARCH.md, Reference H): a tight overlapping
 * deck when closed, a fanned arc with a lifted active card when open.
 * `spread` is provided by the parent so the arc always fits the viewport.
 */
const FAN_Y = 30;
const FAN_ROT = 8.5;
const LIFT = 34;
const FLY_DISTANCE = 640;
const SWIPE_THRESHOLD = 110;
const EASE: [number, number, number, number] = [0.2, 0.8, 0.2, 1];
const ORBIT_DURATION = 0.42;

const OPACITY = [1, 0.92, 0.84, 0.76, 0.68];
const SHADOWS = [
  "0 30px 62px -30px rgba(0,0,0,0.68)",
  "0 22px 46px -26px rgba(0,0,0,0.58)",
  "0 16px 36px -24px rgba(0,0,0,0.5)",
  "0 12px 28px -20px rgba(0,0,0,0.45)",
  "0 10px 24px -18px rgba(0,0,0,0.42)",
];

type DeckPosition = { x: number; y: number; rotate: number };

function deckPosition(
  index: number,
  count: number,
  open: boolean,
  spread: number,
  active: boolean,
): DeckPosition {
  if (open) {
    const orbit = index - (count - 1) / 2;
    return {
      x: orbit * spread,
      y: Math.abs(orbit) * FAN_Y - (active ? LIFT : 0),
      rotate: orbit * FAN_ROT,
    };
  }
  return { x: index * 10, y: index * 5, rotate: index * 2.8 };
}

export type FrontApi = { flyOut: (direction: 1 | -1) => void };

type Props = {
  mission: Mission;
  /** Position in the remaining stack: 0 = front. */
  index: number;
  count: number;
  open: boolean;
  isActive: boolean;
  spread: number;
  zIndex: number;
  /** Focusable/announced: the front card when closed, every card when open. */
  interactive: boolean;
  reduce: boolean;
  onFocusCard: (index: number) => void;
  /** Reject routed through the stack so the fly-out plays before unmount. */
  onRejectRequest: (direction: 1 | -1) => void;
  onFlyOut: (id: string, direction: 1 | -1) => void;
  onSelect: (mission: Mission, rect: CardRect) => void;
  registerFrontApi: ((api: FrontApi | null) => void) | null;
};

export function MissionCard({
  mission,
  index,
  count,
  open,
  isActive,
  spread,
  zIndex,
  interactive,
  reduce,
  onFocusCard,
  onRejectRequest,
  onFlyOut,
  onSelect,
  registerFrontApi,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const pressed = useRef({ x: 0, y: 0 });
  const flying = useRef(false);
  const pillar = getPillar(mission.pillar);

  const initial = deckPosition(index, count, open, spread, isActive);
  const x = useMotionValue(initial.x);
  const y = useMotionValue(initial.y);
  const rotate = useMotionValue(initial.rotate);

  // Drag layer: swipe-reject is an Outverse extension layered over the
  // orbit-deck mechanics (spec §8), so it lives on an inner element and
  // never fights the deck/fan transforms.
  const dragX = useMotionValue(0);
  const dragRotate = useTransform(dragX, [-320, 0, 320], [-14, 0, 14]);
  const leftHint = useTransform(dragX, [-140, -30], [1, 0]);
  const rightHint = useTransform(dragX, [30, 140], [0, 1]);

  useEffect(() => {
    const target = deckPosition(index, count, open, spread, isActive);
    const duration = reduce ? 0 : ORBIT_DURATION;
    animate(x, target.x, { duration, ease: EASE });
    animate(y, target.y, { duration, ease: EASE });
    animate(rotate, target.rotate, { duration, ease: EASE });
  }, [index, count, open, spread, isActive, reduce, x, y, rotate]);

  const flyOut = useCallback(
    (direction: 1 | -1) => {
      if (flying.current) return;
      flying.current = true;
      if (reduce) {
        onFlyOut(mission.id, direction);
        return;
      }
      animate(dragX, direction * FLY_DISTANCE, { duration: 0.34, ease: [0.3, 0, 0.7, 0.4] });
      window.setTimeout(() => onFlyOut(mission.id, direction), 300);
    },
    [dragX, mission.id, onFlyOut, reduce],
  );

  useEffect(() => {
    if (!registerFrontApi) return;
    registerFrontApi({ flyOut });
    return () => registerFrontApi(null);
  }, [registerFrontApi, flyOut]);

  const captureRect = (): CardRect | null => {
    const el = cardRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
  };

  const handleSelect = () => {
    if (flying.current) return;
    const rect = captureRect();
    if (rect) onSelect(mission, rect);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    pressed.current = { x: event.clientX, y: event.clientY };
  };

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    // Ignore the synthetic click produced at the end of a drag gesture.
    const dx = Math.abs(event.clientX - pressed.current.x);
    const dy = Math.abs(event.clientY - pressed.current.y);
    if (dx > 8 || dy > 8) return;
    handleSelect();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!interactive || flying.current) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSelect();
    } else if (index === 0 && !open && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
      event.preventDefault();
      onRejectRequest(event.key === "ArrowRight" ? 1 : -1);
    }
  };

  const shadow = SHADOWS[Math.min(index, SHADOWS.length - 1)];
  const opacity = OPACITY[Math.min(index, OPACITY.length - 1)];
  const draggable = index === 0 && !reduce;

  return (
    <motion.div
      role="listitem"
      aria-hidden={!interactive}
      className="absolute inset-x-0 top-0 mx-auto h-full w-full max-w-[34rem] will-change-transform"
      style={{ x, y, rotate, zIndex, boxShadow: shadow }}
      initial={{ opacity: 0 }}
      animate={{ opacity }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <motion.div
        ref={cardRef}
        role="button"
        tabIndex={interactive ? 0 : -1}
        aria-label={`Mission: ${mission.question} — open briefing`}
        className="paper-texture flex h-full w-full cursor-pointer flex-col justify-between border border-ink/12 bg-parchment px-6 py-7 text-ink will-change-transform focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember sm:px-9 sm:py-10"
        style={{ x: draggable ? dragX : 0, rotate: draggable ? dragRotate : 0 }}
        drag={draggable ? "x" : false}
        dragConstraints={{ left: -FLY_DISTANCE, right: FLY_DISTANCE }}
        dragElastic={0.1}
        dragMomentum={false}
        onPointerDown={handlePointerDown}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onFocus={() => onFocusCard(index)}
        onDragEnd={(_, info) => {
          if (Math.abs(info.offset.x) > SWIPE_THRESHOLD) {
            flyOut(info.offset.x > 0 ? 1 : -1);
          } else {
            animate(dragX, 0, { duration: ORBIT_DURATION, ease: EASE });
          }
        }}
      >
        <div className="flex items-center justify-between">
          <span className="label-caps text-ember-ink">{pillar.title}</span>
          <span className="label-caps text-ink/75">Mission</span>
        </div>

        <div className="flex flex-1 items-center py-6">
          <span className="block font-display text-[1.4rem] leading-[1.18] tracking-[-0.01em] text-ink sm:text-[1.75rem]">
            {mission.question}
          </span>
        </div>

        <div className="flex items-end justify-between text-ink/75">
          <span className="text-[0.8rem] tracking-wide">
            {index === 0 ? "Swipe to pass · tap to open" : "\u00A0"}
          </span>
          <span className="label-caps">{mission.durationMinutes} min</span>
        </div>

        {index === 0 && !reduce && (
          <>
            <motion.span
              aria-hidden="true"
              style={{ opacity: leftHint }}
              className="label-caps pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 -rotate-12 border border-ink/30 px-3 py-1 text-ink/80"
            >
              Pass
            </motion.span>
            <motion.span
              aria-hidden="true"
              style={{ opacity: rightHint }}
              className="label-caps pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 rotate-12 border border-ink/30 px-3 py-1 text-ink/80"
            >
              Pass
            </motion.span>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

/** Accessible reject control shown below the stack. */
export function RejectButton({
  onReject,
  label,
}: {
  onReject: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onReject}
      aria-label={label}
      className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-parchment/25 text-parchment/70 transition-colors duration-300 hover:border-ember hover:text-ember"
    >
      <X size={20} aria-hidden="true" />
    </button>
  );
}
