import type { ActiveMission, Mission, PillarId } from "../types/mission";
import { isActiveMission, isMission, isPillarId } from "../types/mission";
import type { JournalEntry } from "../types/journal";
import { isJournalEntry } from "../types/journal";

/**
 * Centralised, defensive local persistence.
 *
 * - localStorage: accepted missions, drafts, journal entries (device-local only).
 * - sessionStorage: intro-replay flag and the current discovery session.
 *
 * Every read is validated and every write is guarded. If browser storage is
 * unavailable (private mode, blocked cookies) the service falls back to an
 * in-memory store so the app keeps working within the session.
 */

const VERSION = 1;

const KEYS = {
  activeMissions: `outverse.v${VERSION}.activeMissions`,
  journal: `outverse.v${VERSION}.journal`,
  discovery: (pillar: PillarId) => `outverse.v${VERSION}.discovery.${pillar}`,
  missionCache: `outverse.v${VERSION}.missionCache`,
  introPlayed: `outverse.v${VERSION}.introPlayed`,
} as const;

export const INTRO_FLAG = KEYS.introPlayed;

/* -------------------------------------------------------------------------- */
/* Storage availability                                                        */
/* -------------------------------------------------------------------------- */

const memoryFallback = new Map<string, string>();

function storageOf(kind: "local" | "session"): Storage | null {
  try {
    const s = kind === "local" ? window.localStorage : window.sessionStorage;
    const probe = "__outverse_probe__";
    s.setItem(probe, "1");
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

let local: Storage | null | undefined;
let session: Storage | null | undefined;

function localStore(): Storage | null {
  if (local === undefined) local = storageOf("local");
  return local;
}

function sessionStore(): Storage | null {
  if (session === undefined) session = storageOf("session");
  return session;
}

export function isPersistentStorageAvailable(): boolean {
  return localStore() !== null;
}

function readRaw(kind: "local" | "session", key: string): string | null {
  try {
    const store = kind === "local" ? localStore() : sessionStore();
    if (!store) return memoryFallback.get(`${kind}:${key}`) ?? null;
    return store.getItem(key);
  } catch {
    return memoryFallback.get(`${kind}:${key}`) ?? null;
  }
}

function writeRaw(kind: "local" | "session", key: string, value: string): boolean {
  try {
    const store = kind === "local" ? localStore() : sessionStore();
    if (!store) {
      memoryFallback.set(`${kind}:${key}`, value);
      return false; // not durable
    }
    store.setItem(key, value);
    return true;
  } catch {
    memoryFallback.set(`${kind}:${key}`, value);
    return false;
  }
}

/** Never throws; returns parsed value or null on missing/malformed data. */
function readJson<T>(kind: "local" | "session", key: string): T | null {
  const raw = readRaw(kind, key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    // Malformed data is left untouched so a temporary glitch can never
    // destroy valid stored content on the next successful write.
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* Active missions                                                             */
/* -------------------------------------------------------------------------- */

export function loadActiveMissions(): ActiveMission[] {
  const data = readJson<unknown>("local", KEYS.activeMissions);
  if (!Array.isArray(data)) return [];
  return data.filter(isActiveMission);
}

export function saveActiveMissions(missions: ActiveMission[]): boolean {
  return writeRaw("local", KEYS.activeMissions, JSON.stringify(missions));
}

/* -------------------------------------------------------------------------- */
/* Journal                                                                     */
/* -------------------------------------------------------------------------- */

export function loadJournal(): JournalEntry[] {
  const data = readJson<unknown>("local", KEYS.journal);
  if (!Array.isArray(data)) return [];
  return data.filter(isJournalEntry);
}

export function saveJournal(entries: JournalEntry[]): boolean {
  return writeRaw("local", KEYS.journal, JSON.stringify(entries));
}

/* -------------------------------------------------------------------------- */
/* Discovery session (per pillar, tab-scoped)                                  */
/* -------------------------------------------------------------------------- */

export type DiscoveryState = {
  pillar: PillarId;
  /** Full mission objects for this discovery session (briefing source of truth). */
  missions: Mission[];
  /** Ids still in the stack, front card first. */
  remaining: string[];
  rejectedCount: number;
  updatedAt: string;
};

export function loadDiscovery(pillar: PillarId): DiscoveryState | null {
  const data = readJson<unknown>("session", KEYS.discovery(pillar));
  if (typeof data !== "object" || data === null) return null;
  const d = data as Record<string, unknown>;
  if (!isPillarId(d.pillar) || d.pillar !== pillar) return null;
  if (!Array.isArray(d.missions) || !d.missions.every(isMission)) return null;
  if (!Array.isArray(d.remaining) || !d.remaining.every((id) => typeof id === "string")) {
    return null;
  }
  if (typeof d.rejectedCount !== "number") return null;
  return {
    pillar,
    missions: d.missions,
    remaining: d.remaining,
    rejectedCount: d.rejectedCount,
    updatedAt: typeof d.updatedAt === "string" ? d.updatedAt : new Date().toISOString(),
  };
}

export function saveDiscovery(state: DiscoveryState): void {
  writeRaw("session", KEYS.discovery(state.pillar), JSON.stringify(state));
}

export function clearDiscovery(pillar: PillarId): void {
  try {
    const store = sessionStore();
    store?.removeItem(KEYS.discovery(pillar));
  } catch {
    /* ignore */
  }
}

/* -------------------------------------------------------------------------- */
/* Mission recall (so briefing / reflection deep links survive a refresh)      */
/* -------------------------------------------------------------------------- */

export function rememberMissions(missions: Mission[]): void {
  const existing = readJson<Record<string, Mission>>("session", KEYS.missionCache) ?? {};
  const next = { ...existing };
  for (const mission of missions) next[mission.id] = mission;
  // Keep the cache bounded.
  const keys = Object.keys(next);
  if (keys.length > 120) {
    for (const key of keys.slice(0, keys.length - 120)) delete next[key];
  }
  writeRaw("session", KEYS.missionCache, JSON.stringify(next));
}

export function recallMission(id: string): Mission | null {
  const cache = readJson<Record<string, unknown>>("session", KEYS.missionCache);
  if (!cache) return null;
  const candidate = cache[id];
  return isMission(candidate) ? candidate : null;
}

/* -------------------------------------------------------------------------- */
/* Session flags                                                               */
/* -------------------------------------------------------------------------- */

export function readFlag(key: string): boolean {
  return readRaw("session", key) === "true";
}

export function writeFlag(key: string, value: boolean): void {
  writeRaw("session", key, value ? "true" : "false");
}
