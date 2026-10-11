import type { PillarId } from "../types/mission";

export type Pillar = {
  id: PillarId;
  index: string;
  title: string;
  /** Concise explanatory phrase shown on the home card. */
  tagline: string;
  /** One extra sentence used on the discovery page subtitle. */
  description: string;
  /** Motif key used by the illustrated contour artwork. */
  motif: "rings" | "strata" | "grid" | "trail";
};

export const PILLARS: Pillar[] = [
  {
    id: "hidden_patterns",
    index: "01",
    title: "Hidden Patterns",
    tagline: "Repetition, shape, and unexpected kinship.",
    description:
      "Look for the same gesture repeating across a place — a shape, a rhythm, a similarity nobody planned.",
    motif: "rings",
  },
  {
    id: "forgotten_stories",
    index: "02",
    title: "Forgotten Stories",
    tagline: "Traces of the past in ordinary places.",
    description:
      "Every ordinary corner keeps a record. Read the small evidence that a place has changed.",
    motif: "strata",
  },
  {
    id: "invisible_systems",
    index: "03",
    title: "Invisible Systems",
    tagline: "How the world quietly keeps working.",
    description:
      "Follow the infrastructure nobody notices: water, power, transport, signage, and the logic that connects them.",
    motif: "grid",
  },
  {
    id: "human_traces",
    index: "04",
    title: "Human Traces",
    tagline: "How people shape a space, quietly.",
    description:
      "Notice the marks left by use and care — worn paths, improvised repairs, and small adaptations.",
    motif: "trail",
  },
];

const PILLAR_BY_ID = new Map<string, Pillar>(PILLARS.map((p) => [p.id, p]));

export function getPillar(id: PillarId): Pillar {
  return PILLAR_BY_ID.get(id) ?? PILLARS[0];
}
