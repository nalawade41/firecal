# WealthTrack — Frontend Implementation Rules

> These rules govern all code written by AI agents in this project.
> No server/backend in the initial version — everything runs client-side.

---

## 1. Tech Stack (Non-Negotiable)

| Layer | Choice |
|-------|--------|
| Framework | React 19 + TypeScript + Vite |
| UI Components | shadcn/ui (New York style) + Radix UI primitives |
| Styling | Tailwind CSS 4 + `wt-*` component classes from `index.css` |
| Icons | Lucide React only |
| Class Utility | `cn()` from `@/lib/utils` (clsx + tailwind-merge) |
| Package Manager | Yarn 4 |
| Path Alias | `@/` maps to `./src/` |

**Do NOT introduce:** MUI, Ant Design, Chakra, styled-components, CSS modules, emotion, Redux, Zustand, or any other UI/state library.

---

## 2. Folder Structure — Feature-Based Co-location

Every feature owns its own `types/`, `constants/`, `hooks/`, and `sections/` folders alongside the main component file. Shared code lives at the global level.

```
src/
├── components/
│   ├── ui/                          # shadcn/ui primitives + app composites (GlassPanel, StatBox, etc.)
│   ├── layout/                      # AppShell, navigation
│   ├── fire/                        # FIRE calculator — form, summary, table
│   │   ├── index.ts                 # Barrel export
│   │   ├── FireForm.tsx             # Input form
│   │   ├── FireSummary.tsx          # Results summary
│   │   ├── FireTable.tsx            # Year-by-year projections
│   │   ├── hooks/
│   │   ├── types/
│   │   ├── constants/
│   │   ├── sections/
│   │   └── utils/
│   ├── tax-harvest/                 # LTCG tax harvesting — form, results
│   │   ├── index.ts
│   │   ├── TaxHarvestForm.tsx
│   │   ├── TaxHarvestResults.tsx
│   │   ├── hooks/
│   │   ├── types/
│   │   ├── constants/
│   │   ├── sections/
│   │   └── utils/
│   └── tracking/                    # All tracking-related UI components
│       ├── dashboard/               # Dashboard tiles, cards, charts
│       │   ├── NetWorthTile.tsx
│       │   ├── GoalCard.tsx
│       │   ├── hooks/
│       │   ├── types/
│       │   ├── constants/
│       │   └── sections/
│       └── onboarding/              # Onboarding wizard — steps, goal tabs
│           ├── OnboardingFlow.tsx
│           ├── hooks/
│           ├── types/
│           ├── constants/
│           ├── steps/
│           └── utils/
├── pages/                           # Route-level page components (thin orchestrators)
│   ├── FireCalculator/              # FIRE calculator page
│   ├── TaxHarvest/                  # LTCG tax harvest page
│   └── Tracking/                    # Portfolio tracking — contains all tracking sub-pages
│       ├── TrackingPage.tsx         # Entry point — onboarding vs dashboard
│       ├── Dashboard/              # Dashboard sub-page (own hooks, types, constants)
│       │   ├── DashboardPage.tsx
│       │   ├── hooks/
│       │   ├── types/
│       │   └── constants/
│       ├── hooks/                   # Tracking-level hooks
│       ├── types/
│       └── constants/
├── hooks/                           # GLOBAL hooks shared across features
├── lib/
│   └── utils.ts                     # cn(), formatINR(), formatUnits(), formatDate()
├── types/
│   └── index.ts                     # GLOBAL types (FireInputs, FireResults, etc.)
├── engine/                          # Pure calculation logic — no React imports
├── services/                        # External API calls (AMFI, metal prices)
├── store/                           # Storage abstraction (keys, adapters)
│   ├── storage.ts                   # Interface + typed helpers (readJSON, writeCache, etc.)
│   ├── keys.ts                      # All storage keys + TTL constants
│   └── local-storage/adapter.ts     # localStorage adapter (swap for sessionStorage, etc.)
├── themes/
│   └── wealthtrack.css              # Single source of truth — CSS vars, wt-* classes, animations
├── routes/
│   ├── AppRoutes.tsx
│   └── routes.constants.ts
└── utils/
    └── utils.ts                     # cn(), formatINR(), formatUnits(), formatDate()
```

### Rules:

- **`pages/` holds route entry points only.** Each page is a thin orchestrator that imports components from `components/`. Page-specific hooks, types, and constants co-locate in the page folder.
- **`components/` holds reusable feature UI.** Grouped by domain: `fire/`, `tax-harvest/`, `dashboard/`, `onboarding/`. Never put page-level orchestration here.
- **Every component feature folder has an `index.ts`** barrel export for clean imports: `import { FireForm } from "@/components/fire"`.
- **Local first:** If a type, constant, or hook is used by ONE feature, it lives in that feature's folder. Only promote to global (`src/types/`, `src/hooks/`) when shared by 2+ features.
- **Never put component-specific types in `src/types/index.ts`.** That file is for core business domain types only.
- **sections/ subfolder** is for breaking large components into smaller pieces that are only used by the parent feature.
- **ui/ folder** is for shadcn/ui primitives and app composites (GlassPanel, StatBox, etc.). Do not put feature components here.
- **engine/ folder** contains pure TypeScript calculation functions. No React imports, no JSX. These functions must be independently testable.

---

## 3. Design System & Theming

### 3.1 Source of Truth

- **Single file:** `src/themes/wealthtrack.css` — all CSS custom properties (`--wt-*`), component classes (`wt-*`), and animations
- No JS token file — everything is CSS-first. If you need a token value in JS, read it from the CSS var at runtime with `getComputedStyle`

### 3.2 Never Hardcode Design Values

```ts
// WRONG
<div style={{ background: 'rgba(255,255,255,0.62)' }}>
<div className="bg-[rgba(255,255,255,0.62)]">

// RIGHT — use the wt- class
<div className="wt-glass">

// RIGHT — use CSS variable in Tailwind arbitrary value
<div className="text-[var(--wt-ink2)]">

// RIGHT — reference token in JS when needed
import { tokens } from "@/themes/wealthtrack"
const color = tokens.colors.green
```

### 3.3 App Composite Components (Layer 3)

The design system has 3 layers. Layer 1 = CSS classes (`wt-*`), Layer 2 = shadcn/ui primitives (`Button`, `Input`), Layer 3 = app composites below. **Always prefer a composite over raw HTML+Tailwind.**

| Component | Import | Purpose |
|-----------|--------|---------|
| `GlassPanel` | `@/components/ui/glass-panel` | Glass card with optional title, description, headerAction. Variants: `light`, `dark`, `pine`. Replaces all raw `wt-glass` + header combos. |
| `StatBox` | `@/components/ui/stat-box` | Coloured metric box with label, monospace value, optional subtext. Colors: `green`, `amber`, `red`, `blue`. Sizes: `sm`, `lg`. |
| `StatusBadge` | `@/components/ui/status-badge` | Inline pill badge. Variants: `green`, `amber`, `red`, `blue`, `gray`, `glass`. Optional leading icon. |
| `MoneyValue` | `@/components/ui/money-value` | Wraps any formatted number in DM Mono. Optional color. Use for all `formatINR()` / `formatUnits()` output. |
| `AlertPanel` | `@/components/ui/alert-panel` | Coloured callout box with icon + title + body. Variants: `green`, `amber`, `red`, `blue`. |
| `DataTable` | `@/components/ui/data-table` | Scrollable table with sticky header. Use with `DataTableHead`, `DataTableHeaderRow`, `DataTableRow`, `Th`, `Td`. `Td` supports `mono` and `align` props. |

**Rules:**
- **Never hand-write a glass card.** Use `<GlassPanel>`. If you need the title+description header, pass `title` and `description` props.
- **Never hand-write a stat/metric box.** Use `<StatBox>`.
- **Never hand-write a badge.** Use `<StatusBadge>`.
- **Never inline `font-['DM_Mono',monospace]`.** Use `<MoneyValue>` or `<Td mono>`.
- **Never hand-write a table with sticky headers.** Use `<DataTable>` + friends.
- **Never hand-write an alert/callout.** Use `<AlertPanel>`.

If a composite doesn't fit your use case, extend the composite with a new prop — don't bypass it with raw markup.

### 3.4 Glass Tiers

| Class | Use Case |
|-------|----------|
| `wt-glass` | Primary cards, goal cards, modals (white-tinted, dark text) |
| `wt-glass-dark` | Secondary panels, SIP widget, allocation donut |
| `wt-glass-pine` | Hero panels like FIRE widget (dark green, white text) |
| `wt-topbar` | Navigation bar only |

**Rule:** Blur only on the FIRST layer separating content from background. Inner elements (table rows, metric boxes) use solid `rgba` fills — NEVER additional `backdrop-filter`.

### 3.5 Colour Tokens

| Token | CSS Var | Use |
|-------|---------|-----|
| pine `#1A3A28` | `--wt-pine` | Deepest background |
| forest `#2D5A40` | `--wt-forest` | Button gradient start |
| sage `#4A8060` | `--wt-sage` | Input focus borders |
| mint `#7BB89A` | `--wt-mint` | Active nav, live indicators |
| foam `#C8E6D4` | `--wt-foam` | Light tints |
| mist `#EEF7F2` | `--wt-mist` | Lightest surfaces |
| green `#1D6B3E` | `--wt-green` | On-track, positive, primary buttons |
| amber `#8B5E0A` | `--wt-amber` | Warnings, pending, monitor status |
| red `#8B2020` | `--wt-red` | Behind, errors |
| blue `#1A4A8A` | `--wt-blue` | Info, SIP badge |

**Ink (text on light glass):** `--wt-ink` (primary), `--wt-ink2` (secondary/muted), `--wt-ink3` (hint/placeholder)

### 3.6 Typography

| Role | Font | Weights | Use |
|------|------|---------|-----|
| Body/UI | DM Sans | 400, 500 only | All UI text, labels, buttons |
| Monospace | DM Mono | 400, 500 | NAV values, units, folio numbers, financial numbers |
| Display/Serif | Cormorant Garamond | 500, 600 italic | Logo, onboarding questions, hero taglines |

**Rule:** Never use font-weight 600 or 700 on DM Sans. The design system only uses 400 (normal) and 500 (medium).

### 3.7 Status Colour Coding (Universal)

Same thresholds everywhere — cards, badges, progress bars:

| Status | Condition | Colour |
|--------|-----------|--------|
| On Track | >= 90% | `green` / `--wt-green` |
| Monitor | 50–89% | `amber` / `--wt-amber` |
| Behind | < 50% | `red` / `--wt-red` |

Progress bar gradient tokens: `tokens.colors.progress.green`, `.amber`, `.red`

### 3.8 Goal Type Accent Colours

Defined in `tokens.colors.goalAccent`. Each goal type has a distinct top-border colour on its card:

| Goal Type | Accent |
|-----------|--------|
| FIRE | `#1D6B3E` (green) |
| SCHOOL | `#7B3FA0` (purple) |
| GRADUATION | `#C87820` (amber) |
| MARRIAGE | `#0B5345` (teal) |
| WHITE_GOODS | `#212F3D` (slate) |
| CUSTOM | `#212F3D` (slate) |

### 3.9 Two Visual Modes

| Mode | Input Style | Text |
|------|-------------|------|
| Onboarding | `wt-ob-input` classes — dark glass, white text | White on dark |
| Dashboard | `wt-input` / standard — light bg, dark text | Dark on light glass |

Never mix onboarding dark-mode styling into dashboard screens or vice versa.

---

## 4. Component Patterns

### 4.1 Dumb Components + Hook Pattern

**Components are dumb renderers. All logic lives in hooks.**

A component's job is to receive data and render JSX. It must NOT contain:
- `useState`, `useEffect`, `useMemo`, `useCallback` directly
- Conditional business logic, calculations, or data transformations
- Event handler implementations (only passes them through from hooks)

Instead, every feature exposes a custom hook that owns all state and logic. The component calls the hook and spreads the result into JSX.

```tsx
// WRONG — logic inside component
export function GoalDetail({ goal }: GoalDetailProps) {
  const [expanded, setExpanded] = useState(false)
  const progress = goal.currentValue / goal.targetCorpus
  const status = progress >= 0.9 ? "green" : progress >= 0.5 ? "amber" : "red"

  return <div>...</div>
}

// RIGHT — component is a dumb renderer
export function GoalDetail({ goal }: GoalDetailProps) {
  const { progress, status, expanded, toggleExpanded } = useGoalDetail(goal)

  return <div>...</div>
}
```

**Hook returns everything the component needs:**
```tsx
// hooks/useGoalDetail.ts
export function useGoalDetail(goal: Goal) {
  const [expanded, setExpanded] = useState(false)
  const progress = calculateProgress(goal)
  const status = getProgressStatus(progress)

  return {
    progress,
    status,
    expanded,
    toggleExpanded: () => setExpanded(prev => !prev),
  }
}
```

**When a component has no state or logic** (purely presentational with only props), it does not need a hook. Only create hooks when there is state, derived data, or event handlers.

### 4.2 Split Into Small, Focused Components

Break components into smaller pieces in the `sections/` subfolder. Each section should do ONE thing and fit on roughly one screen of code (~50-80 lines of JSX max).

**When to split:**
- A component has 2+ visually distinct sections (header, body, footer)
- A block of JSX is repeated with variations (card in a list)
- A section has its own expand/collapse, tab, or interaction — give it its own hook + component pair
- The JSX exceeds ~80 lines

**When NOT to split:**
- A component is already small and simple
- Splitting would create a component used exactly once with only 1-2 props passed through

**Example structure for a complex feature:**
```
goal-detail/
├── GoalDetail.tsx                   # Root — calls useGoalDetail, composes sections
├── hooks/
│   ├── useGoalDetail.ts             # Root hook — state + orchestration
│   ├── useFolioRegister.ts          # Hook for the folio table section
│   └── useAllocationValidator.ts    # Hook for allocation % logic
├── sections/
│   ├── GoalHeader.tsx               # Goal name, type icon, accent border
│   ├── ProgressPanel.tsx            # Progress bar, status badge, gap metric
│   ├── FolioRegister.tsx            # Table of folios — calls useFolioRegister
│   └── AllocationBar.tsx            # Live 100% validator — calls useAllocationValidator
├── types/
│   └── GoalDetail.types.ts
└── constants/
    └── GoalDetail.constants.ts
```

**Each section component follows the same rule:** if it has logic, that logic lives in its own hook. Sections that are purely presentational (just receive props and render) do not need hooks.

### 4.3 shadcn/ui Components

All shadcn components use CVA (Class Variance Authority) for variants:

```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
```

When creating new UI primitives, follow the shadcn pattern: CVA variants, `cn()` for class merging, `React.forwardRef` when needed.

### 4.4 Feature Component File

```tsx
// components/goal-detail/GoalDetail.tsx

// 1. React imports
import { useState } from "react"

// 2. Third-party imports (icons, etc.)
import { Target, TrendingUp } from "lucide-react"

// 3. Global imports (@/ alias)
import { cn, formatINR } from "@/lib/utils"
import { tokens } from "@/themes/wealthtrack"
import type { GoalBucket } from "@/types"
import { Card } from "@/components/ui/card"

// 4. Local imports (relative paths)
import type { GoalDetailProps } from "./types/GoalDetail.types"
import { GOAL_METRICS } from "./constants/GoalDetail.constants"
import { useGoalDetail } from "./hooks/useGoalDetail"
import { GoalHeader } from "./sections/GoalHeader"
import { ProgressPanel } from "./sections/ProgressPanel"
import { FolioRegister } from "./sections/FolioRegister"

export function GoalDetail({ goal }: GoalDetailProps) {
  const { progress, status, folios } = useGoalDetail(goal)

  return (
    <Card className="wt-glass">
      <GoalHeader goal={goal} />
      <ProgressPanel progress={progress} status={status} />
      <FolioRegister folios={folios} />
    </Card>
  )
}
```

### 4.5 Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Component files | PascalCase | `GoalDetail.tsx` |
| Hook files | camelCase with `use` prefix | `useGoalProgress.ts` |
| Type files | `FeatureName.types.ts` | `GoalDetail.types.ts` |
| Constant files | `FeatureName.constants.ts(x)` | `GoalDetail.constants.tsx` |
| CSS classes | `wt-` prefix for custom | `wt-glass`, `wt-btn-primary` |
| CSS variables | `--wt-` prefix | `--wt-green`, `--wt-glass-bg` |
| Folders | kebab-case | `goal-detail/`, `results-summary/` |

### 4.6 Export Pattern

- Named exports for components: `export function GoalDetail() {}`
- Barrel exports from `index.ts` only when the feature is imported by many consumers
- Never use default exports

---

## 5. Money & Number Formatting

- Use `formatINR()` from `@/lib/utils` for all currency display
- Use `formatUnits()` for mutual fund unit counts
- Use `formatDate()` for date display
- Financial numbers (NAV, units, folio numbers) render in monospace font (`font-family: 'DM Mono'`)
- Never format money inline — always use the utility

---

## 6. Calculation Engine Rules

- All financial formulas live in `src/engine/` as pure functions
- No React imports or JSX in engine files
- Every formula must be independently unit-testable
- Components call engine functions — they never contain calculation logic inline
- Engine functions receive plain data and return plain data (no hooks, no state)

---

## 7. Import Order

Maintain this order in every file, separated by blank lines:

1. React / React Router
2. Third-party libraries (lucide-react, recharts, etc.)
3. Global imports via `@/` alias (lib, types, themes, components/ui)
4. Local relative imports (./types, ./hooks, ./sections, ./constants)

---

## 8. General Coding Rules

- Strict TypeScript — no `any`, no `@ts-ignore`, no `as` type assertions unless truly unavoidable
- Functional components only — no class components
- Named exports only — no default exports
- Use `cn()` for all dynamic class name composition
- Prefer Tailwind utility classes. Fall back to `wt-*` component classes for complex glass/button/input styling
- Do not add comments, docstrings, or type annotations to code you didn't change
- Do not add error handling or validation for scenarios that can't happen
- Do not create abstractions for one-time operations
- Do not introduce new dependencies without explicit approval

---

## 9. Design Context

### Users
WealthTrack serves two overlapping audiences in the Indian market:

1. **DIY retail investors** (25-40): Young to mid-career professionals managing their own mutual fund portfolios, planning for FIRE, and optimizing taxes. They want clarity without hand-holding.
2. **Serious wealth planners / HNIs** (35-55): Users with complex multi-goal portfolios (education, marriage, retirement), significant assets, and active tax harvesting needs. They expect density and precision.

The interface must provide a clean entry point that doesn't overwhelm newcomers while offering the depth and information density that power users demand. Progressive disclosure is key — simple surfaces that reveal sophistication through interaction.

**Context of use**: Desktop-primary, used during focused financial planning sessions (evenings, weekends). Users are making consequential decisions about their money and need to feel confident in what they see.

### Brand Personality
**Smart. Ambitious. Modern.**

Like a fintech disruptor — forward-thinking, data-rich, and empowering. The interface should make users feel capable and in control. Think Wealthfront/Betterment's clean confidence crossed with the nature-grounded calm already established in the design system.

**Emotional goals**: Confidence through clarity, empowerment through data visibility, satisfaction through precision.

### Aesthetic Direction
- **Visual tone**: Clean fintech with an organic twist — the forest/mint/sage palette differentiates against the typical blue/purple fintech sea
- **Reference**: Wealthfront, Betterment — modern dashboards that are data-forward yet visually trustworthy
- **Anti-reference**: Avoid Bloomberg-style density without hierarchy. Avoid generic "startup SaaS" aesthetics (purple gradients, floating 3D blobs, neon on dark). Avoid anything that feels like a bank from 2010
- **Theme**: Dark backgrounds (forest-toned) with light glass cards. Dual-mode (dark onboarding, light-on-dark dashboard) is intentional

### Design Principles
1. **Clarity over cleverness** — Every visual choice must serve comprehension
2. **Progressive depth** — Simple at first glance, powerful on closer inspection
3. **Precision as personality** — Monospace numbers, exact percentages, specific dates communicate competence
4. **Nature-grounded confidence** — Forest/green palette signals organic growth, stability, and long-term thinking
5. **Respect the user's intelligence** — No dumbed-down tooltips for obvious things, trust users with their financial data
