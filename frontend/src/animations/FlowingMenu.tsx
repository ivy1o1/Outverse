/**
 * Official React Bits FlowingMenu mechanics, adapted for Outverse.
 * Source: DavidHDev/react-bits — src/ts-default/Components/FlowingMenu/FlowingMenu.tsx
 * (MIT + Commons Clause v1.0).
 *
 * Adaptation (documented in docs/REFERENCE_RESEARCH.md): the marquee
 * "image" slot accepts arbitrary React content (Outverse renders each
 * pillar's contour motif strip), and rows render React Router links.
 * Closest-edge slide-in, infinite marquee, and easing are unchanged.
 */
import {
  useEffect,
  Fragment,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { gsap } from "gsap";
import { Link } from "react-router-dom";

import "./FlowingMenu.css";

export interface FlowingMenuItem {
  to: string;
  text: string;
  preview?: ReactNode;
  meta?: string;
}

export function FlowingMenu({
  items,
  renderRow,
}: {
  items: FlowingMenuItem[];
  /** Optional wrapper per row (entrance animations, parallax). Does not
   *  alter the menu mechanics themselves. */
  renderRow?: (children: ReactNode, index: number) => ReactNode;
}) {
  const rows = items.map((item, idx) => (
    <MenuItem key={item.to} item={item} isFirst={idx === 0} />
  ));
  return (
    <nav className="flowing-menu" aria-label="Exploration directions">
      {renderRow
        ? rows.map((row, idx) => (
            <Fragment key={items[idx].to}>{renderRow(row, idx)}</Fragment>
          ))
        : rows}
    </nav>
  );
}

function MenuItem({ item, isFirst }: { item: FlowingMenuItem; isFirst: boolean }) {
  const itemRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const marqueeInnerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);
  const [repetitions, setRepetitions] = useState(4);

  const animationDefaults: gsap.TweenVars = { duration: 0.6, ease: "expo" };

  const distMetric = (x: number, y: number, x2: number, y2: number): number => {
    const xDiff = x - x2;
    const yDiff = y - y2;
    return xDiff * xDiff + yDiff * yDiff;
  };

  const findClosestEdge = (
    mouseX: number,
    mouseY: number,
    width: number,
    height: number,
  ): "top" | "bottom" => {
    const topEdgeDist = distMetric(mouseX, mouseY, width / 2, 0);
    const bottomEdgeDist = distMetric(mouseX, mouseY, width / 2, height);
    return topEdgeDist < bottomEdgeDist ? "top" : "bottom";
  };

  useEffect(() => {
    const calculateRepetitions = () => {
      if (!marqueeInnerRef.current) return;
      const marqueeContent = marqueeInnerRef.current.querySelector(
        ".flowing-marquee__part",
      ) as HTMLElement | null;
      if (!marqueeContent) return;
      const contentWidth = marqueeContent.offsetWidth;
      const viewportWidth = window.innerWidth;
      const needed = Math.ceil(viewportWidth / contentWidth) + 2;
      setRepetitions(Math.max(4, needed));
    };

    calculateRepetitions();
    window.addEventListener("resize", calculateRepetitions);
    return () => window.removeEventListener("resize", calculateRepetitions);
  }, [item.text]);

  useEffect(() => {
    const setupMarquee = () => {
      if (!marqueeInnerRef.current) return;
      const marqueeContent = marqueeInnerRef.current.querySelector(
        ".flowing-marquee__part",
      ) as HTMLElement | null;
      if (!marqueeContent) return;
      const contentWidth = marqueeContent.offsetWidth;
      if (contentWidth === 0) return;

      if (animationRef.current) {
        animationRef.current.kill();
      }

      animationRef.current = gsap.to(marqueeInnerRef.current, {
        x: -contentWidth,
        duration: 15,
        ease: "none",
        repeat: -1,
      });
    };

    const timer = setTimeout(setupMarquee, 50);
    return () => {
      clearTimeout(timer);
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [item.text, repetitions]);

  const handleMouseEnter = (ev: React.MouseEvent<HTMLAnchorElement>) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const edge = findClosestEdge(x, y, rect.width, rect.height);

    gsap
      .timeline({ defaults: animationDefaults })
      .set(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" }, 0)
      .set(marqueeInnerRef.current, { y: edge === "top" ? "101%" : "-101%" }, 0)
      .to([marqueeRef.current, marqueeInnerRef.current], { y: "0%" }, 0);
  };

  const handleMouseLeave = (ev: React.MouseEvent<HTMLAnchorElement>) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const edge = findClosestEdge(x, y, rect.width, rect.height);

    gsap
      .timeline({ defaults: animationDefaults })
      .to(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" }, 0)
      .to(marqueeInnerRef.current, { y: edge === "top" ? "101%" : "-101%" }, 0);
  };

  return (
    <div
      className="flowing-menu__item"
      ref={itemRef}
      style={isFirst ? { borderTop: "none" } : undefined}
    >
      <Link
        className="flowing-menu__link"
        to={item.to}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <span className="flowing-menu__index label-caps">{item.meta}</span>
        <span className="flowing-menu__text">{item.text}</span>
        <span className="flowing-menu__arrow" aria-hidden="true">
          →
        </span>
      </Link>
      <div className="flowing-marquee">
        <div className="flowing-marquee__inner-wrap">
          <div className="flowing-marquee__inner" ref={marqueeInnerRef} aria-hidden="true">
            {[...Array(repetitions)].map((_, idx) => (
              <div className="flowing-marquee__part" key={idx}>
                <span>{item.text}</span>
                {item.preview ? <div className="flowing-marquee__figure">{item.preview}</div> : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
