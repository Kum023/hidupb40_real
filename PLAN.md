# B40 Life Simulator - Implementation Plan

## Goal
Build a playable financial life simulator game for the hackathon. Target: playable demo by Phase 2 completion.

## Important Notes
- **Language: ENGLISH** - All UI text, Claude prompts, and NPC dialogue must be in English (not Malay/Manglish)
- **Plan Updates** - This file must be updated whenever features are added or changed

---

## Phase 1: Project Bootstrap

### Step 1.1: Initialize Next.js + Dependencies
```bash
pnpm create next-app@14 . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
pnpm add convex @anthropic-ai/sdk framer-motion lucide-react class-variance-authority clsx tailwind-merge
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button card dialog progress
npx convex init
```

### Step 1.2: Create Core Files (in order)
1. `lib/constants.ts` - LOCATIONS, PERSONAS, GAME_CONFIG
2. `lib/types.ts` - TypeScript interfaces
3. `lib/utils.ts` - cn() helper
4. `convex/schema.ts` - Database schema
5. `convex/games.ts` - createGame, getCurrentGame, updateGameState, advanceTime
6. `components/providers/ConvexProvider.tsx` - Convex client wrapper
7. `app/layout.tsx` - Root layout with ConvexProvider

### Step 1.3: Environment Setup
Create `.env.local`:
```
CONVEX_DEPLOYMENT=xxx
ANTHROPIC_API_KEY=sk-ant-xxx
NEXT_PUBLIC_CONVEX_URL=https://xxx.convex.cloud
```

---

## Phase 2: Minimum Playable Game

### Step 2.1: Pages
- `app/page.tsx` - Landing with "Start Game" button
- `app/setup/page.tsx` - Persona selection (3 cards)
- `app/game/page.tsx` - Main game screen

### Step 2.2: Game Components
- `components/game/GameMap.tsx` - Walking map with 7 locations
- `components/game/LocationDialog.tsx` - Scenario interaction modal

### Step 2.3: Claude Integration
- `lib/prompts.ts` - System prompts (in English)
- `convex/ai.ts` - generateScenario, processChoice actions
- `convex/decisions.ts` - Decision storage

**Checkpoint: Walk → See scenario → Make choice → Money changes**

---

## Phase 3: Core Features

### Step 3.1: Stats Display
- `components/game/StatsBar.tsx` - Money, health, stress bars
- `components/game/CreditScore.tsx` - Credit meter

### Step 3.2: Time System
- Implement advanceTime in games.ts (3 actions/day, 7 days/week, 12 weeks)
- Add day/week display to game UI
- Day-end summary modal

### Step 3.3: Consequences
- `convex/creditScore.ts` - Credit calculation logic
- Pass decision history to Claude prompts
- Implement getPendingConsequences query

### Step 3.4: Bills
- Bill payment at TNB/Home locations
- Missed bill = credit penalty
- Bill due warnings in UI

---

## Phase 4: Polish

### Step 4.1: Bank + Loan Shark
- Bank location: check credit, apply for loans
- Loan shark trap scenario when player is desperate

### Step 4.2: Endings
- `app/ending/page.tsx` - Game over screen
- generateEnding action using ENDING_PROMPT

### Step 4.3: Animations
- Choice buttons animate in
- Credit score pulse on change
- Money counter animation

---

## Phase 5: Deploy
```bash
vercel --prod
```

---

## Current Progress
- [x] Phase 1: Project Bootstrap
- [x] Phase 2: Minimum Playable Game
- [ ] Phase 3: Core Features
- [ ] Phase 4: Polish
- [ ] Phase 5: Deploy

---

## Changelog
- Initial plan created
- Phase 1 completed: Next.js 16 + Tailwind v4 + shadcn/ui + Convex setup
- Phase 2 completed: Landing page, setup page, game page, map, dialog, AI integration
- Created: StatsBar, GameMap, LocationDialog components
- Created: lib/prompts.ts, convex/ai.ts for Claude integration
- Created: app/ending/page.tsx for game endings
