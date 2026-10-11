# Outverse — Reference Research Report

Date: 2026-10-11
Scope: design references supplied for the Outverse frontend redesign.
Method: every claim below was verified by fetching the cited URL (raw source,
registry JSON, or live page) or is explicitly marked **inferred**. No source
code, repository, or package was invented. Where a reference's source could not
be accessed, that limitation is stated and the fallback is documented.

Verification tooling used: raw file fetches from GitHub/WebFetch, shadcn
registry JSON downloaded verbatim, and a live JS-executing browser session used
to observe and inspect zapier.com/zapconnect, buckssauce.com, and
annnimate.com in their rendered state.

---

## Reference D — React Bits "Fold Text" (wordmark intro)

- URL: https://reactbits.dev/text-animations/fold-text?text=outverse&duration=1&stagger=0.05&perspective=725&fontSize=88
- Official repository (verified via GitHub API): https://github.com/DavidHDev/react-bits
  - 48.9k stars, homepage reactbits.dev, license `MIT + Commons Clause v1.0`
    (LICENSE.md — free to use and adapt inside a product; may not resell the
    components themselves as a library).
- Exact source files inspected (fetched verbatim):
  - `src/ts-default/TextAnimations/FoldText/FoldText.tsx`
  - `src/ts-default/TextAnimations/FoldText/FoldText.css`
- Defining mechanics (from source):
  - Per-glyph 3D fold: each glyph is a `.fold-text-segment` (own
    `perspective`, default 700px) wrapping a `.fold-text-piece` that rotates
    from ±92° about a hinge edge (`transform-origin` per `hinge` prop:
    top/bottom/left/right; default hinge `top` → origin `50% 0%`,
    `rotateX: -92`).
  - **Crease shading**: an `::after` overlay per glyph
    (`mix-blend-mode: multiply`, dark-to-light gradient) whose opacity is
    driven by the animated CSS custom property `--fold-crease` (0→1→0 across
    the fold). This is what makes it read as folded paper rather than a plain
    rotation.
  - GSAP timeline (`gsap` + `gsap/ScrollTrigger`), `fromTo` with stagger;
    triggers: `mount | hover | scroll | loop`; `power3.out` default ease.
  - Splitting: `char | word | line`; screen-reader copy kept as visually
    hidden text; `prefers-reduced-motion` caps duration/stagger and zeroes
    rotation (CSS also forces `transform: none`).
  - Props relevant to the reference URL: `text`, `duration` (default 0.65),
    `stagger` (default 0.045), `perspective` (default 700), `fontSize`
    (default 80). The URL asks for duration 1, stagger 0.05, perspective 725,
    fontSize 88 — all valid prop values.
- Required dependencies: `gsap` (npm; GreenSock standard "no-charge" license —
  since the Webflow acquisition all GSAP is free including commercial use).
- License/attribution: MIT + Commons Clause; keep the license notice when
  adapting source.
- Reproducible faithfully: **yes** — by using the original component
  (adding `gsap`) and adapting only styling/props to Outverse.
- Integration approach: port the official component into
  `frontend/src/animations/fold-text/FoldText.tsx` + `FoldText.css`
  (mechanics unchanged), used in the Home intro with
  `text="OUTVERSE" duration={1} stagger={0.05} perspective={725}`,
  trigger `mount`, once per browser-tab session (sessionStorage flag),
  reduced-motion respected (component already handles it).

## Reference E — React Bits Pro "Staggered Text"

- URL: https://pro.reactbits.dev/docs/components/staggered-text
- Status (verified by fetching the docs page): **paid React Bits Pro
  component** (tiers $129 / $249 / $349, commercial license, no public
  source; "access requires a paid license key via the shadcn registry").
- Documented behavior (from the public docs page): text staggers in by
  `segmentBy: chars | words | lines`, with `direction` (top/bottom/left/right),
  optional blur, `delay`, `duration`, `easing`, `staggerDirection`.
- Official repository: the open repo
  (https://github.com/DavidHDev/react-bits, verified via the `src/ts-default`
  tree) contains **no** StaggeredText — consistent with it being Pro-only.
- Reproducible faithfully: **the proprietary source cannot be used** (not
  accessible; copying would violate the source-reuse rules).
- Fallback (documented, not silent): an original approximation implementing
  the documented behavior — word-level segments rising from a clipped
  container (direction=top semantics) with configurable
  delay/stagger/duration and reduced-motion handling. The existing
  `frontend/src/animations/StaggeredText.tsx` is close to this; it will be
  reviewed against the documented API (segment-level stagger, direction,
  optional blur) and clearly labelled as an original approximation of the
  documented behavior, not the Pro component.

## Reference F — React Bits "Scroll Expand"

- URL: https://reactbits.dev/animations/scroll-expand
- Official repository: https://github.com/DavidHDev/react-bits (same license
  as above).
- Exact source files inspected (fetched verbatim):
  - `src/ts-default/Animations/ScrollExpand/ScrollExpand.tsx`
  - `src/ts-default/Animations/ScrollExpand/ScrollExpand.css`
- Defining mechanics (from source):
  - A pinned (sticky) stage inside a taller scroll track; scroll progress
    `p` (0–1) drives: `clip-path: inset(iy% ix% iy% ix% round r px)`
    expanding from `startWidth×startHeight` (percent, default 42×58, radius
    24→0) to full-bleed; media `scale()` settling from `mediaZoom` (default
    1.35) to 1; scrim fades in; title/hint/overlay fade at staggered
    smoothstep windows.
  - Exponential smoothing loop on rAF (`k = 1 − e^(−1/(60·smoothing))`),
    `useWindowScroll` option, reduced-motion applies progress instantly.
- Required dependencies: none beyond React (plain CSS + rAF).
- Suitability note (required by the brief): the official component is a
  **scroll-scrubbed media reveal**, not a click-triggered route transition.
  Using it literally for "tap a mission card → briefing" does not fit
  (there is no scroll span between two routes). Per the brief's allowance,
  the adaptation reuses its defining mechanics — clip-path inset expansion
  with rounded corners, smoothstep progression, scale settle — but drives
  the progress from the selection moment (a ~0.6 s timeline) and then hands
  off to the briefing route. The current overlay animates left/top/width/
  height (layout properties); the adapted one animates `clip-path` +
  transform only, matching the official technique and avoiding layout
  thrash.
- Reproducible faithfully: **yes, as an adapted technique** (original
  component mechanics, click-driven trigger). Clearly labelled as adapted.

## Reference G — React Bits "Click Spark"

- URL: https://reactbits.dev/animations/click-spark
- Official repository: https://github.com/DavidHDev/react-bits
- Exact source file inspected (fetched verbatim):
  `src/ts-default/Animations/ClickSpark/ClickSpark.tsx`
- Defining mechanics (from source): a full-area `<canvas>`; each click pushes
  `sparkCount` line sparks (evenly spaced angles); on each rAF frame sparks
  move outward by `eased · sparkRadius · extraScale` while line length
  `sparkSize · (1 − eased)` shrinks; sparks are **lines**, not dots; easing
  selectable (`ease-out` default); canvas sized to the wrapper via
  ResizeObserver.
- Required dependencies: none (canvas 2D).
- Adaptation (documented): the official component wraps children and emits on
  any click inside the wrapper. Outverse needs sparks only for meaningful
  selections (mission select / accept). The drawing mechanics are kept
  verbatim; the trigger is adapted to an imperative emit API
  (`emit(x, y)`) mounted once at layout level, so restrained usage is
  guaranteed. Reduced motion: sparks suppressed.
- Reproducible faithfully: **yes** — original component, trigger adapted.

## Reference I — React Bits "Flowing Menu"

- URL: https://reactbits.dev/components/flowing-menu
- Official repository: https://github.com/DavidHDev/react-bits
- Exact source files inspected (fetched verbatim):
  - `src/ts-default/Components/FlowingMenu/FlowingMenu.tsx`
  - `src/ts-default/Components/FlowingMenu/FlowingMenu.css`
- Defining mechanics (from source):
  - Each menu row is `overflow: hidden`; a marquee layer
    (infinite GSAP x-translate of repeated `text + image` parts, computed
    repetition count) sits `translate3d(0, ±101%, 0)` off-stage.
  - On pointer enter/leave, `findClosestEdge()` picks the nearest horizontal
    edge; the marquee slides in from that edge while the text inside slides
    from the opposite edge (GSAP `expo` ease, 0.6 s) — the signature
    "flowing" exchange.
  - Keyboard/focus: link is a plain anchor (focusable); marquee layer is
    `pointer-events: none` and `aria-hidden`.
- Required dependencies: `gsap`.
- Adaptation (documented): used for the **four-pillar presentation** on Home
  (exactly the four existing pillars; no new navigation destinations). Each
  row keeps its link to `/explore/:pillar`; the marquee "image" is replaced
  by the pillar's contour motif (inline SVG), fitting the Outverse visual
  identity. The three-item primary nav stays a conventional top nav (the
  brief forbids adding navigation destinations to imitate the reference).
- Reproducible faithfully: **yes** — original mechanics, content adapted.

---

## Reference A — Zapier ZapConnect (immersive scroll & background)

- URL: https://zapier.com/zapconnect
- What the page actually is (verified by downloading the raw HTML and by
  live browser inspection): a **Framer-built** marketing page
  (`data-framer-name` attributes throughout, assets on
  `framerusercontent.com`), credited in Framer's gallery to Adriano Reis.
- Lenis (verified): a Framer component literally named
  `Lenis (smooth scroll)` loads `https://unpkg.com/lenis@1.3.23/dist/lenis.css`;
  Lenis's official showcase lists the site:
  https://lenis.dev/showcase/zapconnect ("Site: ZapConnect. Author: Adriano
  Reis. Tech: Framer.").
- Hero/background behavior (verified in live browser):
  - Full-bleed looping muted `<video>` hero (Cloudinary-hosted, autoplay,
    `loop` — therefore **not scroll-scrubbed**), with masked/feathered edges.
  - A wrapper element named `Hero & Subhero transition` scrolls while the
    `Hero` holds pinned at `top: 0` — i.e. a **pinned hero** that the next
    section slides over; the `Earth` background element drifts slightly
    downward with scroll (measured +12 px across 1200 px of scroll — gentle
    scroll-linked parallax, not a state machine).
  - Repeated `line` wrappers indicate Framer's per-line staggered text
    appears (inferred — exact easing not inspectable).
  - No GSAP, WebGL/Three, canvas, or CSS scroll-timeline found in the HTML.
- Official source: **none published** (it is a Framer site; no repo). This is
  an honest limitation — the technique stack is verified, the exact animation
  code is not accessible.
- Adaptation to Outverse (documented):
  - Add `lenis` (npm `lenis`, v1.3.x, MIT, verified — "runs on native
    scroll", so it composes with `motion/react`'s `useScroll`; React adapter
    `lenis/react`). Disabled under `prefers-reduced-motion`.
  - Rebuild the Home hero as a **pinned, scroll-driven cinematic sequence**:
    sticky hero stage; scroll progress drives layered topographic terrain
    (layers at different rates — scale/translate between visual states, not
    only vertical drift), coordinated text reveals (staggered lines), and
    the following section sliding over the pinned terrain (the verified
    ZapConnect pattern). Terrain remains Outverse's own SVG artwork — the
    reference's branding/video content is deliberately not copied.
- Reproducible faithfully: **technique yes, footage no** (their video assets
  are proprietary; the defining scroll architecture — Lenis + pinned hero +
  scroll-linked layer movement + staggered line reveals — is reproduced with
  Outverse's own topographic artwork).

## Reference B — Bucks Sauce (pillar reveal & motion)

- URL: https://buckssauce.com
- Access: the site blocks plain HTTP clients (429/Vercel challenge), but it
  loaded in the live browser session used for this research; findings below
  are from that rendered session plus secondhand listings.
- Stack (verified in live DOM): React/Next + Tailwind-style utilities +
  **Lenis active** (`lenis` present, `data-lenis-prevent` on overlays) +
  **GSAP inline-style fingerprint** everywhere (per-element inline
  `translate: none; rotate: none; scale: none; transform: …`,
  `will-change: transform, opacity`, `translate-z-0 backface-hidden`
  classes = GSAP `force3D` output, `data-svgOrigin` on SVG groups).
- Observed motion (verified in live browser):
  - **Scattered scroll-linked parallax**: multiple visual elements drift at
    individually different rates with slight rotations — measured inline
    transforms like `translate(0%, 22.07%) … rotate(4.41deg)` vs
    `translate(0%, 1.61%) … rotate(0.32deg)` on sibling items; percentages
    change with scroll (organic, non-uniform motion — not a uniform grid
    fade-in).
  - A **page-transition overlay**: `fixed top-0 left-0 w-full h-dvh z-9999
    [clip-path:inset(0)]` (currently collapsed to 0 height when idle) —
    a clip-path-driven wipe layer for navigation.
  - Text-roll buttons (`data-textFirst` / `data-textSecond`, duplicate label
    with second copy at `opacity: 0`).
- Corroboration (secondhand, fetched by the research subagent): Awwwards
  Site of the Day + Developer Award (awwwards.com/sites/bucks-sauce), CSS
  Design Awards "parallax" tag, uicoach/landing.love list it under GSAP
  examples. Studio: Buzzworthy Studio. **No public repo or case study with
  actual animation source.**
- Adaptation to Outverse (documented): the four pillars become an **editorial
  staggered composition** — each pillar block (asymmetric offsets, distinct
  contour motif) enters with staggered line/element reveals and carries a
  gentle scroll-linked drift (unique speed + rotation per block) matching the
  observed pattern; implemented with `motion/react` `useScroll`/`useTransform`
  per block (equivalent mechanics, existing dependency — GSAP is already
  entering the stack for References D/I, but per-block scroll links map 1:1
  onto motion's scroll-linked transforms, so motion is used here).
- Reproducible faithfully: **behavior yes** (measured from the live site);
  exact GSAP timelines are unpublished, so values are tuned by comparison
  against the live reference.

## Reference C — Annnimate (frame-expansion transition)

- URL: https://annnimate.com (referred with Lenis partnership params)
- What the site is now (verified live + via subagent fetches): a **paid GSAP
  component library** ("GSAP Motion Components for React & Vue") by Ilja van
  Eck / Good Fella studio. 115+ components; membership €29/mo or €249/yr;
  Landmark Kits €149. Free components exist (e.g. Text Reveal, Curtain
  Slider) but page-transition building blocks are **member-locked**:
  "The full source … is locked. Get the code" (verified on
  /animations/breakout-media).
- Verified on https://annnimate.com/patterns/page-transition: Annnimate
  ships **no drop-in page-transition component**; the documented building
  blocks are **Mask Reveal** (clip-path shape masks) and **Flip Zone**
  (FLIP-style shared-element morphs). Documented mechanism, quoted from the
  pattern page: "Built with a leave/enter pair coordinated through GSAP,
  often using the Flip plugin for shared-element morphs"; production guide
  (verified at /docs/guides/production) says animate only
  transform/opacity/clip-path — never layout properties.
- GitHub: org https://github.com/GoodFellaStudio has **no public component
  repository** (verified; `annnimate-old` is an unrelated template fork).
- The historical "frame-expansion" snippet could not be verified (old site
  not archived; current catalog has related but different components:
  Breakout Media = scroll-driven media growth to full-bleed; Expanding Strip
  = hover panels; Morphing Island = capsule grows into menus — all verified
  from public descriptions).
- Reproducible faithfully: **the source is not legally/technically
  accessible** — documented per the source-reuse rules.
- Fallback (documented, not silent): an original frame-expansion page
  transition following the publicly documented technique vocabulary:
  a bordered "frame" expands to cover the viewport via `clip-path: inset()`
  (never layout properties), the route swaps beneath, the frame recedes;
  restricted to major section navigation (Home ⇄ Active Missions ⇄ Field
  Journal), never on every click. The existing `PageFrameOverlay` already
  implements a scale-based variant; it will be reworked to the clip-path
  technique so the mechanism matches the reference family (and the technique
  observed live on buckssauce.com's `[clip-path:inset(0)]` overlay).

---

## Reference H — Componentry "Orbit Card Stack"

- URL: https://componentry.dev/docs/components/orbit-card-stack
- Official source (verified): distributed as a shadcn registry item —
  `npx shadcn@latest add @componentry/orbit-card-stack`, registry JSON at
  https://componentry.dev/r/orbit-card-stack.json (downloaded verbatim;
  single file `components/ui/orbit-card-stack.tsx`, 9.9 kB). Official
  repository verified via GitHub API: https://github.com/harshjdhv/componentry
  (MIT, homepage componentry.dev).
- Defining mechanics (from the registry source):
  - Two layout states per card: **closed** (tight overlapping deck:
    `x = stack·10`, `y = |stack|·5`, `rotation = stack·2.8`) and **open**
    (fanned arc: `x = orbit·spread` around the deck's midpoint,
    `y = |orbit|·30 + extras`, `rotation = orbit·8.5`), where `spread`
    (default 168) and `lift` (default 34) are props.
  - Cards are absolutely centred and moved purely with
    `translate(...) rotate(...) scale(...)` + CSS transition
    (420 ms, `cubic-bezier(.2,.8,.2,1)`); z-index by distance from the
    active card; the active card lifts by `lift` px when open.
  - Activation: `mouseenter`, `focus`, or click on any card opens the fan and
    lifts the active card; `mouseleave`/blur closes; `onActiveChange` callback.
  - Accessibility: `role="list"`/`listitem`, arrow keys cycle cards,
    Escape closes, focus-visible ring, `aria-current`.
  - It is a **hover deck** — there is no drag/swipe in the original.
- Required dependencies: `framer-motion` (only for `useReducedMotion`) and
  `lucide-react` (both already present in Outverse as `motion`/`lucide-react`).
- Adaptation to Outverse (documented): the five mission cards use the
  orbit-deck layout mechanics (closed deck with readable front card → fan +
  lift on hover/focus) restyled to Outverse parchment/editorial language.
  **Swipe-to-reject is an Outverse extension required by the product spec**
  (§8 requires left/right swipe rejection) and is layered on top of the top
  card using the existing drag-reject logic; the fan remains the presentation
  layer. Keyboard: the deck's arrow-key cycling is remapped to
  reject-then-advance to match the mission workflow; explicit reject buttons
  remain for pointer/AT users.
- Reproducible faithfully: **yes** — original mechanics (MIT), restyled;
  extensions explicitly documented.

---

## Dependency decisions

| Package | Why | License | Verified |
| --- | --- | --- | --- |
| `lenis` (existing: none) | Reference A's defining smooth-scroll layer; runs on native scroll so `motion/react` scroll links keep working | MIT | npm/GitHub + live ZapConnect usage |
| `gsap` (existing: none) | Required by the official React Bits FoldText and FlowingMenu implementations being ported | GreenSock standard no-charge (100% free post-Webflow) | gsap.com / npm |
| `motion` (already installed) | scroll-linked transforms (Refs A/B/F trigger), route transitions | MIT | in repo |
| `framer-motion` | **not added** — `motion` is the same library under its current name; Componentry's `useReducedMotion` import maps to `motion/react` | — | — |

No other animation libraries are introduced. The mock services, store, types,
storage, and the FastAPI backend directory remain untouched by the redesign.

## Honest limitations summary

1. ZapConnect's exact animation code is not published (Framer site) — the
   scroll architecture is reproduced from verified live observation; footage
   is not copied.
2. Bucks Sauce publishes no source — motion values were measured from the
   live site and corroborated by award listings; timelines are tuned, not
   copied.
3. Annnimate's transition code is paywalled; the fallback follows its own
   public documentation (GSAP-family clip-path + FLIP vocabulary) and is an
   original implementation.
4. React Bits Pro Staggered Text is commercial; an original approximation of
   the documented behavior is used and labelled as such.
5. Componentry's Orbit Card Stack has no swipe support; swipe-reject is an
   Outverse extension required by the spec and documented as such.
