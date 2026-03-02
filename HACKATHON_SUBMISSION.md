# B40 Life Simulator - Hackathon Submission

## About the Project

### Inspiration

**60% of Malaysian youth can't handle a RM1,000 emergency.** Financial literacy taught through boring pamphlets? It doesn't work.

We asked ourselves: *What if you could experience financial struggle... in a game?* Learn by living it—before real life teaches you the hard way.

B40 Life Simulator puts players in the shoes of Malaysia's bottom 40% income earners. Walk through a realistic Malaysian neighborhood, visit Kedai Pak Ali, pay your TNB bills, and make impossible choices between food, rent, and debt. Every decision has consequences that ripple through your 4-week journey.

Growing up in Malaysia, we've witnessed firsthand the financial struggles of the B40. The inspiration came from seeing:
- Fresh graduates crushed by PTPTN (student loan) debt starting at RM30,000
- Single parents juggling work and childcare on RM1,800/month
- The impossible choices between paying bills, buying groceries, or keeping sanity

We wanted to create **empathy through lived experience**, not statistics.

### What It Does

B40 Life Simulator is an **AI-powered financial life simulation game** where players:

1. **Choose a persona** - Fresh Graduate in KL with RM30k PTPTN debt, or Single Parent in Penang with RM7k personal loan
2. **Navigate a 2D map** of a Malaysian neighborhood (Kedai Pak Ali, Petronas, TNB office, Bank, Bus Stop)
3. **Make daily financial decisions** - each scenario generated dynamically by Claude AI with hidden consequences
4. **Experience consequences** - past decisions come back to haunt you; NPCs remember your interactions
5. **Survive 4 weeks** - balance money, debt, health, stress, and credit score with only 11 energy per week

The game teaches financial literacy through **showing, not telling**. When you choose instant noodles over vegetables to save RM25, you'll feel your health drop. When you skip debt payments, your credit score tanks.

### How We Built It

**Architecture:**
```
Player walks on map → Visits location → Claude AI generates contextual scenario →
Player makes choice → Game state updates in real-time via Convex →
Past decisions influence future scenarios → Analytics synced to TiDB
```

**Development Process:**
1. **Designed the game loop** - 4-week cycle with weekdays (work + errands) and weekends (leisure/recovery)
2. **Created persona-specific maps** - KL has Sunway Lagoon & Mid Valley, Penang has Penang Hill & Gurney Plaza
3. **Built the AI integration** - Claude generates scenarios with Manglish dialogue, hidden consequences, and emotional callbacks
4. **Implemented real-time state** - Convex handles game state, decisions, leaderboard with live reactivity
5. **Added analytics pipeline** - TiDB stores completed games and player decisions for research insights
6. **Polished the UI** - Framer Motion animations, shadcn/ui components, themed maps per persona

**Key Technical Decisions:**
- **Convex over traditional DB**: Real-time reactivity means leaderboard updates instantly, no polling needed
- **Claude for scenario generation**: Each visit to a location feels unique; the AI remembers your past choices and references them
- **Energy system**: 11 energy points per week forces players to prioritize (just like real life)
- **TiDB for analytics**: Track player behavior patterns, failure reasons, and decision trends for research

### Challenges We Faced

1. **AI Response Consistency**: Getting Claude to output valid JSON with balanced game consequences required careful prompt engineering. We added fallback scenarios for every location for reliability.

2. **State Management Complexity**: Tracking weekly objectives, random events, debt payments, and game-over conditions across 4 weeks with limited energy was challenging. Convex's transactional mutations helped maintain consistency.

3. **Making Failure Feel Fair**: Players shouldn't feel the game is rigged. We balanced random events (positive: "Bantuan MySara" government aid, parent sends money; negative: Mat Rempit robbery, vehicle breakdown).

4. **Cultural Authenticity**: Using Manglish naturally (not forced) in NPC dialogue. Pak Ali's *"I can give you small discount, old customer lah"* had to feel genuine.

5. **TiDB Integration**: Setting up secure SSL connections and ensuring reliable data sync after game completion required transaction handling and error recovery.

### What We Learned

- **Empathy through gameplay** is more powerful than infographics
- **AI-generated content** can be contextual and emotionally resonant when given proper context about past decisions
- **Real-time databases** like Convex remove so much boilerplate for interactive applications
- **Financial literacy** is not about math—it's about understanding trade-offs and delayed consequences
- **Malaysia-specific content** (PTPTN, TNB, Bantuan MySara, Along, Pak Ali) makes the experience authentic
- **Manglish matters**: Authentic dialogue creates emotional resonance that formal English never could

---

## Tracks Included

| Track | How We Use It | Details |
|-------|---------------|---------|
| **Cursor** | Entire project built using Cursor | AI-assisted development with tab autocomplete, inline edits, and agent mode. Three developers, intensive hackathon hours, one powerful tool. |
| **Anthropic (Claude)** | Core AI engine | Claude generates all game scenarios, NPC dialogue (Pak Ali, Encik Ahmad, Puan Siti, Along), choices with consequences, and personalized endings. Using claude-3-5-haiku for fast, contextual responses. |
| **Convex** | Real-time backend | Game state, decisions, leaderboard with live reactivity. TypeScript server functions for mutations and actions. Zero backend boilerplate. |
| **Vercel** | Production deployment | Next.js 16 App Router, automatic preview deployments, edge functions for API routes. |
| **TiDB** | Analytics & research database | MySQL-compatible distributed SQL storing completed games and player decisions. Analytics dashboard shows failure patterns, persona performance, decision trends. Export to CSV/JSON for research. |
| **Ryt Bank (Fintech)** | Financial literacy education | Core purpose is teaching financial literacy through lived experience simulation. Players learn about credit scores, debt management, budgeting, and consequences of financial decisions. |
| **Mobbin (UI/UX)** | Design reference | Polished interface with persona-themed maps (KL: cyberpunk blue, Penang: tropical cyan), Framer Motion animations, responsive mobile-friendly design. |
| **CodeRabbit** | Code review | AI-powered code reviews for every pull request. Catches bugs, suggests improvements, and ensures code quality throughout development. |
| **Groq** | LLM inference | NA |
| **ElevenLabs** | Voice AI | Voice-over narration for video demo submission. Adds professional audio quality to showcase the game. |
| **LeanMCP** | MCP servers | NA |
| **Lindy** | AI agents | NA |
| **Cleve** | Build in public | NA |
| **ByteRover** | Context CLI | NA |
| **Byte In** | Food-powered game | Food/nutrition system integrated into gameplay. Players choose between healthy groceries (vegetables, RM50) vs unhealthy options (instant noodles, RM30). Food choices directly impact health stats, creating consequences for dietary decisions. Restaurant meals also affect health and stress. |
| **Apify** | Actors | NA |
| **HRG** | Indie hacker | NA |
| **Network School** | Overall best | NA |
| **Venture Track** | Business impact | Potential for real social impact—financial literacy education for B40 demographic, research data collection on financial decision patterns. |

---

## Built With

### Languages & Frameworks
| Technology | Purpose |
|------------|---------|
| **TypeScript** | Type-safe development (strict mode) |
| **Next.js 16** | React framework with App Router (latest version) |
| **React 19** | UI library |

### Styling & UI
| Technology | Purpose |
|------------|---------|
| **Tailwind CSS 4** | Utility-first styling |
| **shadcn/ui** | Accessible components (Dialog, Button, Card, Progress, Slider, Input) |
| **Framer Motion** | Smooth animations and transitions |
| **Lucide React** | Icon library |
| **tw-animate-css** | Additional animations |

### Backend & Database
| Technology | Purpose |
|------------|---------|
| **Convex** | Real-time database with TypeScript server functions |
| **TiDB Cloud** | MySQL-compatible distributed SQL for analytics |
| **mysql2** | MySQL driver with connection pooling and SSL |

### AI
| Technology | Purpose |
|------------|---------|
| **Anthropic Claude API** | claude-3-5-haiku-20241022 for scenario generation |
| **@anthropic-ai/sdk** | Official Anthropic SDK |

### Game Rendering
| Technology | Purpose |
|------------|---------|
| **PixiJS** | 2D WebGL rendering for game map |
| **@pixi/react** | React bindings for PixiJS |

### Development & Deployment
| Technology | Purpose |
|------------|---------|
| **Cursor** | AI-powered code editor |
| **Vercel** | Production hosting with edge functions |
| **Convex Cloud** | Managed backend hosting |
| **pnpm** | Fast package manager |
| **ESLint** | Code linting |

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend                                 │
│   Next.js 16 + React 19 + Tailwind + shadcn/ui + Framer Motion  │
│   PixiJS for 2D game map rendering                              │
├─────────────────────────────────────────────────────────────────┤
│                      Convex Client                               │
│   useQuery (real-time) + useMutation + useAction                │
├─────────────────────────────────────────────────────────────────┤
│                      Convex Backend                              │
│   games.ts (mutations) + ai.ts (actions) + leaderboard.ts       │
├──────────────────────────┬──────────────────────────────────────┤
│     Convex Database      │          External Services           │
│   - games                │   ┌────────────────────────────┐     │
│   - decisions            │   │  Anthropic Claude API      │     │
│   - leaderboard          │   │  claude-3-5-haiku          │     │
│   - creditEvents         │   │  (Scenario Generation)     │     │
│   - scheduledEvents      │   └────────────────────────────┘     │
│   - bills                │   ┌────────────────────────────┐     │
│                          │   │  TiDB Cloud                │     │
│                          │   │  - completed_games         │     │
│                          │   │  - player_decisions        │     │
│                          │   │  (Analytics & Research)    │     │
│                          │   └────────────────────────────┘     │
└──────────────────────────┴──────────────────────────────────────┘
```

---

## Key Features

### AI-Powered Scenarios
- **Dynamic generation** based on player state (money, health, stress, credit score)
- **NPCs with memory** - Pak Ali gives credit if you've been loyal; your boss notices missed work
- **Hidden consequences** that trigger 1-3 weeks later
- **Manglish dialogue** that feels authentic (*"Eh adik, mana nak pergi hari ni?"*)

### Persona-Specific Experiences
| Persona | Location | Salary | Starting Debt | Unique Features |
|---------|----------|--------|---------------|-----------------|
| Fresh Graduate | Kuala Lumpur | RM2,200 | RM30,000 PTPTN | City life, Sunway Lagoon, Mid Valley mall, girlfriend events |
| Single Parent | Penang | RM1,800 | RM7,000 Personal Loan | Island vibes, Penang Hill, child-related events, Bantuan MySara |

### Real-Time Features
- Live leaderboard updates as you play
- Instant game state synchronization
- No page refreshes needed

### Analytics Dashboard (TiDB)
- **Global stats**: Total games, success rate, average credit score
- **Failure pattern analysis**: Why do players fail? Which week? Which persona?
- **Decision analytics by location**: Most common choices at each location
- **Export to CSV/JSON** for research purposes

### Food & Nutrition System (Byte In)
- **Grocery choices** at Kedai Pak Ali:
  - Healthy groceries (vegetables, rice): RM50, +10 health
  - Unhealthy groceries (instant noodles): RM30, -5 health
- **Restaurant meals** for stress relief:
  - Fancy meals: Higher cost, better health & stress benefits
  - Budget meals: Lower cost, minimal benefits
- **Consequences**: Poor food choices accumulate—low health triggers medical emergencies
- **Trade-off design**: Save money now with Maggi, pay later with hospital bills

### Game Mechanics
- **11 energy per week** - forces prioritization
- **5 weekdays** - must work every day (or take leave with salary penalty)
- **Weekly objectives** - buy groceries, fill petrol, pay debt (week 4)
- **Weekend activities** - spend money to reduce stress or skip and stress builds up
- **Random events** - both positive (parent sends money) and negative (mat rempit robbery)
- **Credit score system** - affects loan options and game ending

---

## Game Flow

```
Week 1-4 Loop:
├── Day 1-5 (Weekdays)
│   ├── Start with 11 energy
│   ├── Must work at Office (costs 1 energy, earns salary portion)
│   ├── Visit locations for scenarios (costs 1 energy each)
│   ├── Complete objectives: groceries, petrol
│   ├── Random event may trigger (1 per week)
│   └── End day → Next day
├── Weekend
│   ├── Choose activity (costs money, reduces stress)
│   ├── Or skip (free, but stress increases)
│   └── Advance to next week
└── Week 4 End
    ├── Calculate final score
    ├── Sync to TiDB analytics
    └── Show ending based on performance
```

---

## Data Models

### Convex Schema
```typescript
games: {
  playerName, personaId, money, debt, creditScore,
  health, stress, currentDay, currentWeek, currentLocation,
  energyRemaining, weeklyObjectives, isGameOver, endingType
}

decisions: {
  gameId, location, scenarioId, choiceIndex, choiceText,
  moneyChange, creditChange, healthChange, stressChange,
  hiddenConsequence, consequenceTriggered, day, week
}

leaderboard: {
  gameId, playerName, personaId, score, weeksCompleted, endingType
}
```

### TiDB Schema
```sql
completed_games: convex_game_id, player_name, persona_id,
                 final_money, final_credit_score, final_health,
                 final_stress, final_debt, weeks_completed,
                 ending_type, failure_reason

player_decisions: convex_game_id, location, scenario_id,
                  choice_index, choice_text, money_change,
                  credit_change, health_change, stress_change,
                  day, week
```

---

## Screenshots

*[Add screenshots of:]*
- Landing page with persona selection
- Game map (KL and Penang themes)
- Scenario dialog with NPC dialogue
- Weekend activity selection
- Game over screen with stats
- Analytics dashboard
- Leaderboard

---

## Demo

**Live Demo**: [Your Vercel URL]

**How to Play**:
1. Enter your name
2. Choose a persona (Fresh Graduate or Single Parent)
3. Navigate the map and make decisions
4. Complete weekly objectives (work, groceries, petrol)
5. Survive 4 weeks without going bankrupt, health crisis, or mental breakdown!

**Winning Condition**: End week 4 with positive money, health > 0, stress < 100

---

## Social Impact

B40 Life Simulator aims to:
1. **Build empathy** - Let middle/upper-class Malaysians understand B40 struggles
2. **Teach financial literacy** - Through consequences, not lectures
3. **Collect research data** - Analytics on common financial mistakes and failure patterns
4. **Inspire policy discussion** - Show why programs like Bantuan MySara matter

---

## Future Roadmap

- [ ] More personas (Factory Worker JB, Hawker Stall Owner)
- [ ] Multiplayer mode (compare decisions with friends)
- [ ] Voice-over with ElevenLabs
- [ ] Mobile app version
- [ ] School/University curriculum integration
- [ ] Bahasa Malaysia language option

---

## Team

Built with determination and too much kopi during the hackathon.

---

## Links

- **GitHub**: [Repository URL]
- **Live Demo**: [Vercel URL]
- **Video Demo**: [YouTube/Loom URL]
