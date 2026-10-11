import type { Pillar } from "../pillars/pillarData";

/**
 * Distinct contour motif per pillar — drawn in SVG so nothing depends on
 * external image assets. Hover/focus states animate these via CSS.
 */
export function ContourMotif({ pillar, className = "" }: { pillar: Pillar; className?: string }) {
  const common = {
    className: `h-full w-full ${className}`,
    viewBox: "0 0 200 200",
    fill: "none",
    "aria-hidden": true as const,
  };

  if (pillar.motif === "rings") {
    return (
      <svg {...common}>
        {[26, 44, 62, 80, 96].map((r, i) => (
          <circle
            key={r}
            cx="100"
            cy="104"
            r={r}
            stroke="currentColor"
            strokeWidth="1"
            strokeOpacity={0.5 - i * 0.07}
            className="origin-center transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ))}
        <circle cx="128" cy="72" r="34" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="4 8" />
        <circle cx="70" cy="140" r="20" stroke="currentColor" strokeWidth="1" strokeOpacity="0.35" />
      </svg>
    );
  }

  if (pillar.motif === "strata") {
    return (
      <svg {...common}>
        {[30, 52, 74, 96, 118, 140, 162].map((y, i) => (
          <path
            key={y}
            d={`M-10 ${y} C 40 ${y - 12 + i * 2}, 78 ${y + 14}, 118 ${y - 6} S 186 ${y + 10}, 212 ${y - 4}`}
            stroke="currentColor"
            strokeWidth="1"
            strokeOpacity={0.48 - i * 0.05}
            className="transition-all duration-700 ease-out group-hover:translate-y-0.5"
          />
        ))}
        <path d="M118 60 L118 176" stroke="currentColor" strokeOpacity="0.4" strokeDasharray="3 6" />
      </svg>
    );
  }

  if (pillar.motif === "grid") {
    return (
      <svg {...common}>
        {Array.from({ length: 7 }, (_, i) => (
          <path
            key={`v${i}`}
            d={`M${20 + i * 27} 14 L${20 + i * 27} 186`}
            stroke="currentColor"
            strokeOpacity={i === 3 ? 0.5 : 0.22}
            strokeWidth={i === 3 ? 1.4 : 1}
          />
        ))}
        {Array.from({ length: 7 }, (_, i) => (
          <path
            key={`h${i}`}
            d={`M14 ${22 + i * 27} L186 ${22 + i * 27}`}
            stroke="currentColor"
            strokeOpacity={i === 2 ? 0.45 : 0.18}
            strokeWidth="1"
          />
        ))}
        <circle cx="101" cy="76" r="5" stroke="currentColor" strokeOpacity="0.7" />
        <path d="M101 76 L155 130" stroke="currentColor" strokeOpacity="0.5" strokeDasharray="3 5" />
      </svg>
    );
  }

  // trail
  return (
    <svg {...common}>
      <path
        d="M18 182 C 52 150, 44 118, 74 98 S 122 86, 132 58 S 158 26, 186 20"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeOpacity="0.55"
        strokeDasharray="6 9"
        className="transition-all duration-700 ease-out group-hover:[stroke-dasharray:4_6]"
      />
      <path
        d="M28 190 C 66 158, 60 128, 92 108 S 140 96, 150 66 S 172 40, 196 34"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.28"
      />
      <path
        d="M6 172 C 40 140, 30 110, 58 90"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.22"
      />
    </svg>
  );
}
