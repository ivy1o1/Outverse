import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type Props = {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  once?: boolean;
};

/** Word-by-word staggered entrance (inspired by React Bits Staggered Text). */
export function StaggeredText({
  text,
  className = "",
  delay = 0,
  stagger = 0.045,
  as: Tag = "p",
  once = true,
}: Props) {
  const reduce = useReducedMotion();
  const words = text.split(" ");

  return (
    <Tag className={className}>
      {/* Visually-hidden copy keeps the text readable to screen readers;
          aria-label is not allowed on paragraphs/spans. */}
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, i) => (
          <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom">
            <motion.span
              className="inline-block will-change-transform"
              initial={reduce ? { opacity: 0 } : { y: "108%", opacity: 0 }}
              whileInView={{ y: "0%", opacity: 1 }}
              viewport={{ once, margin: "-12% 0px -8% 0px" }}
              transition={{
                duration: reduce ? 0.35 : 0.75,
                delay: delay + i * stagger,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {word}
              {i < words.length - 1 ? "\u00A0" : ""}
            </motion.span>
          </span>
        ))}
      </span>
    </Tag>
  );
}

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
};

/** Generic scroll-triggered reveal for sections and cards. */
export function Reveal({ children, className = "", delay = 0, y = 28, once = true }: RevealProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-10% 0px -6% 0px" }}
      transition={{ duration: reduce ? 0.35 : 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
