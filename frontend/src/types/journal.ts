import type { Mission } from "./mission";

export type JournalEntry = {
  /** Stable id — intentionally identical to the mission id so re-analysis
   *  upserts the same entry instead of duplicating it. */
  id: string;
  mission: Mission;
  notes: string;
  reflection: string;
  analyzedAt: string;
  acceptedAt: string;
};

export function isJournalEntry(value: unknown): value is JournalEntry {
  if (typeof value !== "object" || value === null) return false;
  const e = value as Record<string, unknown>;
  return (
    typeof e.id === "string" &&
    typeof e.mission === "object" &&
    e.mission !== null &&
    typeof e.notes === "string" &&
    typeof e.reflection === "string" &&
    typeof e.analyzedAt === "string" &&
    typeof e.acceptedAt === "string"
  );
}
