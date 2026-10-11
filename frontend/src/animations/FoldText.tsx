import { motion, useReducedMotion } from "motion/react";
import type { ElementType } from "react";

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  stagger?: number;
  duration?: number;
};

/**
 * Fold-in letter reveal (inspired by React Bits "Fold Text").
 * Each glyph rotates up from a folded position with a staggered delay,
 * giving the wordmark a sense of anticipation.
 */
export function FoldText({
  text,
  as: Tag = "span",
  className = "",
  delay = 0,
  stagger = 0.055,
  duration = 0.95,
}: Props) {
  const reduce = useReducedMotion();
  const chars = [...text];

  return (
    <Tag className={`inline-block ${className}`} style={{ perspective: "760px" }}>
      {/* Accessible name via visually-hidden text: aria-label is prohibited on
          generic elements like spans, so we mirror the text instead. */}
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline-block">
        {chars.map((char, i) => (
          <motion.span
            key={`${char}-${i}`}
            className="inline-block will-change-transform"
            style={{ transformOrigin: "50% 88%" }}
            initial={
              reduce
                ? { opacity: 0 }
                : { rotateX: -92, opacity: 0, y: "0.16em" }
            }
            animate={
              reduce
                ? { opacity: 1 }
                : { rotateX: 0, opacity: 1, y: "0em" }
            }
            transition={{
              duration: reduce ? 0.4 : duration,
              delay: delay + i * stagger,
              ease: [0.19, 1, 0.22, 1],
            }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </span>
    </Tag>
  );
}
