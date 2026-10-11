import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { BookMarked } from "lucide-react";
import { BackButton } from "../ui/BackButton";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { Reveal } from "../animations/StaggeredText";
import { getPillar } from "../pillars/pillarData";
import { useAppStore } from "../store/appStoreContext";

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function excerptOf(text: string, max = 150): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max).trimEnd()}…` : clean;
}

export function JournalPage() {
  const { journal, storageAvailable } = useAppStore();
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  const entries = useMemo(
    () =>
      [...journal].sort((a, b) =>
        b.analyzedAt.localeCompare(a.analyzedAt),
      ),
    [journal],
  );

  return (
    <div className="atmosphere-texture min-h-[88svh]">
      <div className="mx-auto w-full max-w-4xl px-5 pb-32 pt-10 sm:px-8 sm:pt-14">
        <BackButton label="Back home" fallback="/" />

        <header className="mt-8 border-b border-parchment/12 pb-10">
          <p className="label-caps mb-4 text-ember-glow">Kept notes</p>
          <h1 className="font-display text-4xl leading-[1.05] text-parchment-soft sm:text-5xl">
            Field Journal
          </h1>
          <p className="mt-5 max-w-lg text-[0.95rem] leading-relaxed text-parchment/70">
            Every mission you've reflected on, with what you saw and what Gemma
            made of it.
          </p>
        </header>

        {!storageAvailable && (
          <p className="mt-8 border border-ember/40 bg-ember/10 px-5 py-4 text-[0.9rem] text-parchment/85">
            This browser is blocking local storage, so journal entries won't
            survive a refresh.
          </p>
        )}

        {entries.length === 0 ? (
          <EmptyState
            icon={<BookMarked size={26} aria-hidden="true" />}
            title="Your journal is still unwritten."
            body="Analyzed missions land here automatically — the question, your observations, and Gemma's reflection, kept together."
          >
            <Button onClick={() => navigate("/")}>Start a mission</Button>
          </EmptyState>
        ) : (
          <ul className="mt-12 space-y-6">
            {entries.map((entry, i) => {
              const pillar = getPillar(entry.mission.pillar);
              return (
                <motion.li
                  key={entry.id}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-6% 0px" }}
                  transition={{ duration: 0.55, delay: Math.min(i, 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
                >
                  <button
                    type="button"
                    onClick={() => navigate(`/journal/${entry.id}`)}
                    className="group paper-texture block w-full border border-ink/12 bg-parchment px-6 py-7 text-left transition-colors duration-300 hover:border-ember-ink/50 sm:px-8"
                  >
                    <div className="mb-4 flex flex-wrap items-center gap-3">
                      <span className="label-caps text-ember-ink">{pillar.title}</span>
                      <span className="label-caps text-ink/75">
                        {dateFormatter.format(new Date(entry.analyzedAt))}
                      </span>
                    </div>

                    <h2 className="font-display text-[1.3rem] leading-[1.22] text-ink sm:text-[1.55rem]">
                      {entry.mission.question}
                    </h2>

                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                      <div>
                        <p className="label-caps mb-1.5 text-ink/75">You noticed</p>
                        <p className="text-[0.9rem] leading-relaxed text-ink/80">
                          {excerptOf(entry.notes) || "—"}
                        </p>
                      </div>
                      <div className="border-l border-ink/12 sm:pl-5">
                        <p className="label-caps mb-1.5 text-ink/75">Gemma</p>
                        <p className="font-display text-[0.98rem] leading-relaxed text-ink/80">
                          {excerptOf(entry.reflection, 130)}
                        </p>
                      </div>
                    </div>

                    <span className="mt-6 inline-flex items-center gap-2 text-[0.85rem] text-ink/75 transition-colors group-hover:text-ember-ink">
                      <span
                        aria-hidden="true"
                        className="inline-block h-px w-6 bg-ink/30 transition-all duration-500 group-hover:w-12 group-hover:bg-ember-ink"
                      />
                      Read entry
                    </span>
                  </button>
                </motion.li>
              );
            })}
          </ul>
        )}

        <Reveal className="mt-20 text-center" delay={0.1}>
          <p className="text-[0.85rem] text-parchment/65">
            Entries live only in this browser — nothing is uploaded anywhere.
          </p>
        </Reveal>
      </div>
    </div>
  );
}
