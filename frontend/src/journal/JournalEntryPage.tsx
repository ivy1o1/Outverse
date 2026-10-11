import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { BackButton } from "../ui/BackButton";
import { Button } from "../ui/Button";
import { getPillar } from "../pillars/pillarData";
import { useAppStore } from "../store/appStoreContext";

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});

export function JournalEntryPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { getJournalEntry } = useAppStore();
  const reduce = useReducedMotion();
  const entry = getJournalEntry(params.id ?? "");

  if (!entry) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-32 text-center">
        <h1 className="font-display text-3xl text-parchment-soft">
          That journal entry isn't here.
        </h1>
        <p className="mt-4 text-parchment/70">
          It may have been re-analyzed under a different id in another tab.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button onClick={() => navigate("/journal")}>
            Back to Field Journal
          </Button>
        </div>
      </div>
    );
  }

  const pillar = getPillar(entry.mission.pillar);

  return (
    <article className="paper-texture min-h-[88svh] bg-parchment text-ink">
      <div className="mx-auto w-full max-w-3xl px-5 pb-32 pt-10 sm:px-8 sm:pt-14">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <BackButton label="Back to Field Journal" fallback="/journal" tone="light" />
          <span className="label-caps text-ink/75">
            {dateFormatter.format(new Date(entry.analyzedAt))} ·{" "}
            {timeFormatter.format(new Date(entry.analyzedAt))}
          </span>
        </div>

        <motion.header
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mt-9 border-b border-ink/12 pb-9"
        >
          <p className="label-caps mb-5 text-ember-ink">{pillar.title}</p>
          <h1 className="font-display text-[1.75rem] leading-[1.15] tracking-[-0.015em] text-ink sm:text-[2.4rem]">
            {entry.mission.question}
          </h1>
          <p className="mt-5 text-[0.9rem] text-ink/80">
            Mission accepted {dateFormatter.format(new Date(entry.acceptedAt))} ·
            about {entry.mission.durationMinutes} minutes
          </p>
        </motion.header>

        <section className="mt-10">
          <h2 className="label-caps mb-3 text-ink/75">The mission</h2>
          <p className="text-[0.98rem] leading-relaxed text-ink/80">
            {entry.mission.objective}
          </p>
          <ol className="mt-4 space-y-2">
            {entry.mission.instructions.map((step, i) => (
              <li key={i} className="flex gap-3 text-[0.88rem] leading-relaxed text-ink/80">
                <span className="label-caps mt-0.5 text-ink/75">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <motion.section
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 border-t border-ink/12 pt-9"
        >
          <h2 className="label-caps mb-4 text-ink/75">What you noticed</h2>
          <p className="whitespace-pre-wrap text-[1rem] leading-[1.75] text-ink/85">
            {entry.notes.trim() || "—"}
          </p>
        </motion.section>

        <motion.section
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 border-t border-ink/12 pt-9"
        >
          <div className="mb-5 flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-moss-ink" aria-hidden="true" />
            <h2 className="label-caps text-ink/75">Gemma's reflection</h2>
          </div>
          <div className="space-y-3 border-l-2 border-moss-ink/50 pl-6">
            {entry.reflection.split("\n").map((line, i) => (
              <p
                key={i}
                className="font-display text-[1.15rem] leading-[1.55] text-ink/90 sm:text-[1.3rem]"
              >
                {line}
              </p>
            ))}
          </div>
        </motion.section>

        <div className="mt-14 flex flex-wrap gap-4 border-t border-ink/12 pt-9">
          <Link
            to="/journal"
            className="text-[0.95rem] text-ink/80 underline-offset-4 transition-colors hover:text-ember-ink hover:underline"
          >
            ← All journal entries
          </Link>
          <Link
            to="/missions/active"
            className="text-[0.95rem] text-ink/80 underline-offset-4 transition-colors hover:text-ember-ink hover:underline"
          >
            Active missions
          </Link>
        </div>
      </div>
    </article>
  );
}
