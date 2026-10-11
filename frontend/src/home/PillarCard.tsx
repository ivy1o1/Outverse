import { motion, useReducedMotion } from "motion/react";
import { useNavigate } from "react-router-dom";
import type { Pillar } from "../pillars/pillarData";
import { ContourMotif } from "../pillars/ContourMotif";

type Treatment = {
  /** Composition differences so the four cards don't read as identical tiles. */
  offset: string;
  titleAlign: string;
  motifClass: string;
  hoverRotate: number;
  hoverShift: number;
  indexPosition: string;
  accentRule: string;
};

const TREATMENTS: Record<Pillar["motif"], Treatment> = {
  rings: {
    offset: "lg:mt-0",
    titleAlign: "items-start text-left",
    motifClass: "right-[-12%] top-[-14%] h-[130%] w-[95%] text-parchment",
    hoverRotate: -1.6,
    hoverShift: -6,
    indexPosition: "left-6 top-6",
    accentRule: "left-6 right-16 bottom-6",
  },
  strata: {
    offset: "lg:mt-16",
    titleAlign: "items-start text-left",
    motifClass: "inset-x-[-8%] bottom-[-10%] h-[85%] w-[116%] text-parchment",
    hoverRotate: 1.2,
    hoverShift: -8,
    indexPosition: "right-6 top-6",
    accentRule: "left-16 right-6 top-6",
  },
  grid: {
    offset: "lg:mt-0",
    titleAlign: "items-start text-left",
    motifClass: "right-[-6%] bottom-[-12%] h-[92%] w-[86%] text-moss-soft",
    hoverRotate: -0.9,
    hoverShift: -5,
    indexPosition: "left-6 bottom-6",
    accentRule: "left-6 right-6 bottom-14",
  },
  trail: {
    offset: "lg:mt-16",
    titleAlign: "items-start text-left",
    motifClass: "left-[-10%] top-[-8%] h-[115%] w-[110%] text-parchment",
    hoverRotate: 1.5,
    hoverShift: -7,
    indexPosition: "right-6 bottom-6",
    accentRule: "left-6 right-6 bottom-6",
  },
};

export function PillarCard({ pillar, index }: { pillar: Pillar; index: number }) {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const t = TREATMENTS[pillar.motif];

  return (
    <motion.article
      className={`group relative ${t.offset}`}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px -6% 0px" }}
      transition={{ duration: 0.72, delay: index * 0.09, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.button
        type="button"
        onClick={() => navigate(`/explore/${pillar.id}`)}
        whileTap={reduce ? undefined : { scale: 0.985 }}
        animate={
          reduce
            ? undefined
            : { rotate: 0, y: 0 }
        }
        whileHover={
          reduce
            ? undefined
            : { rotate: t.hoverRotate, y: t.hoverShift, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
        }
        className="relative flex h-[19rem] w-full flex-col justify-end overflow-hidden border border-parchment/15 bg-forest-veil/60 px-6 pb-12 pt-16 text-left transition-colors duration-500 hover:border-ember/60 sm:h-[21rem] sm:px-8 sm:pb-14"
      >
        <span className="sr-only">Explore: </span>
        {/* Contour motif */}
        <div
          className={`pointer-events-none absolute ${t.motifClass} opacity-30 transition-all duration-700 ease-out group-hover:opacity-60`}
        >
          <ContourMotif pillar={pillar} />
        </div>

        {/* Warm wash on hover */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-shadow/85 via-forest-shadow/25 to-transparent"
        />

        {/* Index number */}
        <span
          className={`label-caps absolute ${t.indexPosition} text-parchment/70 transition-colors duration-500 group-hover:text-ember-glow`}
        >
          {pillar.index}
        </span>

        <div className={`relative flex flex-col ${t.titleAlign}`}>
          <h3 className="font-display text-[2rem] leading-[1.03] text-parchment-soft transition-transform duration-500 group-hover:translate-x-1 sm:text-[2.35rem]">
            {pillar.title}
          </h3>
          <p className="mt-3 max-w-[22rem] text-[0.95rem] leading-relaxed text-parchment/70">
            {pillar.tagline}
          </p>
        </div>

        {/* Accent rule that draws itself on hover/focus */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute h-px origin-left scale-x-[0.18] bg-ember opacity-40 transition-transform duration-[600ms] ease-out group-hover:scale-x-100 group-hover:opacity-100 group-focus-visible:scale-x-100 ${t.accentRule}`}
        />
      </motion.button>
    </motion.article>
  );
}
