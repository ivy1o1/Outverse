import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, ChevronDown, PenLine } from "lucide-react";
import { BackButton } from "../ui/BackButton";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { StatusPill } from "../ui/Pills";
import { getPillar } from "../pillars/pillarData";
import { useAppStore } from "../store/appStoreContext";
import type { ActiveMission } from "../types/mission";

function progressOf(entry: ActiveMission): number {
  const chars = entry.notes.trim().length;
  return Math.min(chars / 320, 1);
}

function ActiveMissionCard({ entry }: { entry: ActiveMission }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const pillar = getPillar(entry.mission.pillar);
  const progress = progressOf(entry);

  return (
    <motion.li
      layout={!reduce}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12, transition: { duration: 0.3 } }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="paper-texture border border-ink/12 bg-parchment text-ink"
    >
      <div className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-start sm:justify-between sm:px-8">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex-1 text-left"
        >
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <span className="label-caps text-ember-ink">{pillar.title}</span>
            <StatusPill status={entry.status} tone="light" />
            <span className="label-caps text-ink/75">
              {entry.mission.durationMinutes} min
            </span>
          </div>
          <h3 className="font-display text-[1.35rem] leading-[1.2] text-ink sm:text-[1.6rem]">
            {entry.mission.question}
          </h3>

          <div className="mt-5 flex items-center gap-4">
            <div
              className="h-px flex-1 bg-ink/12"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress * 100)}
              aria-label="Observation progress"
            >
              <motion.div
                className="h-px bg-ember"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: Math.max(progress, 0.04) }}
                style={{ transformOrigin: "left" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <ChevronDown
              size={18}
              aria-hidden="true"
              className={`shrink-0 text-ink/75 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
            />
          </div>
        </button>

        <Button
          size="sm"
          variant="quiet"
          onClick={() => navigate(`/missions/${entry.mission.id}/reflect`)}
          className="shrink-0"
        >
          <PenLine size={15} aria-hidden="true" />
          {entry.status === "in_progress" ? "Continue" : "Start writing"}
        </Button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-ink/12 px-6 py-6 sm:px-8">
              <p className="text-[0.95rem] leading-relaxed text-ink/75">
                {entry.mission.objective}
              </p>

              <ol className="mt-5 space-y-3">
                {entry.mission.instructions.map((step, i) => (
                  <li key={i} className="flex gap-3 text-[0.9rem] leading-relaxed text-ink/80">
                    <span className="label-caps mt-0.5 text-ink/75">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>

              {entry.notes.trim() ? (
                <div className="mt-6 border-l-2 border-ember/60 pl-4">
                  <p className="label-caps mb-2 text-ink/75">Your notes so far</p>
                  <p className="whitespace-pre-wrap text-[0.95rem] leading-relaxed text-ink/80">
                    {entry.notes.length > 320 ? `${entry.notes.slice(0, 320)}…` : entry.notes}
                  </p>
                </div>
              ) : (
                <p className="mt-6 text-[0.9rem] italic text-ink/75">
                  No observations written yet — the mission stays here until you analyze.
                </p>
              )}

              <button
                type="button"
                onClick={() => navigate(`/missions/${entry.mission.id}/reflect`)}
                className="group mt-7 inline-flex items-center gap-2 text-[0.95rem] text-ember-ink"
              >
                Open the reflection workspace
                <ArrowRight
                  size={16}
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

export function ActiveMissionsPage() {
  const { activeMissions, storageAvailable } = useAppStore();
  const navigate = useNavigate();

  return (
    <div className="atmosphere-texture min-h-[88svh]">
      <div className="mx-auto w-full max-w-4xl px-5 pb-32 pt-10 sm:px-8 sm:pt-14">
        <BackButton label="Back home" fallback="/" />

        <header className="mt-8 border-b border-parchment/12 pb-10">
          <p className="label-caps mb-4 text-ember-glow">In the field</p>
          <h1 className="font-display text-4xl leading-[1.05] text-parchment-soft sm:text-5xl">
            Active Missions
          </h1>
          <p className="mt-5 max-w-lg text-[0.95rem] leading-relaxed text-parchment/70">
            Anything you've accepted but not yet reflected on. Notes save
            themselves as you write.
          </p>
        </header>

        {!storageAvailable && (
          <p className="mt-8 border border-ember/40 bg-ember/10 px-5 py-4 text-[0.9rem] text-parchment/85">
            This browser is blocking local storage, so your notes will only last
            until the tab is closed.
          </p>
        )}

        {activeMissions.length === 0 ? (
          <EmptyState
            title="No missions in your pack."
            body="Head back Home, pick a direction, and accept a question that catches your attention. It will wait for you here."
          >
            <Button onClick={() => navigate("/")}>Find a mission</Button>
          </EmptyState>
        ) : (
          <ul className="mt-12 space-y-6">
            {activeMissions.map((entry) => (
              <ActiveMissionCard key={entry.mission.id} entry={entry} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
