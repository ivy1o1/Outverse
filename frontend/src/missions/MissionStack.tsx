import { AnimatePresence, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState, type FocusEvent, type KeyboardEvent, type MouseEvent } from "react";
import type { Mission } from "../types/mission";
import { MissionCard, RejectButton, type CardRect, type FrontApi } from "./MissionCard";

type Props = {
  missions: Mission[];
  remaining: string[];
  onReject: (id: string, direction: 1 | -1) => void;
  onSelect: (mission: Mission, rect: CardRect) => void;
};

/**
 * Five overlapping mission cards laid out with the Componentry orbit-card-stack
 * mechanics: a closed deck at rest, a fanned arc with a lifted active card on
 * hover/focus (desktop pointers). Swipe-to-reject and click-to-open are
 * Outverse extensions required by the product spec (§8 / mission workflow).
 */
export function MissionStack({ missions, remaining, onReject, onSelect }: Props) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [spread, setSpread] = useState(128);
  const rootRef = useRef<HTMLDivElement>(null);
  const frontApi = useRef<FrontApi | null>(null);

  const canHover = useMemo(
    () => window.matchMedia?.("(hover: hover) and (pointer: fine)").matches ?? false,
    [],
  );

  const byId = new Map(missions.map((m) => [m.id, m]));
  const visible = remaining
    .map((id) => byId.get(id))
    .filter((m): m is Mission => Boolean(m))
    .slice(0, 5);
  const count = visible.length;

  // Fan spread shrinks on narrow viewports so the open arc never leaves the page.
  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth;
      const cardWidth = Math.min(vw - 40, 544);
      const max = (vw / 2 - 28 - cardWidth / 2) / 2;
      setSpread(Math.max(34, Math.min(128, max)));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const openFan = useCallback(() => setOpen(true), []);
  const closeFan = useCallback(() => {
    setOpen(false);
    setActive(0);
  }, []);

  const handleFocusCard = useCallback((index: number) => {
    setOpen(true);
    setActive(index);
  }, []);

  const registerFrontApi = useCallback((api: FrontApi | null) => {
    frontApi.current = api;
  }, []);

  const requestReject = useCallback((direction: 1 | -1) => {
    frontApi.current?.flyOut(direction);
  }, []);

  const handleFlyOut = useCallback(
    (id: string, direction: 1 | -1) => {
      onReject(id, direction);
    },
    [onReject],
  );

  const containsTarget = (event: FocusEvent | MouseEvent) =>
    Boolean(rootRef.current?.contains(event.relatedTarget as Node | null));

  const handleMouseLeave = (event: MouseEvent<HTMLDivElement>) => {
    if (!containsTarget(event)) closeFan();
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!containsTarget(event)) closeFan();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!open || count === 0) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      setActive((current) => Math.min(current + 1, count - 1));
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      setActive((current) => Math.max(current - 1, 0));
    } else if (event.key === "Escape") {
      closeFan();
    }
  };

  return (
    <>
      <div
        ref={rootRef}
        role="list"
        aria-label="Mission stack"
        className="relative h-[19rem] w-full max-w-[34rem] sm:h-[21.5rem]"
        onMouseEnter={canHover ? openFan : undefined}
        onMouseLeave={canHover ? handleMouseLeave : undefined}
        onFocusCapture={openFan}
        onBlurCapture={handleBlur}
        onKeyDown={handleKeyDown}
      >
        <AnimatePresence initial={true}>
          {visible.map((mission, index) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              index={index}
              count={count}
              open={open}
              isActive={index === active}
              spread={spread}
              zIndex={10 - (open ? Math.abs(index - active) : index)}
              interactive={open || index === 0}
              reduce={Boolean(reduce)}
              onFocusCard={handleFocusCard}
              onRejectRequest={requestReject}
              onFlyOut={handleFlyOut}
              onSelect={onSelect}
              registerFrontApi={index === 0 ? registerFrontApi : null}
            />
          ))}
        </AnimatePresence>
      </div>

      <p aria-live="polite" className="sr-only">
        {open
          ? `Stack fanned. Card ${active + 1} of ${count} active. Use arrow keys to browse, Enter to open, Escape to close.`
          : ""}
      </p>
    </>
  );
}

export function StackControls({
  remainingCount,
  onReject,
}: {
  remainingCount: number;
  onReject: (direction: 1 | -1) => void;
}) {
  return (
    <div className="mt-16 flex flex-col items-center gap-4">
      <div className="flex items-center gap-5">
        <RejectButton onReject={() => onReject(-1)} label="Pass on this mission (left)" />
        <span className="label-caps text-parchment/70">
          {remainingCount} in stack
        </span>
        <RejectButton onReject={() => onReject(1)} label="Pass on this mission (right)" />
      </div>
      <p className="text-[0.85rem] text-parchment/65">
        Swipe a card, or use the buttons — both pass. Tap the front card to open it.
        On a desktop, hover the stack to fan all five.
      </p>
    </div>
  );
}
