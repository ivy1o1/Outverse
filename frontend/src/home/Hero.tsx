import { motion, useReducedMotion, useTransform, type MotionValue } from "motion/react";
import { StaggeredText } from "../animations/StaggeredText";
import { TopographicArt } from "./TopographicArt";

/**
 * Cinematic pinned hero (Reference A technique — ZapConnect pins its hero
 * while the next section slides over it, with scroll-linked background
 * movement; see docs/REFERENCE_RESEARCH.md). The stage sticks for the length
 * of the wrapper; terrain layers separate at different rates and the
 * wordmark departs upward as the subhero panel covers it.
 *
 * The wordmark fold itself belongs to the session intro overlay; the hero
 * below is already settled when the overlay wipes away.
 */
export function Hero({ progress }: { progress: MotionValue<number> }) {
  const reduce = useReducedMotion();

  const wordmarkY = useTransform(progress, [0, 0.45], [0, -140]);
  const wordmarkOpacity = useTransform(progress, [0, 0.42], [1, 0]);
  const copyY = useTransform(progress, [0, 0.38], [0, -70]);
  const copyOpacity = useTransform(progress, [0, 0.36], [1, 0]);
  const cueOpacity = useTransform(progress, [0, 0.12], [1, 0]);

  return (
    <section className="sticky top-0 z-0 flex h-svh items-end justify-center overflow-hidden">
      <div className="atmosphere-texture absolute inset-0" aria-hidden="true" />
      <TopographicArt progress={progress} className="absolute inset-x-0 bottom-0 h-[72%] sm:h-[78%]" />

      <div className="relative mx-auto flex h-full w-full max-w-7xl flex-col justify-center px-5 pb-24 pt-24 sm:px-8">
        <motion.p
          className="label-caps mb-6 text-ember-glow sm:mb-8"
          style={reduce ? undefined : { y: copyY, opacity: copyOpacity }}
        >
          A field journal for the world in front of you
        </motion.p>

        <motion.h1
          className="font-display font-semibold leading-[0.92] tracking-[-0.02em] text-parchment-soft"
          style={{
            fontSize: "clamp(3.1rem, 13.5vw, 11.5rem)",
            ...(reduce ? {} : { y: wordmarkY, opacity: wordmarkOpacity }),
          }}
        >
          OUTVERSE
        </motion.h1>

        <motion.div
          className="mt-8 max-w-xl sm:mt-10"
          style={reduce ? undefined : { y: copyY, opacity: copyOpacity }}
        >
          <StaggeredText
            text="Look closer. Find the extraordinary in the ordinary."
            className="font-display text-2xl leading-snug text-parchment/90 sm:text-3xl"
          />
          <p className="mt-5 max-w-md text-[0.98rem] leading-relaxed text-parchment/70">
            Short missions for real streets, real rooms, real weather. Choose a
            direction below and step outside with a question.
          </p>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3"
        style={reduce ? {} : { opacity: cueOpacity }}
        aria-hidden="true"
      >
        <span className="label-caps text-parchment/70">Scroll</span>
        <span className="relative block h-12 w-px overflow-hidden bg-parchment/20">
          <motion.span
            className="absolute left-0 top-0 block h-4 w-px bg-ember"
            animate={reduce ? undefined : { y: [-18, 48] }}
            transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.div>
    </section>
  );
}
