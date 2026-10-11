import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ActiveMission, Mission } from "../types/mission";
import type { JournalEntry } from "../types/journal";
import * as storage from "../services/storageService";
import {
  AppStoreContext,
  type AcceptResult,
  type AppStoreValue,
} from "./appStoreContext";

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [activeMissions, setActiveMissions] = useState<ActiveMission[]>(() =>
    storage.loadActiveMissions(),
  );
  const [journal, setJournal] = useState<JournalEntry[]>(() =>
    storage.loadJournal(),
  );
  const [storageAvailable] = useState(() => storage.isPersistentStorageAvailable());

  // Persist only after the initial mount so we never clobber stored data
  // with an accidental empty first render.
  const hydrated = useRef(false);
  useEffect(() => {
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (hydrated.current) storage.saveActiveMissions(activeMissions);
  }, [activeMissions]);

  useEffect(() => {
    if (hydrated.current) storage.saveJournal(journal);
  }, [journal]);

  const acceptMission = useCallback(
    (mission: Mission): AcceptResult => {
      if (activeMissions.some((entry) => entry.mission.id === mission.id)) {
        return { ok: true, alreadyAccepted: true };
      }
      const now = new Date().toISOString();
      storage.rememberMissions([mission]);
      const next: ActiveMission = {
        mission,
        status: "not_started",
        acceptedAt: now,
        notes: "",
        updatedAt: now,
      };
      setActiveMissions((current) =>
        current.some((entry) => entry.mission.id === mission.id)
          ? current
          : [next, ...current],
      );
      return { ok: true, alreadyAccepted: false };
    },
    [activeMissions],
  );

  const updateNotes = useCallback((missionId: string, notes: string) => {
    const now = new Date().toISOString();
    setActiveMissions((current) => {
      if (!current.some((entry) => entry.mission.id === missionId)) return current;
      return current.map((entry) => {
        if (entry.mission.id !== missionId) return entry;
        const meaningful = notes.trim().length > 0;
        return {
          ...entry,
          notes,
          status:
            entry.status === "not_started" && meaningful
              ? "in_progress"
              : entry.status,
          updatedAt: now,
        };
      });
    });
  }, []);

  const archiveMission = useCallback(
    ({
      mission,
      notes,
      reflection,
    }: {
      mission: Mission;
      notes: string;
      reflection: string;
    }): JournalEntry => {
      const now = new Date().toISOString();
      const existing = journal.find((entry) => entry.mission.id === mission.id);
      const entry: JournalEntry = {
        id: mission.id,
        mission,
        notes,
        reflection,
        analyzedAt: now,
        acceptedAt: existing?.acceptedAt ?? now,
      };
      setJournal((current) => [
        entry,
        ...current.filter((e) => e.mission.id !== mission.id),
      ]);
      setActiveMissions((current) =>
        current.filter((e) => e.mission.id !== mission.id),
      );
      return entry;
    },
    [journal],
  );

  const updateJournalEntry = useCallback(
    ({
      missionId,
      notes,
      reflection,
    }: {
      missionId: string;
      notes: string;
      reflection: string;
    }): JournalEntry | null => {
      const existing = journal.find((entry) => entry.mission.id === missionId);
      if (!existing) return null;
      const updated: JournalEntry = {
        ...existing,
        notes,
        reflection,
        analyzedAt: new Date().toISOString(),
      };
      setJournal((current) =>
        current.map((entry) => (entry.id === updated.id ? updated : entry)),
      );
      return updated;
    },
    [journal],
  );

  const getActive = useCallback(
    (missionId: string) => activeMissions.find((e) => e.mission.id === missionId),
    [activeMissions],
  );

  const getJournalEntry = useCallback(
    (id: string) => journal.find((e) => e.id === id),
    [journal],
  );

  const getJournalEntryByMission = useCallback(
    (missionId: string) => journal.find((e) => e.mission.id === missionId),
    [journal],
  );

  const value = useMemo<AppStoreValue>(
    () => ({
      activeMissions,
      journal,
      storageAvailable,
      acceptMission,
      updateNotes,
      archiveMission,
      updateJournalEntry,
      getActive,
      getJournalEntry,
      getJournalEntryByMission,
    }),
    [
      activeMissions,
      journal,
      storageAvailable,
      acceptMission,
      updateNotes,
      archiveMission,
      updateJournalEntry,
      getActive,
      getJournalEntry,
      getJournalEntryByMission,
    ],
  );

  return (
    <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>
  );
}
