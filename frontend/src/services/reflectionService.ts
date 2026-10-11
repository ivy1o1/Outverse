import type { Mission } from "../types/mission";

/**
 * Mock reflection ("Gemma") service.
 *
 * Future FastAPI endpoint:
 *   POST /api/reflections/analyze  { mission, notes } -> { reflection: string }
 * The mock composes a grounded 2–3 line reflection that quotes the user's own
 * observations rather than inventing new ones. Swap the body for a fetch()
 * when the real model is wired in.
 */

export class ReflectionServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReflectionServiceError";
  }
}

const HEDGES = [
  "maybe",
  "might",
  "perhaps",
  "not sure",
  "unclear",
  "i think",
  "i guess",
  "possibly",
  "seems",
  "apparently",
  "probably",
  "unsure",
  "uncertain",
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldSimulateFailure(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).has("simulateError");
}

function tidy(fragment: string): string {
  return fragment
    .replace(/\s+/g, " ")
    .replace(/^[^\w"'“”‘’(]+/, "")
    .trim();
}

/** Split the user's notes into quotable fragments, longest-thought first. */
function fragmentsFrom(notes: string): string[] {
  const parts = notes
    .split(/(?<=[.!?])\s+|\n+/)
    .map(tidy)
    .filter((part) => part.length >= 12);

  const usable = parts.filter((part) => part.length <= 140);
  const list = usable.length > 0 ? usable : parts;

  return [...list].sort((a, b) => b.length - a.length).slice(0, 3);
}

function clip(text: string, max = 78): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}

const OPENERS = [
  (q: string) =>
    `You went looking after "${q.replace(/\?$/, "")}" — and what held you was smaller than the question itself.`,
  (q: string) =>
    `The question asked you to look outward, but your notes turn inward, toward detail: "${q.replace(/\?$/, "")}".`,
  (q: string) =>
    `Starting from "${q.replace(/\?$/, "")}", you let yourself be specific rather than thorough.`,
];

const FOLLOW_UPS = [
  (f: string) => `You kept returning to "${clip(f)}" — that seems to be where the noticing actually happened.`,
  (f: string) => `"${clip(f)}" is doing the quiet work in your notes: one observation carrying the rest with it.`,
  (f: string) => `The detail you describe — "${clip(f)}" — reads like something you would now recognise again anywhere.`,
  (f: string) => `You lingered on "${clip(f)}", which is the difference between glancing and looking.`,
];

const CLOSERS = [
  (pillarLine: string) =>
    `${pillarLine} What you recorded is evidence enough to keep questioning — not to settle the matter.`,
  (pillarLine: string) =>
    `${pillarLine} Leave it open; the second look is usually where the answer moves.`,
  (pillarLine: string) =>
    `${pillarLine} The uncertainty you kept is part of the observation, not a gap in it.`,
];

const PILLAR_LINES: Record<Mission["pillar"], string> = {
  hidden_patterns:
    "Repetition is easy to claim and harder to verify, and you were careful about the difference.",
  forgotten_stories:
    "Reading a past from a surface is guesswork built on real evidence, and your notes respect both halves.",
  invisible_systems:
    "Systems only show themselves at their edges, and you looked at an edge.",
  human_traces:
    "Traces of use carry many anonymous authors, and you avoided inventing a single one.",
};

export function analyzeReflection(
  mission: Mission,
  notes: string,
): Promise<{ reflection: string }> {
  return (async () => {
    await delay(1300 + Math.random() * 700);

    if (shouldSimulateFailure()) {
      throw new ReflectionServiceError(
        "The reflection service did not respond.",
      );
    }

    const fragments = fragmentsFrom(notes);
    const seed = Math.abs(
      [...mission.id].reduce((acc, ch) => acc + ch.charCodeAt(0), 0) +
        notes.length,
    );

    const opener = OPENERS[seed % OPENERS.length](mission.question);
    const followUp =
      fragments.length > 0
        ? FOLLOW_UPS[(seed + 1) % FOLLOW_UPS.length](fragments[0])
        : "Your notes are brief, and brevity here looks deliberate rather than empty.";

    const lowerNotes = notes.toLowerCase();
    const uncertain = HEDGES.some((h) => lowerNotes.includes(h));
    const pillarLine = PILLAR_LINES[mission.pillar] ?? "";
    const closerSeed = uncertain
      ? "What remains uncertain is not a flaw in your observation — it marks the edge of what looking can establish."
      : CLOSERS[(seed + 2) % CLOSERS.length](pillarLine);

    const reflection = [opener, followUp, closerSeed].join("\n");

    return { reflection };
  })();
}
