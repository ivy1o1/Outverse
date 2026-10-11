import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { RefreshCw, Sparkles } from "lucide-react";
import { BackButton } from "../ui/BackButton";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import { EmptyState } from "../ui/EmptyState";
import { useClickSpark } from "../animations/ClickSpark";
import { MissionStack, StackControls } from "./MissionStack";
import { MissionExpansionOverlay } from "./MissionExpansionOverlay";
import type { CardRect } from "./MissionCard";
import { getPillar } from "../pillars/pillarData";
import { generateMissions } from "../services/missionService";
import {
  loadDiscovery,
  rememberMissions,
  saveDiscovery,
} from "../services/storageService";
import { isPillarId, type Mission, type PillarId } from "../types/mission";

type Phase = "loading" | "ready" | "error";

type StackState = {
  phase: Phase;
  missions: Mission[];
  remaining: string[];
  rejectedCount: number;
  error: string | null;
};

export function ExplorePage() {
  const params = useParams();
  const pillarId: PillarId | null = isPillarId(params.pillar) ? params.pillar : null;
  if (!pillarId) return <Navigate to="/" replace />;
  return <ExploreView pillarId={pillarId} />;
}

function ExploreView({ pillarId }: { pillarId: PillarId }) {
  const pillar = getPillar(pillarId);
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  // Restore a previous discovery session for this pillar, or start loading.
  const [state, setState] = useState<StackState>(() => {
    const saved = loadDiscovery(pillarId);
    if (saved) {
      return {
        phase: "ready",
        missions: saved.missions,
        remaining: saved.remaining,
        rejectedCount: saved.rejectedCount,
        error: null,
      };
    }
    return { phase: "loading", missions: [], remaining: [], rejectedCount: 0, error: null };
  });

  const [announcement, setAnnouncement] = useState("");
  const [expansion, setExpansion] = useState<{ mission: Mission; rect: CardRect } | null>(null);
  const emitSpark = useClickSpark();

  const requestRef = useRef(0);
  const hasRestored = useRef(state.phase === "ready");
  const pillarTitle = pillar.title;

  /** Only ever called while phase === "loading"; all state updates happen
   *  after the awaited delay, never synchronously inside the effect. */
  const load = useCallback(async () => {
    const requestId = ++requestRef.current;
    try {
      const batch = await generateMissions(pillarId);
      if (requestId !== requestRef.current) return;
      setState({
        phase: "ready",
        missions: batch,
        remaining: batch.map((m) => m.id),
        rejectedCount: 0,
        error: null,
      });
      rememberMissions(batch);
      setAnnouncement(`Five new missions for ${pillarTitle}.`);
    } catch (err) {
      if (requestId !== requestRef.current) return;
      setState((current) => ({
        ...current,
        phase: "error",
        error: err instanceof Error ? err.message : "Something went wrong.",
      }));
    }
  }, [pillarId, pillarTitle]);

  useEffect(() => {
    if (hasRestored.current) {
      rememberMissions(state.missions);
      return;
    }
    hasRestored.current = true;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  // Persist the discovery session so going back restores the same stack.
  useEffect(() => {
    if (state.phase !== "ready" || state.missions.length === 0) return;
    saveDiscovery({
      pillar: pillarId,
      missions: state.missions,
      remaining: state.remaining,
      rejectedCount: state.rejectedCount,
      updatedAt: new Date().toISOString(),
    });
  }, [state, pillarId]);

  const frontMission = state.missions.find((m) => m.id === state.remaining[0]);

  const handleReject = useCallback(
    (id: string, direction: 1 | -1) => {
      const remaining = state.remaining.filter((mId) => mId !== id);
      setAnnouncement(
        remaining.length > 0
          ? `Mission passed${direction > 0 ? " to the right" : " to the left"}. ${remaining.length} remaining in the stack.`
          : "Mission passed. The stack is empty.",
      );
      setState((current) => ({
        ...current,
        remaining: current.remaining.filter((mId) => mId !== id),
        rejectedCount: current.rejectedCount + 1,
      }));
    },
    [state.remaining],
  );

  const refresh = useCallback(() => {
    setState((current) => ({ ...current, phase: "loading", error: null }));
    void load();
  }, [load]);

  const handleSelect = useCallback(
    (mission: Mission, rect: CardRect) => {
      rememberMissions([mission]);
      if (reduce) {
        navigate(`/missions/${mission.id}`);
        return;
      }
      emitSpark(rect.left + rect.width / 2, rect.top + rect.height / 2);
      setExpansion({ mission, rect });
    },
    [emitSpark, navigate, reduce],
  );

  const exhausted = state.phase === "ready" && state.remaining.length === 0;

  return (
    <div className="atmosphere-texture relative min-h-[88svh] overflow-hidden">
      {/* Header */}
      <div className="mx-auto w-full max-w-6xl px-5 pt-10 sm:px-8 sm:pt-14">
        <BackButton label="Back to directions" fallback="/" />
        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="label-caps mb-4 text-ember-glow">
              {pillar.index} · {pillar.title}
            </p>
            <h1 className="max-w-2xl font-display text-4xl leading-[1.05] text-parchment-soft sm:text-5xl">
              Five questions. Keep the one that won't leave you alone.
            </h1>
            <p className="mt-5 max-w-lg text-[0.95rem] leading-relaxed text-parchment/70">
              {pillar.description}
            </p>
          </div>
        </div>
      </div>

      {/* Stack area */}
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-5 pb-28 pt-14 sm:px-8 sm:pt-20">
        {state.phase === "loading" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-[34rem]"
            role="status"
            aria-live="polite"
          >
            <div className="flex h-[19rem] w-full animate-pulse flex-col justify-between border border-ink/10 bg-parchment px-7 py-8 sm:h-[21.5rem]">
              <span className="label-caps text-ink/75">Mission</span>
              <span className="font-display text-xl text-ink/75">
                Drawing a fresh stack from {pillar.title.toLowerCase()}…
              </span>
              <span className="label-caps text-ink/75">…</span>
            </div>
            <div className="mt-6 flex justify-center text-parchment/70">
              <Spinner label="Preparing missions" />
            </div>
          </motion.div>
        )}

        {state.phase === "error" && (
          <div className="w-full max-w-[34rem] text-center" role="alert">
            <p className="text-parchment/80">
              {state.error ?? "Missions could not be generated."}
            </p>
            <p className="mt-2 text-sm text-parchment/70">
              {state.missions.length > 0
                ? "Nothing has been lost — your current stack is intact."
                : "The mission service is just having a moment. Nothing is lost."}
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button onClick={refresh}>Try again</Button>
              {state.missions.length > 0 && (
                <Button
                  variant="secondary"
                  onClick={() => setState((current) => ({ ...current, phase: "ready" }))}
                >
                  Keep current stack
                </Button>
              )}
            </div>
          </div>
        )}

        {state.phase === "ready" && !exhausted && (
          <>
            <MissionStack
              missions={state.missions}
              remaining={state.remaining}
              onReject={handleReject}
              onSelect={handleSelect}
            />
            <StackControls
              remainingCount={state.remaining.length}
              onReject={(direction) => frontMission && handleReject(frontMission.id, direction)}
            />
          </>
        )}

        {exhausted && (
          <EmptyState
            icon={<Sparkles size={26} aria-hidden="true" />}
            title="You've seen every question in this stack."
            body={`Nothing here fits this walk? Draw a fresh set of ${pillar.title.toLowerCase()} missions and see what catches you instead.`}
          >
            <Button onClick={refresh}>
              <RefreshCw size={16} aria-hidden="true" />
              Discover again
            </Button>
          </EmptyState>
        )}

        <p className="sr-only" role="status" aria-live="polite">
          {announcement}
        </p>
      </div>

      {expansion && (
        <MissionExpansionOverlay
          key={expansion.mission.id}
          mission={expansion.mission}
          rect={expansion.rect}
          onArrive={() => navigate(`/missions/${expansion.mission.id}`)}
          onDone={() => setExpansion(null)}
        />
      )}
    </div>
  );
}
