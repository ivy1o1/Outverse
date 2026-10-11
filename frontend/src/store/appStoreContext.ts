import { createContext, useContext } from "react";
import type { ActiveMission, Mission } from "../types/mission";
import type { JournalEntry } from "../types/journal";

export type AcceptResult = { ok: boolean; alreadyAccepted: boolean };

export type AppStoreValue = {
  activeMissions: ActiveMission[];
  journal: JournalEntry[];
  storageAvailable: boolean;
  acceptMission: (mission: Mission) => AcceptResult;
  updateNotes: (missionId: string, notes: string) => void;
  archiveMission: (input: {
    mission: Mission;
    notes: string;
    reflection: string;
  }) => JournalEntry;
  updateJournalEntry: (input: {
    missionId: string;
    notes: string;
    reflection: string;
  }) => JournalEntry | null;
  getActive: (missionId: string) => ActiveMission | undefined;
  getJournalEntry: (id: string) => JournalEntry | undefined;
  getJournalEntryByMission: (missionId: string) => JournalEntry | undefined;
};

export const AppStoreContext = createContext<AppStoreValue | null>(null);

export function useAppStore(): AppStoreValue {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error("useAppStore must be used within AppStoreProvider");
  return ctx;
}
