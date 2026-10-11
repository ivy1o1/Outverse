import type { Difficulty, MissionStatus } from "../types/mission";

export function StatusPill({
  status,
  tone = "dark",
}: {
  status: MissionStatus;
  tone?: "dark" | "light";
}) {
  const map = {
    not_started: { label: "Not started", dot: "bg-current opacity-45" },
    in_progress: { label: "In progress", dot: "bg-ember" },
  } as const;
  const { label, dot } = map[status];
  const toneClass = tone === "light" ? "text-ink/80" : "text-parchment/70";
  return (
    <span className={`label-caps inline-flex items-center gap-2 ${toneClass}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden="true" />
      {label}
    </span>
  );
}

export function DifficultyPill({ difficulty }: { difficulty: Difficulty }) {
  const label = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  return (
    <span className="label-caps text-ink-soft border border-ink/15 rounded-full px-2.5 py-1">
      {label}
    </span>
  );
}
