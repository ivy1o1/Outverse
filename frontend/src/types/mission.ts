export type PillarId =
  | "hidden_patterns"
  | "forgotten_stories"
  | "invisible_systems"
  | "human_traces";

export type Difficulty = "easy" | "moderate" | "challenging";

export type Mission = {
  id: string;
  pillar: PillarId;
  question: string;
  objective: string;
  instructions: string[];
  durationMinutes: number;
  difficulty: Difficulty;
  safetyNotes?: string[];
  createdAt: string;
};

export type MissionStatus = "not_started" | "in_progress";

export type ActiveMission = {
  mission: Mission;
  status: MissionStatus;
  acceptedAt: string;
  notes: string;
  updatedAt: string;
};

export const PILLAR_IDS: PillarId[] = [
  "hidden_patterns",
  "forgotten_stories",
  "invisible_systems",
  "human_traces",
];

export function isPillarId(value: unknown): value is PillarId {
  return (
    typeof value === "string" && (PILLAR_IDS as string[]).includes(value)
  );
}

const DIFFICULTIES: Difficulty[] = ["easy", "moderate", "challenging"];

export function isMission(value: unknown): value is Mission {
  if (typeof value !== "object" || value === null) return false;
  const m = value as Record<string, unknown>;
  return (
    typeof m.id === "string" &&
    isPillarId(m.pillar) &&
    typeof m.question === "string" &&
    typeof m.objective === "string" &&
    Array.isArray(m.instructions) &&
    m.instructions.every((step) => typeof step === "string") &&
    typeof m.durationMinutes === "number" &&
    typeof m.difficulty === "string" &&
    (DIFFICULTIES as string[]).includes(m.difficulty) &&
    typeof m.createdAt === "string"
  );
}

export function isActiveMission(value: unknown): value is ActiveMission {
  if (typeof value !== "object" || value === null) return false;
  const a = value as Record<string, unknown>;
  return (
    isMission(a.mission) &&
    (a.status === "not_started" || a.status === "in_progress") &&
    typeof a.acceptedAt === "string" &&
    typeof a.notes === "string" &&
    typeof a.updatedAt === "string"
  );
}
