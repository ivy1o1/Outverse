import { useRef, type ReactNode } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { FlowingMenu } from "../animations/FlowingMenu";
import { Reveal, StaggeredText } from "../animations/StaggeredText";
import { ContourBand } from "./TopographicArt";
import { Hero } from "./Hero";
import { IntroOverlay } from "./IntroOverlay";
import { ContourMotif } from "../pillars/ContourMotif";
import { PILLARS } from "../pillars/pillarData";

const STEPS = [
  {
    n: "01",
    title: "Choose a direction",
    body: "Four ways of attending to the world. Each one turns an ordinary walk into a set of questions.",
  },
  {
    n: "02",
    title: "Go and look",
    body: "Missions happen offline, without a camera or a map pin. All they ask for is a few attentive minutes.",
  },
  {
    n: "03",
    title: "Write, then reflect",
    body: "Record what you noticed. Gemma reads your notes carefully and returns a short reflection to keep.",
  },
];

/**
 * Gentle scroll-linked drift for individual editorial blocks — the scattered,
 * non-uniform parallax observed on the Bucks Sauce reference (each element
 * moves at its own rate and rotation). Restrained for text rows.
 */
function Drift({
  children,
  className = "",
  rate = 14,
  rotate = 0,
}: {
  children: ReactNode;
  className?: string;
  rate?: number;
  rotate?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [rate, -rate]);
  const r = useTransform(scrollYProgress, [0, 1], [rotate, -rotate]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={reduce ? undefined : { y, rotate: r }}
    >
      {children}
    </motion.div>
  );
}

export function HomePage() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  return (
    <div>
      <IntroOverlay />

      {/* Pinned hero; the subhero panel slides over it (Reference A) */}
      <div ref={wrapperRef} className="relative">
        <Hero progress={scrollYProgress} />

        <section
          className="relative z-10 -mt-16 flex min-h-[78svh] items-center rounded-t-[2rem] border-t border-parchment/15 bg-forest-shadow pb-16 pt-28 sm:-mt-20"
          aria-labelledby="begin-heading"
        >
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
            <Reveal>
              <p className="label-caps mb-6 text-ember-glow">Why look closer</p>
            </Reveal>
            <StaggeredText
              as="h2"
              text="Every ordinary place is holding something you have never once looked at."
              className="max-w-4xl font-display text-3xl leading-[1.12] text-parchment-soft sm:text-5xl"
            />
            <Reveal delay={0.15}>
              <p className="mt-8 max-w-2xl text-[1.02rem] leading-relaxed text-parchment/70">
                Outverse is a practice of attention. A mission hands you a
                question; the street hands back the evidence. What you notice —
                written down plainly, without embellishment — becomes the raw
                material for a quieter kind of thinking.
              </p>
            </Reveal>
            <Reveal delay={0.25}>
              <a
                href="#pillars"
                className="group mt-10 inline-flex items-center gap-3 text-[0.95rem] text-parchment/85 transition-colors hover:text-ember-glow"
              >
                <span className="label-caps">Choose a direction</span>
                <span
                  aria-hidden="true"
                  className="inline-block transition-transform duration-500 group-hover:translate-y-1"
                >
                  ↓
                </span>
              </a>
            </Reveal>
          </div>
        </section>
      </div>

      {/* Four exploration pillars — flowing editorial rows (References B + I) */}
      <section
        id="pillars"
        aria-labelledby="pillars-heading"
        className="relative mx-auto w-full max-w-7xl px-5 pb-8 pt-20 sm:px-8 sm:pt-28"
      >
        <div className="mb-12 flex flex-col gap-6 sm:mb-16 md:flex-row md:items-end md:justify-between">
          <div>
            <Reveal>
              <p className="label-caps mb-5 text-ember-glow">Four directions</p>
            </Reveal>
            <Reveal delay={0.08}>
              <h2
                id="pillars-heading"
                className="max-w-2xl font-display text-4xl leading-[1.06] text-parchment-soft sm:text-5xl"
              >
                Pick the question you want to carry today.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.16}>
            <p className="max-w-xs text-[0.95rem] leading-relaxed text-parchment/70">
              Each direction holds a stack of short missions. Nothing is
              compulsory — reject whatever doesn't fit the day.
            </p>
          </Reveal>
        </div>

        <div className="border-b border-parchment/12">
          <FlowingMenu
            items={PILLARS.map((pillar) => ({
              to: `/explore/${pillar.id}`,
              text: pillar.title,
              meta: pillar.index,
              preview: <ContourMotif pillar={pillar} />,
            }))}
            renderRow={(row, i) => (
              <Drift key={PILLARS[i].id} rate={10 + i * 4} rotate={i % 2 === 0 ? 0.35 : -0.35}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-8% 0px" }}
                  transition={{
                    duration: 0.7,
                    delay: i * 0.07,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {row}
                </motion.div>
              </Drift>
            )}
          />
        </div>

        <Reveal delay={0.1}>
          <p className="mt-6 max-w-md text-[0.88rem] leading-relaxed text-parchment/60">
            Hidden Patterns · Forgotten Stories · Invisible Systems · Human
            Traces — each row opens that direction's stack of five.
          </p>
        </Reveal>
      </section>

      {/* Method strip */}
      <section
        aria-labelledby="method-heading"
        className="relative mt-16 overflow-hidden border-y border-parchment/12 bg-forest-deep py-20 sm:mt-24 sm:py-28"
      >
        <ContourBand className="pointer-events-none absolute inset-x-0 top-0 h-28 w-full text-parchment/25" />
        <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-8">
          <h2 id="method-heading" className="sr-only">
            How Outverse works
          </h2>
          <div className="grid gap-12 sm:grid-cols-3 sm:gap-10">
            {STEPS.map((step, i) => (
              <Reveal key={step.n} delay={i * 0.1}>
                <div className="border-t border-parchment/20 pt-6">
                  <span className="label-caps text-ember-glow">{step.n}</span>
                  <h3 className="mt-4 font-display text-2xl text-parchment-soft">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-[0.95rem] leading-relaxed text-parchment/70">
                    {step.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <ContourBand className="pointer-events-none absolute inset-x-0 bottom-0 h-28 w-full rotate-180 text-parchment/20" />
      </section>

      <section className="mx-auto w-full max-w-3xl px-5 py-24 text-center sm:px-8 sm:py-32">
        <Reveal>
          <p className="font-display text-2xl leading-snug text-parchment/85 sm:text-3xl">
            “The world is not short of wonders. It is short of attention.”
          </p>
          <p className="label-caps mt-6 text-parchment/65">Begin above ↑</p>
        </Reveal>
      </section>
    </div>
  );
}
