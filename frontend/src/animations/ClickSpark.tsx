/**
 * Official React Bits ClickSpark drawing mechanics, adapted for Outverse.
 * Source: DavidHDev/react-bits — src/ts-default/Animations/ClickSpark/ClickSpark.tsx
 * (MIT + Commons Clause v1.0).
 *
 * Adaptation (documented in docs/REFERENCE_RESEARCH.md): the official
 * component wraps children and sparks on any click inside the wrapper. The
 * Outverse spec requires restrained sparks only on meaningful selections, so
 * the canvas mechanics are unchanged but the trigger is an imperative
 * `emit(x, y)` API exposed via ClickSparkHost — no wrapper around children.
 * Sparks are suppressed under prefers-reduced-motion.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

type Easing = "linear" | "ease-in" | "ease-out" | "ease-in-out";

interface Spark {
  x: number;
  y: number;
  angle: number;
  startTime: number;
}

type EmitFn = (x: number, y: number) => void;

const ClickSparkContext = createContext<EmitFn | null>(null);

export function useClickSpark(): EmitFn {
  const emit = useContext(ClickSparkContext);
  if (!emit) {
    throw new Error("useClickSpark must be used inside <ClickSparkHost>");
  }
  return emit;
}

type HostProps = {
  children: ReactNode;
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  easing?: Easing;
  extraScale?: number;
};

export function ClickSparkHost({
  children,
  sparkColor = "#e67e22",
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  easing = "ease-out",
  extraScale = 1.0,
}: HostProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<Spark[]>([]);

  const emit = useCallback<EmitFn>((x, y) => {
    const now = performance.now();
    const newSparks: Spark[] = Array.from({ length: sparkCount }, (_, i) => ({
      x,
      y,
      angle: (2 * Math.PI * i) / sparkCount,
      startTime: now,
    }));
    sparksRef.current.push(...newSparks);
  }, [sparkCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const resizeCanvas = () => {
      const { width, height } = document.documentElement.getBoundingClientRect();
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    };

    const handleResize = () => resizeCanvas();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, { passive: true });
    resizeCanvas();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const easeFunc = (t: number): number => {
      switch (easing) {
        case "linear":
          return t;
        case "ease-in":
          return t * t;
        case "ease-in-out":
          return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        default:
          return t * (2 - t);
      }
    };

    let animationId = 0;

    const draw = (timestamp: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      sparksRef.current = sparksRef.current.filter((spark: Spark) => {
        const elapsed = timestamp - spark.startTime;
        if (elapsed >= duration) {
          return false;
        }

        const progress = elapsed / duration;
        const eased = easeFunc(progress);

        const distance = eased * sparkRadius * extraScale;
        const lineLength = sparkSize * (1 - eased);

        const x1 = spark.x + distance * Math.cos(spark.angle);
        const y1 = spark.y + distance * Math.sin(spark.angle);
        const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
        const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

        ctx.strokeStyle = sparkColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        return true;
      });

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [sparkColor, sparkSize, sparkRadius, duration, easing, extraScale]);

  return (
    <ClickSparkContext.Provider value={emit}>
      {children}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 90,
        }}
      />
    </ClickSparkContext.Provider>
  );
}
