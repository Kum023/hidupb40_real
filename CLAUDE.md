# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

B40 Life Simulator - A 2D walking map game where players navigate a Malaysian neighborhood, make financial decisions, and experience consequences powered by Claude AI. The game teaches financial literacy through lived experience for the B40 demographic (bottom 40% income earners in Malaysia).

## Tech Stack

- **Framework:** Next.js 16 (App Router) with TypeScript (strict mode), React 19
- **Styling:** Tailwind CSS 4 + shadcn/ui + Framer Motion
- **Primary Database:** Convex (real-time game state with server functions)
- **Analytics Database:** TiDB (MySQL-compatible, for aggregated analytics and research data)
- **AI:** Anthropic Claude API (claude-3-5-haiku for scenarios/endings)
- **Package Manager:** pnpm (preferred)

## Development Commands

```bash
# Install dependencies
pnpm install

# Start Convex dev server (terminal 1) - required for game to function
npx convex dev

# Start Next.js dev server (terminal 2)
pnpm dev

# Lint the codebase
pnpm lint

# Build for production
pnpm build

# Deploy to Vercel
vercel --prod
```

## Architecture

### Dual Database Architecture

**Convex** handles real-time game state:
- Player sessions, decisions, game progress
- Real-time updates for UI
- Mutations and queries for gameplay

**TiDB** handles analytics and research:
- Completed game data synced via API routes
- Aggregated statistics across all players
- Research data export (CSV/JSON)
- Synced from Convex when games complete via `convex/tidbSync.ts`

### Core Game Loop
```
Player walks on map → Visits location → Claude generates scenario →
Player makes choice → Credit score/money/health/stress changes →
Weekly objectives checked → Energy depleted → Weekend activities →
After 4 weeks: Game ends → Data synced to TiDB for analytics
```

### Project Structure
```
app/
├── page.tsx            # Landing page
├── setup/page.tsx      # Persona selection
├── game/page.tsx       # Main game screen (walking map + decisions)
├── ending/page.tsx     # Game over / results with AI-generated summary
├── leaderboard/page.tsx # High scores
├── analytics/page.tsx  # Research dashboard (TiDB data)
└── api/analytics/      # TiDB API routes (sync, stats, export, leaderboard)

convex/
├── schema.ts           # Convex database schema (games, decisions, creditEvents, scheduledEvents, bills, leaderboard)
├── games.ts            # Game state mutations/queries
├── ai.ts               # Claude AI integration (generateScenario, generateEnding)
├── leaderboard.ts      # Leaderboard mutations
└── tidbSync.ts         # Sync completed games to TiDB via API

lib/
├── prompts.ts          # Claude system prompts for scenario/ending generation
├── constants.ts        # Game constants (maps, personas, NPCs, events, weekend activities)
├── tidb.ts             # TiDB connection pool and analytics queries
├── utils.ts            # Utility functions
└── types.ts            # TypeScript types
```

### Key Data Models (Convex)

- **games:** Main game state (money, debt, creditScore, health, stress, energy, weeklyObjectives, currentDay/Week)
- **decisions:** Player choice history with hidden consequences
- **creditEvents:** Credit score change tracking
- **scheduledEvents:** Future consequences, bills, salary
- **bills:** Bill tracking (rent, electricity, water, phone, ptptn, loan)
- **leaderboard:** Top scores

### Game Constants

**Maps:** KL (Fresh Grad) and Penang (Single Parent) with different locations and themes

**Base Locations:** home, shop, petrol, tnb, office, bank + persona-specific weekend locations

**2 Personas:**
- Fresh Grad KL (RM2200/month, RM30k PTPTN debt, 650 credit, 800 starting money)
- Single Parent Penang (RM1800/month, RM7k personal loan, 580 credit, 500 starting money)

**Game Duration:** 4 weeks, 5 weekdays each, 11 energy per week

### Claude Integration

Claude (Haiku model) acts as Game Master generating:
- Immersive scenarios with Manglish dialogue
- NPC personalities (Pak Ali, Boss Encik Ahmad, Roommate Farid, Bank Officer Puan Siti)
- Choices with hidden consequences that trigger later
- Personalized endings based on decision history

Output format is JSON with: narration, npcDialogue, emotion, choices (with consequences).
Fallback scenarios exist in `convex/ai.ts` for when AI is unavailable.

## Environment Variables

```bash
# Convex
CONVEX_DEPLOYMENT=your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# Anthropic
ANTHROPIC_API_KEY=sk-ant-xxxxx

# TiDB (for analytics)
TIDB_HOST=gateway01.xxx.prod.aws.tidbcloud.com
TIDB_PORT=4000
TIDB_USER=your-username
TIDB_PASSWORD=your-password
TIDB_DATABASE=test

# Internal API
NEXT_PUBLIC_APP_URL=http://localhost:3000
INTERNAL_API_KEY=your-internal-key
```

## Design Philosophy

- Show consequences, don't lecture
- Reference past decisions for emotional impact
- NPCs should remember past interactions
- Mix English with Manglish naturally
- Each choice has clear trade-offs (money vs health, now vs later)
- Weekly objectives create urgency (work 5 days, buy groceries, fill petrol, pay debt week 4)
- Random events per persona add unpredictability (vehicle breakdown, family emergencies, government aid)
