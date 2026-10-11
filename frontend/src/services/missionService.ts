import type { Mission, PillarId } from "../types/mission";
import { MISSION_POOLS } from "./missionCorpus";

/**
 * Mock mission generation service.
 *
 * The function signature mirrors the future FastAPI endpoint:
 *   POST /api/missions/generate  { pillar } -> { missions: Mission[] }
 * Replace the body of `generateMissions` with a fetch() call when the
 * backend ships; nothing in the UI layer needs to change.
 */

const BATCH_SIZE = 5;

export class MissionServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MissionServiceError";
  }
}

function randomId(): string {
  const c = globalThis.crypto as Crypto | undefined;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  return `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Testing hook: `?simulateError=1` in the URL makes generation fail. */
function shouldSimulateFailure(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).has("simulateError");
}

export function generateMissions(pillar: PillarId): Promise<Mission[]> {
  return (async () => {
    await delay(420 + Math.random() * 480);

    if (shouldSimulateFailure()) {
      throw new MissionServiceError(
        "The mission service is unavailable right now.",
      );
    }

    const pool = MISSION_POOLS[pillar];
    if (!pool || pool.length < BATCH_SIZE) {
      throw new MissionServiceError(
        "No missions available for this direction yet.",
      );
    }

    const now = new Date().toISOString();
    const batch = shuffle(pool)
      .slice(0, BATCH_SIZE)
      .map((seed) => ({ ...seed, id: randomId(), pillar, createdAt: now }));

    return batch;
  })();
}
