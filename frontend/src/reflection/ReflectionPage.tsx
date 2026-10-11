import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AlertCircle, BookOpen, RefreshCw, Sparkles } from "lucide-react";
import { BackButton } from "../ui/BackButton";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import { getPillar } from "../pillars/pillarData";
import { analyzeReflection } from "../services/reflectionService";
import { recallMission } from "../services/storageService";
import { useAppStore } from "../store/appStoreContext";

const PROMPTS = [
  "What did you notice?",
  "What detail surprised you?",
  "What evidence did you observe?",
  "What do you think might explain it?",
  "What remains uncertain?",
];

const MIN_CHARS = 12;

export function ReflectionPage() {
  const params = useParams();
  const missionId = params.id ?? "";
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const {
    getActive,
    getJournalEntryByMission,
    updateNotes,
    archiveMission,
    updateJournalEntry,
  } = useAppStore();

  const active = getActive(missionId);
  const journalEntry = getJournalEntryByMission(missionId);
  const mission = useMemo(
    () => active?.mission ?? journalEntry?.mission ?? recallMission(missionId),
    [active, journalEntry, missionId],
  );

  const [notes, setNotes] = useState(() => active?.notes ?? journalEntry?.notes ?? "");
  const [reflection, setReflection] = useState<string | null>(() => journalEntry?.reflection ?? null);
  const [archived, setArchived] = useState(() => Boolean(journalEntry) && !active);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validation, setValidation] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"saved" | "saving">("saved");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Mirror the latest values into refs inside effects (never during render),
  // so the debounced autosave always persists the newest text.
  const notesRef = useRef(notes);
  const activeRef = useRef(active);
  const entryRef = useRef(journalEntry);
  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);
  useEffect(() => {
    activeRef.current = active;
    entryRef.current = journalEntry;
  }, [active, journalEntry]);

  /* Debounced autosave — reads the newest value so a slow timer can never
     overwrite a more recent edit with stale text. */
  useEffect(() => {
    if (!mission) return;
    const timer = window.setTimeout(() => {
      const latest = notesRef.current;
      const currentActive = activeRef.current;
      const currentEntry = entryRef.current;
      if (currentActive) {
        updateNotes(mission.id, latest);
      } else if (currentEntry) {
        // Keep edited observations in place until the user re-analyzes.
        updateJournalEntry({
          missionId: mission.id,
          notes: latest,
          reflection: currentEntry.reflection,
        });
      }
      setSaveState("saved");
    }, 550);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes, mission?.id]);

  const handleNotesChange = (value: string) => {
    setNotes(value);
    setSaveState("saving");
  };

  const insertPrompt = (prompt: string) => {
    setNotes((current) => {
      const base = current.trimEnd();
      const next = base ? `${base}\n\n${prompt}\n` : `${prompt}\n`;
      requestAnimationFrame(() => {
        const el = textareaRef.current;
        if (el) {
          el.focus();
          el.selectionStart = el.selectionEnd = next.length;
        }
      });
      return next;
    });
  };

  const handleAnalyze = useCallback(async () => {
    if (!mission) return;
    const trimmed = notesRef.current.trim();
    if (trimmed.length < MIN_CHARS) {
      setValidation(
        "Write a sentence or two about what you noticed — even an ordinary observation is enough to begin.",
      );
      textareaRef.current?.focus();
      return;
    }
    setValidation(null);
    setError(null);
    setAnalyzing(true);
    try {
      const result = await analyzeReflection(mission, notesRef.current);
      if (active) {
        archiveMission({ mission, notes: notesRef.current, reflection: result.reflection });
        setArchived(true);
      } else {
        const updated = updateJournalEntry({
          missionId: mission.id,
          notes: notesRef.current,
          reflection: result.reflection,
        });
        if (!updated) {
          archiveMission({ mission, notes: notesRef.current, reflection: result.reflection });
          setArchived(true);
        }
      }
      setReflection(result.reflection);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "The reflection could not be generated. Your notes are untouched — try again.",
      );
    } finally {
      setAnalyzing(false);
    }
  }, [mission, active, archiveMission, updateJournalEntry]);

  if (!mission) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-32 text-center">
        <h1 className="font-display text-3xl text-parchment-soft">
          There's nothing to reflect on here yet.
        </h1>
        <p className="mt-4 text-parchment/70">
          Accept a mission first, then come back to write about it.
        </p>
        <div className="mt-8 flex justify-center">
          <Button onClick={() => navigate("/")}>Return Home</Button>
        </div>
      </div>
    );
  }

  const pillar = getPillar(mission.pillar);

  return (
    <div className="paper-texture min-h-[88svh] bg-parchment text-ink">
      <div className="mx-auto w-full max-w-4xl px-5 pb-32 pt-10 sm:px-8 sm:pt-14">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <BackButton
            label={archived ? "Back to Field Journal" : "Back to Active Missions"}
            fallback={archived ? "/journal" : "/missions/active"}
            tone="light"
          />
          <span className="label-caps text-ink/75">{pillar.title}</span>
        </div>

        {/* Mission question */}
        <header className="mt-8 border-b border-ink/12 pb-9">
          <h1 className="font-display text-[1.75rem] leading-[1.15] tracking-[-0.015em] text-ink sm:text-[2.4rem]">
            {mission.question}
          </h1>

          <details className="group mt-6">
            <summary className="inline-flex cursor-pointer list-none items-center gap-2 text-[0.9rem] text-ink/80 transition-colors hover:text-ember-ink">
              <BookOpen size={15} aria-hidden="true" />
              Mission briefing
              <span className="transition-transform duration-300 group-open:rotate-180">
                ▾
              </span>
            </summary>
            <div className="mt-4 border-l-2 border-ink/15 pl-5">
              <p className="text-[0.95rem] leading-relaxed text-ink/80">
                {mission.objective}
              </p>
              <ol className="mt-4 space-y-2">
                {mission.instructions.map((step, i) => (
                  <li key={i} className="flex gap-3 text-[0.88rem] leading-relaxed text-ink/80">
                    <span className="label-caps mt-0.5 text-ink/75">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </details>

          <AnimatePresence>
            {archived && (
              <motion.div
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 border border-moss-ink/30 bg-moss-ink/8 px-5 py-4 text-[0.9rem] text-ink/80"
              >
                This mission has moved to your{" "}
                <Link
                  to={`/journal/${mission.id}`}
                  className="text-moss-ink underline underline-offset-4"
                >
                  Field Journal
                </Link>
                . You can still refine your notes and analyze again — the journal
                entry updates rather than duplicates.
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* Writing prompts */}
        <section className="mt-10" aria-labelledby="prompts-heading">
          <h2 id="prompts-heading" className="label-caps mb-4 text-ink/75">
            Prompts, if you want them
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => insertPrompt(prompt)}
                className="rounded-full border border-ink/15 px-4 py-2 text-[0.85rem] text-ink/80 transition-colors duration-300 hover:border-ember-ink hover:text-ember-ink"
              >
                {prompt}
              </button>
            ))}
          </div>
        </section>

        {/* Notes editor */}
        <section className="mt-10">
          <div className="mb-3 flex items-center justify-between">
            <label htmlFor="notes" className="label-caps text-ink/75">
              Your observations
            </label>
            <span
              className="label-caps text-ink/75"
              role="status"
              aria-live="polite"
            >
              {saveState === "saving" ? "Saving…" : "Saved locally"}
            </span>
          </div>
          <textarea
            id="notes"
            ref={textareaRef}
            value={notes}
            onChange={(event) => handleNotesChange(event.target.value)}
            rows={12}
            placeholder="Write what you saw, in your own words. Ordinary details are welcome here."
            className="w-full resize-y border border-ink/55 bg-parchment-soft/70 px-6 py-5 font-body text-[1.02rem] leading-[1.75] text-ink placeholder:text-ink/75 focus:border-ember-ink focus:outline-none"
          />
          {validation && (
            <p className="mt-3 flex items-start gap-2 text-[0.9rem] text-error">
              <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              {validation}
            </p>
          )}
        </section>

        {/* Analyze */}
        <section className="mt-10">
          <motion.div
            animate={{ opacity: analyzing ? 0.45 : 1 }}
            transition={{ duration: 0.35 }}
            className="flex flex-wrap items-center gap-5"
          >
            <Button
              size="lg"
              onClick={() => void handleAnalyze()}
              disabled={analyzing}
            >
              <Sparkles size={17} aria-hidden="true" />
              {reflection ? "Analyze again" : "Analyze"}
            </Button>
            {analyzing && (
              <span className="text-ink/80">
                <Spinner label="Reading your observations…" />
              </span>
            )}
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                role="alert"
                className="mt-5 flex items-start gap-2 border border-error/40 bg-error/8 px-5 py-4 text-[0.9rem] text-error"
              >
                <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                {error} Your notes are untouched.
              </motion.p>
            )}
          </AnimatePresence>
        </section>

        {/* Reflection result */}
        <AnimatePresence>
          {reflection && !analyzing && (
            <motion.section
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              aria-live="polite"
              className="mt-14 border-t border-ink/12 pt-10"
            >
              <div className="mb-5 flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-moss-ink" aria-hidden="true" />
                <p className="label-caps text-ink/75">Gemma's reflection</p>
              </div>
              <div className="space-y-3 border-l-2 border-moss-ink/50 pl-6">
                {reflection.split("\n").map((line, i) => (
                  <motion.p
                    key={i}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 + i * 0.14, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    className="font-display text-[1.15rem] leading-[1.55] text-ink/90 sm:text-[1.35rem]"
                  >
                    {line}
                  </motion.p>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-5 text-[0.88rem] text-ink/80">
                <button
                  type="button"
                  onClick={() => void handleAnalyze()}
                  disabled={analyzing}
                  className="inline-flex items-center gap-2 text-ember-ink transition-opacity hover:opacity-75 disabled:opacity-50"
                >
                  <RefreshCw size={15} aria-hidden="true" />
                  Re-analyze with edited notes
                </button>
                {archived && (
                  <Link
                    to={`/journal/${mission.id}`}
                    className="underline-offset-4 hover:text-ember-ink hover:underline"
                  >
                    Read it in the Field Journal
                  </Link>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
