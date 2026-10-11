import { useMemo, type MouseEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { AlertTriangle, Check, Clock, Compass } from "lucide-react";
import { BackButton } from "../ui/BackButton";
import { Button } from "../ui/Button";
import { DifficultyPill } from "../ui/Pills";
import { Reveal } from "../animations/StaggeredText";
import { useClickSpark } from "../animations/ClickSpark";
import { getPillar } from "../pillars/pillarData";
import { recallMission } from "../services/storageService";
import { useAppStore } from "../store/appStoreContext";
import type { Mission } from "../types/mission";

export function MissionBriefingPage() {
  const params = useParams();
  const missionId = params.id ?? "";
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const emitSpark = useClickSpark();
  const { activeMissions, journal, acceptMission } = useAppStore();

  const mission: Mission | null = useMemo(() => {
    const recalled = recallMission(missionId);
    if (recalled) return recalled;
    const active = activeMissions.find((a) => a.mission.id === missionId);
    if (active) return active.mission;
    const entry = journal.find((e) => e.mission.id === missionId);
    return entry ? entry.mission : null;
  }, [missionId, activeMissions, journal]);

  if (!mission) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-32 text-center">
        <h1 className="font-display text-3xl text-parchment-soft">
          This mission has wandered off.
        </h1>
        <p className="mt-4 text-parchment/70">
          The stack may have been refreshed in another tab. Head back to choose
          again.
        </p>
        <div className="mt-8 flex justify-center">
          <Button onClick={() => navigate("/")}>Return Home</Button>
        </div>
      </div>
    );
  }

  const pillar = getPillar(mission.pillar);
  const alreadyAccepted = activeMissions.some((a) => a.mission.id === mission.id);
  const alreadyInJournal = journal.some((e) => e.mission.id === mission.id);

  const handleAccept = (event: MouseEvent<HTMLButtonElement>) => {
    emitSpark(event.clientX, event.clientY);
    const result = acceptMission(mission);
    if (result.alreadyAccepted) {
      navigate("/missions/active");
      return;
    }
    navigate("/");
  };

  return (
    <article className="paper-texture relative min-h-[88svh] bg-parchment text-ink">
      <div className="mx-auto w-full max-w-4xl px-5 pb-32 pt-10 sm:px-8 sm:pt-14">
        <div className="flex items-center justify-between">
          <BackButton label="Back to the stack" fallback={`/explore/${mission.pillar}`} tone="light" />
          <span className="label-caps text-ink/75">{pillar.index}</span>
        </div>

        <motion.header
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 border-b border-ink/12 pb-10 sm:mt-14"
        >
          <p className="label-caps mb-6 text-ember-ink">{pillar.title}</p>
          <h1 className="font-display text-[2rem] leading-[1.1] tracking-[-0.015em] text-ink sm:text-[2.9rem]">
            {mission.question}
          </h1>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 border border-ink/15 rounded-full px-3 py-1.5 text-[0.8rem] text-ink/80">
              <Clock size={14} aria-hidden="true" />
              About {mission.durationMinutes} minutes
            </span>
            <DifficultyPill difficulty={mission.difficulty} />
            <span className="inline-flex items-center gap-2 border border-ink/15 rounded-full px-3 py-1.5 text-[0.8rem] text-ink/80">
              <Compass size={14} aria-hidden="true" />
              Anywhere you already are
            </span>
          </div>
        </motion.header>

        <div className="mt-12 grid gap-12 md:grid-cols-[1.35fr_1fr]">
          <div>
            <Reveal>
              <h2 className="label-caps mb-4 text-ink/75">What you're looking for</h2>
              <p className="font-display text-xl leading-snug text-ink/90 sm:text-2xl">
                {mission.objective}
              </p>
            </Reveal>

            <Reveal delay={0.08}>
              <h2 className="label-caps mb-5 mt-12 text-ink/75">How to do it</h2>
              <ol className="space-y-5">
                {mission.instructions.map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="label-caps mt-1 text-ember-ink">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[1rem] leading-relaxed text-ink/85">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>

          <Reveal delay={0.14}>
            <aside className="border border-ink/12 bg-ink/[0.04] p-6">
              <h2 className="label-caps mb-4 text-ink/75">Before you go</h2>
              {mission.safetyNotes && mission.safetyNotes.length > 0 ? (
                <ul className="space-y-4">
                  {mission.safetyNotes.map((note, i) => (
                    <li key={i} className="flex gap-3 text-[0.92rem] leading-relaxed text-ink/80">
                      <AlertTriangle size={16} className="mt-0.5 shrink-0 text-ember-ink" aria-hidden="true" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[0.92rem] leading-relaxed text-ink/80">
                  Stay aware of your surroundings and where you're standing.
                  Nothing here needs a road, a fence, or a stranger's attention.
                </p>
              )}
              <p className="mt-6 border-t border-ink/12 pt-5 text-[0.85rem] leading-relaxed text-ink/80">
                No photos, no location sharing, no clock. Take the mission at
                the pace of your own attention.
              </p>
            </aside>
          </Reveal>
        </div>

        <Reveal delay={0.2}>
          <div className="mt-14 flex flex-col gap-4 border-t border-ink/12 pt-10 sm:flex-row sm:items-center">
            {alreadyAccepted ? (
              <>
                <Button variant="quiet" onClick={() => navigate("/missions/active")}>
                  <Check size={16} aria-hidden="true" />
                  Already accepted — open Active Missions
                </Button>
                <Link
                  to="/"
                  className="text-sm text-ink/80 underline-offset-4 hover:text-ember-ink hover:underline"
                >
                  Return Home
                </Link>
              </>
            ) : alreadyInJournal ? (
              <>
                <Button variant="quiet" onClick={() => navigate(`/journal/${mission.id}`)}>
                  <Check size={16} aria-hidden="true" />
                  Already reflected on — open journal entry
                </Button>
                <Link
                  to="/"
                  className="text-sm text-ink/80 underline-offset-4 hover:text-ember-ink hover:underline"
                >
                  Return Home
                </Link>
              </>
            ) : (
              <>
                <Button size="lg" onClick={handleAccept}>
                  Accept mission
                </Button>
                <p className="text-[0.85rem] text-ink/80">
                  It will wait in Active Missions until you're ready to write.
                </p>
              </>
            )}
          </div>
        </Reveal>
      </div>
    </article>
  );
}
