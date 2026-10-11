import type { Mission, PillarId } from "../types/mission";

/**
 * Mock mission corpus.
 *
 * Every entry is a short, actionable, real-world observation prompt:
 * no specialist knowledge, no photography/GPS requirement, no unsafe or
 * invasive behaviour, and phrased as an invitation rather than a claim.
 *
 * When a real backend exists, this file is replaced by HTTP calls to the
 * FastAPI mission endpoint (see README "Future backend integration").
 */
type MissionSeed = Omit<Mission, "id" | "pillar" | "createdAt">;

export const MISSION_POOLS: Record<PillarId, MissionSeed[]> = {
  hidden_patterns: [
    {
      question:
        "Where does the same shape appear in three unexpected places?",
      objective:
        "Train your eye on repetition that no one deliberately arranged.",
      instructions: [
        "Walk a short, familiar route and choose one shape — a circle, a triangle, a repeated curve.",
        "Stop the first time you find it, then look for it again on a different kind of surface.",
        "Note where the third appearance surprised you, and why that place felt unrelated.",
      ],
      durationMinutes: 15,
      difficulty: "easy",
    },
    {
      question:
        "Which colour repeats more often on this street than you expected?",
      objective:
        "Notice how a single colour quietly unifies a place.",
      instructions: [
        "Pick a colour you would not have chosen on purpose.",
        "Count or note every place it appears within one block.",
        "Reflect on whether the repetitions look intentional or accidental.",
      ],
      durationMinutes: 10,
      difficulty: "easy",
    },
    {
      question:
        "Find two things that were designed by different people but look related.",
      objective:
        "Discover kinship between objects with no shared author.",
      instructions: [
        "Look for a pair: a railing and a gate, a tile and a leaf, a sign and a shadow.",
        "Describe the specific quality they share — proportion, rhythm, edge, or wear.",
        "Consider what makes them converge despite their different origins.",
      ],
      durationMinutes: 15,
      difficulty: "moderate",
    },
    {
      question:
        "Where does a pattern break — and does the break carry meaning?",
      objective:
        "Read the interruption in an otherwise regular pattern.",
      instructions: [
        "Find a repeating arrangement: bricks, paving slats, fence pickets, tiles.",
        "Locate the irregular element and observe how it was handled.",
        "Guess whether the break is damage, repair, design, or accident.",
      ],
      durationMinutes: 12,
      difficulty: "moderate",
    },
    {
      question:
        "How many different kinds of circle can you find in one view?",
      objective:
        "Collect variation within a single, simple shape.",
      instructions: [
        "Stand still and set a fixed view — a doorway, a window, a corner.",
        "List every circular form inside it, however small.",
        "Note which circles were made by nature, which by people.",
      ],
      durationMinutes: 10,
      difficulty: "easy",
    },
    {
      question:
        "Which texture here appears on two materials that have nothing in common?",
      objective:
        "Notice texture travelling across unrelated surfaces.",
      instructions: [
        "Choose a texture: ribbed, speckled, cracked, brushed.",
        "Find it on at least two different materials.",
        "Describe what the shared texture makes you imagine about each one.",
      ],
      durationMinutes: 15,
      difficulty: "moderate",
    },
    {
      question:
        "Is there a number that keeps recurring in this place?",
      objective:
        "Detect numerical rhythm in everyday surroundings.",
      instructions: [
        "Count steps between two points, or count elements in a row.",
        "Look for the same count appearing elsewhere nearby.",
        "Reflect on whether the repetition feels structural or coincidence.",
      ],
      durationMinutes: 12,
      difficulty: "challenging",
    },
    {
      question:
        "Find a shadow that repeats a shape you can also touch.",
      objective:
        "Pair an object with its shadow-self elsewhere.",
      instructions: [
        "Watch how light cuts shapes onto walls or ground.",
        "Find a physical object nearby that echoes one of those shadow shapes.",
        "Note what changes between the two versions.",
      ],
      durationMinutes: 10,
      difficulty: "easy",
      safetyNotes: [
        "Watch your footing while looking up or into bright light.",
      ],
    },
    {
      question:
        "Which detail did you almost walk past, then notice a second time?",
      objective:
        "Follow the detail that rewards a second look.",
      instructions: [
        "Move slowly and let your attention catch on something small.",
        "Return to it and look again more closely.",
        "Write down what the second look revealed that the first did not.",
      ],
      durationMinutes: 15,
      difficulty: "easy",
    },
    {
      question:
        "Where do two identical objects sit at different distances from you?",
      objective:
        "Compare how distance changes the character of identical things.",
      instructions: [
        "Find two matching elements — lamps, bollards, windows, tiles.",
        "Observe one near and one far.",
        "Describe how perspective alters your sense of their similarity.",
      ],
      durationMinutes: 12,
      difficulty: "moderate",
    },
  ],

  forgotten_stories: [
    {
      question:
        "What small detail suggests this place has changed over time?",
      objective:
        "Read one piece of evidence that a place has a history.",
      instructions: [
        "Choose a spot you pass regularly and look at its edges and seams.",
        "Find one trace: a patched wall, an old fixing, a changed threshold.",
        "Describe what you think it remembers — as a hypothesis, not a fact.",
      ],
      durationMinutes: 15,
      difficulty: "easy",
    },
    {
      question:
        "Which name here belongs to someone no one remembers?",
      objective:
        "Notice a person's name preserved in an ordinary place.",
      instructions: [
        "Look for names on plaques, buildings, streets, or utility covers.",
        "Choose one and observe how worn or cared-for it is.",
        "Write down the impression it left, without inventing biography.",
      ],
      durationMinutes: 15,
      difficulty: "easy",
    },
    {
      question:
        "Where has something been built over, but still shows through?",
      objective:
        "Find an older layer surviving beneath a newer one.",
      instructions: [
        "Scan walls, floors, and shopfronts for mismatched materials.",
        "Pick one place where an earlier surface is still visible.",
        "Consider what the older layer was once part of.",
      ],
      durationMinutes: 20,
      difficulty: "moderate",
    },
    {
      question:
        "What was this building's earlier purpose, based on one clue?",
      objective:
        "Infer previous use from a single surviving detail.",
      instructions: [
        "Find one clue: a blocked doorway, a faded sign, an odd window.",
        "Note honestly how confident you feel about your reading.",
        "Record an alternative explanation as well as your first one.",
      ],
      durationMinutes: 20,
      difficulty: "moderate",
    },
    {
      question:
        "Which object here has outlived the reason it was installed?",
      objective:
        "Spot something kept long after its original purpose faded.",
      instructions: [
        "Look for hardware, fixtures, or signage that seems obsolete.",
        "Describe what it was probably for, and what replaced it.",
        "Note how the place treats it now — maintained, ignored, adapted.",
      ],
      durationMinutes: 15,
      difficulty: "moderate",
    },
    {
      question:
        "Find a repair that was made to last rather than to hide.",
      objective:
        "Distinguish honest repair from cosmetic covering.",
      instructions: [
        "Look for cracks, seams, and patches in walls, furniture, or pavement.",
        "Choose one repair that looks deliberate and visible.",
        "Write what it tells you about how the place is cared for.",
      ],
      durationMinutes: 15,
      difficulty: "easy",
    },
    {
      question:
        "What does the oldest thing within view appear to be?",
      objective:
        "Estimate age through texture, wear, and material.",
      instructions: [
        "Scan your surroundings and pick what looks oldest.",
        "List the evidence you used: material, wear, style, or placement.",
        "Acknowledge what you cannot know for certain.",
      ],
      durationMinutes: 12,
      difficulty: "easy",
    },
    {
      question:
        "Where does the ground surface change, and what might that mark?",
      objective:
        "Read a boundary in the ground as a historical line.",
      instructions: [
        "Watch for shifts in paving, kerb, or road material.",
        "Stand at one change and look both ways.",
        "Hypothesise what the boundary once separated.",
      ],
      durationMinutes: 15,
      difficulty: "moderate",
    },
    {
      question:
        "Which sign has been rewritten rather than replaced?",
      objective:
        "Notice correction and reuse in public information.",
      instructions: [
        "Look for painted-over text, edited notices, or reused boards.",
        "Pick one and describe the layering you can see.",
        "Reflect on what the decision to rewrite suggests.",
      ],
      durationMinutes: 12,
      difficulty: "easy",
    },
    {
      question:
        "What trace of weathering looks almost deliberate?",
      objective:
        "Consider where time has produced something like design.",
      instructions: [
        "Find a stain, fade, or erosion pattern on a hard surface.",
        "Describe its shape and colour without guessing its cause first.",
        "Then offer two possible causes and note which feels likelier.",
      ],
      durationMinutes: 15,
      difficulty: "challenging",
    },
  ],

  invisible_systems: [
    {
      question:
        "Where does rainwater go after it disappears from view?",
      objective:
        "Follow one drop's route through the built environment.",
      instructions: [
        "Find a drain, gully, or channel where water clearly collects.",
        "Trace its visible connections as far as you can.",
        "Note what you can and cannot confirm about the rest of the route.",
      ],
      durationMinutes: 15,
      difficulty: "easy",
    },
    {
      question:
        "Which pipe, cable, or vent tells you what happens inside this building?",
      objective:
        "Read external infrastructure as a clue to internal function.",
      instructions: [
        "Choose one visible fitting on a building's exterior.",
        "Describe what it likely carries or removes.",
        "Look for a second clue that supports or contradicts your reading.",
      ],
      durationMinutes: 15,
      difficulty: "moderate",
    },
    {
      question:
        "How does a crossing decide when you may walk?",
      objective:
        "Understand the small logic that governs a crossing.",
      instructions: [
        "Observe one pedestrian crossing without crossing yet.",
        "Note the signals, markings, and sounds that coordinate movement.",
        "Reflect on who or what the system optimises for.",
      ],
      durationMinutes: 10,
      difficulty: "easy",
      safetyNotes: [
        "Stay on the pavement while observing; cross only when it is your turn.",
      ],
    },
    {
      question:
        "Where is electricity made visible, and where is it hidden?",
      objective:
        "Map the visible and invisible edges of a power system.",
      instructions: [
        "Find one obvious sign of power: a meter, a cable, a light.",
        "Find one place where it runs out of sight.",
        "Note what the transition between them looks like.",
      ],
      durationMinutes: 15,
      difficulty: "moderate",
    },
    {
      question:
        "Which sign exists for a system you cannot see at all?",
      objective:
        "Notice how invisible services announce themselves.",
      instructions: [
        "Look for markers: valve flags, cable plates, gas notices, hydrants.",
        "Choose one and read every word on it.",
        "Describe the invisible network it implies.",
      ],
      durationMinutes: 12,
      difficulty: "easy",
    },
    {
      question:
        "What keeps this place clean, and when does it happen?",
      objective:
        "Observe the maintenance system operating around you.",
      instructions: [
        "Look for evidence of routine: bins, sweep marks, schedules, crews.",
        "Guess the rhythm of that maintenance.",
        "Note what would fail first if it stopped.",
      ],
      durationMinutes: 15,
      difficulty: "moderate",
    },
    {
      question:
        "How does water leave this roof, and where does it land?",
      objective:
        "Trace one complete drainage path by eye.",
      instructions: [
        "Find a downpipe or gutter outlet on a nearby building.",
        "Follow it down to where discharge meets the ground.",
        "Note the wear that marks repeated wetting.",
      ],
      durationMinutes: 12,
      difficulty: "easy",
    },
    {
      question:
        "Which object here regulates temperature without being noticed?",
      objective:
        "Identify passive climate control in ordinary architecture.",
      instructions: [
        "Look for vents, shutters, awnings, deep reveals, or shade trees.",
        "Choose one and describe what it does to heat or air.",
        "Consider who decided it belonged there.",
      ],
      durationMinutes: 15,
      difficulty: "moderate",
    },
    {
      question:
        "Where do two systems share the same pole, wall, or trench?",
      objective:
        "Notice infrastructure that has learned to coexist.",
      instructions: [
        "Find one structure carrying more than one service.",
        "List the systems you can identify on it.",
        "Reflect on how their arrangement looks — planned or accumulated.",
      ],
      durationMinutes: 15,
      difficulty: "challenging",
    },
    {
      question:
        "What happens here automatically that someone once did by hand?",
      objective:
        "Detect automation hidden in everyday behaviour.",
      instructions: [
        "Watch for something triggered without human action: a light, a gate, a flush.",
        "Describe the trigger and the response.",
        "Imagine the manual version it replaced.",
      ],
      durationMinutes: 12,
      difficulty: "easy",
    },
  ],

  human_traces: [
    {
      question:
        "Which path looks most used, even if it isn't the official path?",
      objective:
        "Read the desire lines people have worn into a place.",
      instructions: [
        "Compare paved routes with shortcuts across grass or floor.",
        "Choose the one that looks most travelled and describe its surface.",
        "Consider what it says about how people actually move.",
      ],
      durationMinutes: 15,
      difficulty: "easy",
    },
    {
      question:
        "Where has someone adapted something to make it work better?",
      objective:
        "Notice an improvised improvement made by a user.",
      instructions: [
        "Look for tape, a wedge, a re-hung handle, a moved sign.",
        "Describe the problem the adaptation solves.",
        "Note how carefully or hastily it was done.",
      ],
      durationMinutes: 15,
      difficulty: "easy",
    },
    {
      question:
        "Which surface shows the mark of countless hands?",
      objective:
        "Find where repeated touch has polished or worn a material.",
      instructions: [
        "Inspect handles, rails, knobs, and edges for shine or wear.",
        "Choose one and describe the pattern of use it reveals.",
        "Reflect on the many unnamed people who left it.",
      ],
      durationMinutes: 12,
      difficulty: "easy",
    },
    {
      question:
        "Where have people left a message that wasn't meant to last?",
      objective:
        "Notice informal marks: notes, stickers, scrawls, arrangements.",
      instructions: [
        "Find one piece of temporary human expression.",
        "Read or describe it without judging its author.",
        "Consider why it was left where it was.",
      ],
      durationMinutes: 12,
      difficulty: "moderate",
      safetyNotes: [
        "Do not touch, remove, or copy anything left by others; observe only.",
      ],
    },
    {
      question:
        "Which bench, step, or ledge has become a place to sit unofficially?",
      objective:
        "See how people claim surfaces for rest.",
      instructions: [
        "Find a surface people have adopted as seating.",
        "Look for wear, cushions, or arrangement around it.",
        "Describe the need it quietly satisfies.",
      ],
      durationMinutes: 12,
      difficulty: "easy",
    },
    {
      question:
        "What has been fixed in a way that only its owner would choose?",
      objective:
        "Recognise personal, non-standard maintenance.",
      instructions: [
        "Look for a repair that breaks the visual uniformity around it.",
        "Describe the materials or method used.",
        "Consider what that choice prioritised.",
      ],
      durationMinutes: 15,
      difficulty: "moderate",
    },
    {
      question:
        "Where do people wait, when there is nowhere designed for waiting?",
      objective:
        "Observe improvised gathering and waiting spaces.",
      instructions: [
        "Find a spot where people pause: a doorway, a wall edge, a corner.",
        "Describe what makes it comfortable or tolerable.",
        "Note what is missing that would make it deliberate.",
      ],
      durationMinutes: 15,
      difficulty: "moderate",
    },
    {
      question:
        "Which boundary here has been softened by use rather than by design?",
      objective:
        "Notice edges worn into openness by people passing.",
      instructions: [
        "Look for a fence corner, hedge gap, or kerb that people have widened.",
        "Describe how the material responded to repeated passage.",
        "Reflect on negotiation between rules and behaviour.",
      ],
      durationMinutes: 15,
      difficulty: "challenging",
    },
    {
      question:
        "What small act of care has someone performed here recently?",
      objective:
        "Look for evidence of tending rather than building.",
      instructions: [
        "Find something watered, swept, straightened, or decorated.",
        "Describe the effort it represents.",
        "Consider what motivates anonymous care.",
      ],
      durationMinutes: 12,
      difficulty: "easy",
    },
    {
      question:
        "Where has a group left a pattern of use that no individual would?",
      objective:
        "See collective behaviour written into a space.",
      instructions: [
        "Look for repeated marks, worn clusters, or aligned habits.",
        "Describe the pattern without attributing it to one person.",
        "Reflect on how coordination happens without instruction.",
      ],
      durationMinutes: 18,
      difficulty: "challenging",
    },
  ],
};
