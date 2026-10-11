/**
 * Lenis smooth scrolling (Reference A — ZapConnect runs Lenis 1.3.x the same
 * way). Lenis animates native scroll, so motion/react's useScroll keeps
 * working. Disabled entirely under prefers-reduced-motion.
 * Docs: https://github.com/darkroomengineering/lenis (packages/react).
 */
import "lenis/dist/lenis.css";
import { ReactLenis } from "lenis/react";
import { useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();

  if (reduce) return <>{children}</>;

  return (
    <ReactLenis
      root
      options={{
        duration: 1.15,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.6,
      }}
    >
      {children}
    </ReactLenis>
  );
}
