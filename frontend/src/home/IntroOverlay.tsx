import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import FoldText from "../animations/fold-text/FoldText";
import { StaggeredText } from "../animations/StaggeredText";
import { ContourBand } from "./TopographicArt";
import { INTRO_FLAG, readFlag, writeFlag } from "../services/storageService";

/**
 * Session-scoped cinematic intro (Reference D — official FoldText port).
 * Plays the OUTVERSE wordmark fold once per browser tab; the sessionStorage
 * flag is written as soon as the intro starts, and reduced-motion users skip
 * straight to the settled hero. Failure never blocks the app: an error
 * boundary-less fallback renders static text if animation state misbehaves.
 */
export function IntroOverlay() {
  const reduce = useReducedMotion();
  const [play, setPlay] = useState(() => {
    try {
      return !readFlag(INTRO_FLAG);
    } catch {
      return false;
    }
  });
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!play) return;
    try {
      writeFlag(INTRO_FLAG, true);
    } catch {
      /* storage unavailable — intro simply may replay in a new session */
    }
    const hold = window.setTimeout(() => setLeaving(true), reduce ? 0 : 2350);
    return () => window.clearTimeout(hold);
  }, [play, reduce]);

  const shouldRender = play && !reduce;

  return (
    <AnimatePresence>
      {shouldRender && (
        <motion.div
          className="fixed inset-0 z-80 flex flex-col items-center justify-center overflow-hidden bg-forest-shadow"
          initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
          animate={
            leaving
              ? { clipPath: "inset(0% 0% 100% 0%)" }
              : { clipPath: "inset(0% 0% 0% 0%)" }
          }
          exit={{ opacity: 0 }}
          transition={
            leaving
              ? { duration: 0.75, ease: [0.65, 0, 0.35, 1] }
              : { duration: 0.2 }
          }
          onAnimationComplete={() => {
            if (leaving) setPlay(false);
          }}
          aria-hidden={leaving}
        >
          <ContourBand className="pointer-events-none absolute inset-x-0 bottom-0 h-36 w-full text-parchment/15" />
          <div className="atmosphere-texture pointer-events-none absolute inset-0" />

          <div className="relative flex flex-col items-center px-6 text-center">
            <motion.p
              className="label-caps mb-7 text-ember-glow"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              A field journal for the world in front of you
            </motion.p>

            <h1 className="sr-only">Outverse</h1>
            <div aria-hidden="true">
              <FoldText
                text="OUTVERSE"
                hinge="top"
                duration={1}
                stagger={0.05}
                perspective={725}
                fontWeight={600}
                color="var(--color-parchment-soft)"
                className="font-display tracking-[-0.02em]"
                style={{ fontSize: "clamp(3rem, 11vw, 8.5rem)" }}
              />
            </div>

            <div className="mt-9 max-w-xl">
              <StaggeredText
                text="Look closer. Find the extraordinary in the ordinary."
                delay={1.25}
                stagger={0.05}
                className="font-display text-xl leading-snug text-parchment/90 sm:text-2xl"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
