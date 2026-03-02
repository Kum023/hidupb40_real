# B40 Life Simulator - TiDB Podcast Presentation
## 1st Place Winner: Best Use of TiDB

---

## 🎯 PART 1: UNDERSTANDING B40 (3-5 mins)

### What is B40?

**B40 = Bottom 40% of Malaysian households by income**

| Income Tier | Monthly Income | % of Population |
|-------------|----------------|-----------------|
| **B40** | < RM4,850 | 40% (~13 million people) |
| M40 | RM4,850 - RM10,959 | 40% |
| T20 | > RM10,959 | 20% |

### The Reality of B40 Life in Malaysia

**Financial Struggles:**
- Fresh graduates start with **RM30,000 PTPTN** (student loan) debt
- Average starting salary: **RM2,200/month** in KL
- Rent alone takes **40-60%** of income
- One emergency can spiral into debt trap

**The "Along" Problem:**
- Desperate borrowing from loan sharks (Along) at 200%+ interest
- Many can't access formal banking due to low credit scores
- Cycle of poverty perpetuates

**Cultural Context:**
- "Makan gaji" (living paycheck to paycheck) is normalized
- Financial literacy not taught in schools
- Shame around discussing money struggles

### Why This Matters

> "60% of Malaysian youth cannot handle a RM1,000 emergency"
> — Malaysian Financial Planning Council

**Our Question:** What if we could teach financial literacy through *lived experience* instead of boring pamphlets?

---

## 🎮 PART 2: THE GAME - B40 LIFE SIMULATOR (5 mins)

### Core Concept

**An AI-powered financial life simulation game where players:**
1. Choose a persona (Fresh Graduate or Single Parent)
2. Navigate a 2D Malaysian neighborhood map
3. Make daily financial decisions with real consequences
4. Experience 4 weeks of B40 life
5. Learn through consequences, not lectures

### Two Personas

| Persona | Location | Salary | Debt | Starting Credit |
|---------|----------|--------|------|-----------------|
| **Fresh Graduate** | Kuala Lumpur | RM2,200/month | RM30,000 (PTPTN) | 650 |
| **Single Parent** | Penang | RM1,800/month | RM7,000 (Personal Loan) | 580 |

### Game Locations

```
🏠 Home           → Rest, receive calls, random events
🏢 Office         → Work (earn salary), overtime decisions
🛒 Kedai Pak Ali  → Buy groceries (healthy vs unhealthy choice)
⛽ Petronas       → Fill petrol (budget vs full tank)
🏦 Bank           → Pay debt (Week 4 mandatory)
⚡ TNB Office     → Pay electricity (avoid disconnection)
```

### The AI-Powered Experience

**Claude AI (Haiku) acts as Game Master:**
- Generates unique scenarios based on player state
- NPCs remember past interactions
- Uses authentic **Manglish** dialogue:
  > "Eh adik, nak bayar cash ke? Last month you hutang kan, I give you discount la since old customer"
  > — Pak Ali (Shop Owner NPC)

### Weekly Gameplay Loop

```
Week 1-4:
├── Day 1-5 (Weekdays)
│   ├── Start with 11 energy points
│   ├── Must work at Office (earns salary portion)
│   ├── Visit locations for scenarios
│   ├── Complete objectives: groceries, petrol
│   └── Random events may trigger
├── Weekend
│   ├── Choose activity (costs money, reduces stress)
│   ├── Or skip (free, but stress increases)
│   └── >>> DATA SYNCED TO TiDB <<<
└── Week 4 End
    └── >>> FINAL SYNC TO TiDB <<<
```

### Game Over Conditions

| Condition | Ending Type | Lesson Taught |
|-----------|-------------|---------------|
| Health ≤ 0 | Health Crisis | Neglecting health has consequences |
| Stress ≥ 100 | Burnout | Work-life balance matters |
| Money < -500 | Bankruptcy | Living beyond means |
| Credit < 300 | Credit Destroyed | Financial reputation matters |
| Week 4 complete | Survived/Thrived | Good planning works |

---

## 🏗️ PART 3: SYSTEM ARCHITECTURE (5-7 mins)

### Dual Database Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                      │
│                 Next.js 16 + React 19 + Tailwind + PixiJS                 │
│                                                                            │
│   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────────┐          │
│   │  Setup   │ → │   Game   │ → │  Ending  │   │  Analytics   │          │
│   │  Page    │   │   Page   │   │   Page   │   │  Dashboard   │          │
│   └──────────┘   └──────────┘   └──────────┘   └──────────────┘          │
└───────────────────────────────────────────────────────────────────────────┘
          │              │               │                │
          ▼              ▼               ▼                ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                           CONVEX (Real-time DB)                            │
│                                                                            │
│   Purpose: Hot data, live gameplay, instant reactivity                    │
│   Tables: games, decisions, creditEvents, bills, scheduledEvents          │
│   Features: Real-time subscriptions, < 100ms latency, TypeScript native   │
└───────────────────────────────────────────────────────────────────────────┘
          │                                              │
          ▼                                              ▼
┌─────────────────────────────┐        ┌────────────────────────────────────┐
│     Claude AI (Anthropic)   │        │           TiDB Cloud               │
│                             │        │                                     │
│  • Scenario generation      │        │  Purpose: Cold analytics, research │
│  • NPC dialogue             │        │  Tables:                            │
│  • Ending narratives        │        │   • completed_games                 │
│  • Manglish localization    │        │   • player_decisions                │
│                             │        │   • weekly_snapshots                │
│  Model: claude-3-5-haiku    │        │  Features: SQL, HTAP, serverless   │
└─────────────────────────────┘        └────────────────────────────────────┘
```

### Why Two Databases?

| Requirement | Convex (Hot) | TiDB (Cold/Analytics) |
|-------------|--------------|----------------------|
| **Latency** | < 100ms | < 1s acceptable |
| **Data Type** | Active game state | Historical records |
| **Query Pattern** | Point lookups | Complex aggregations |
| **Cost** | Per-operation | Serverless on demand |
| **Use Case** | Live gameplay | Research insights |

### Data Flow Visualization

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          DATA FLOW TIMELINE                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  GAME START                                                              │
│  ─────────────────                                                       │
│  └── Convex: Create game record with initial stats                      │
│                                                                          │
│  DAILY GAMEPLAY (Real-time, ~50 decisions per game)                     │
│  ─────────────────                                                       │
│  ├── Player clicks location → Convex: Update position                   │
│  ├── Claude AI: Generate scenario (100-200ms)                           │
│  ├── Player makes choice → Convex: Record decision + update stats       │
│  └── Loop until energy depleted                                         │
│                                                                          │
│  WEEK END (Sync Point #1, #2, #3)                                       │
│  ─────────────────                                                       │
│  ├── Weekend activity selected → Convex: Apply changes                  │
│  ├── Advance week → Convex: Reset objectives                            │
│  └── 🔄 SYNC TO TIDB: weekly_snapshots + player_decisions              │
│                                                                          │
│  GAME OVER (Sync Point #4)                                              │
│  ─────────────────                                                       │
│  ├── Game state finalized → Convex: Mark complete                       │
│  ├── Claude AI: Generate personalized ending                            │
│  ├── 🔄 SYNC TO TIDB: completed_games + all decisions                  │
│  └── Leaderboard updated (both Convex + TiDB)                           │
│                                                                          │
│  ANALYTICS QUERIES (Any time, from TiDB)                                │
│  ─────────────────                                                       │
│  └── Dashboard fetches aggregated insights via SQL views                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 PART 4: HOW TiDB POWERS OUR ANALYTICS (7-10 mins)

### TiDB Schema Design

```sql
-- 3 Core Tables for Analytics

-- 1. Completed Games: Final game results
CREATE TABLE completed_games (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    convex_game_id VARCHAR(255) NOT NULL UNIQUE,
    player_name VARCHAR(255) NOT NULL,
    persona_id VARCHAR(50) NOT NULL,           -- 'freshGrad' or 'singleParent'
    final_money INT NOT NULL,
    final_credit_score INT NOT NULL,
    final_health INT NOT NULL,
    final_stress INT NOT NULL,
    final_debt INT NOT NULL,
    weeks_completed INT NOT NULL,              -- 1-4
    ending_type VARCHAR(50) NOT NULL,          -- 'survived', 'bankruptcy', 'burnout', etc.
    failure_reason VARCHAR(255),               -- Why they failed (if applicable)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_persona (persona_id),
    INDEX idx_ending (ending_type)
);

-- 2. Player Decisions: Every choice for behavior analysis
CREATE TABLE player_decisions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    convex_game_id VARCHAR(255) NOT NULL,
    location VARCHAR(50) NOT NULL,             -- 'shop', 'office', 'bank', etc.
    choice_text VARCHAR(500) NOT NULL,         -- The option they selected
    money_change INT NOT NULL,                 -- ±RM impact
    credit_change INT NOT NULL,                -- ±credit score impact
    health_change INT NOT NULL,
    stress_change INT NOT NULL,
    day INT NOT NULL,
    week INT NOT NULL,
    INDEX idx_location (location),
    INDEX idx_week_day (week, day)
);

-- 3. Weekly Snapshots: State capture at each week end
CREATE TABLE weekly_snapshots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    convex_game_id VARCHAR(255) NOT NULL,
    week INT NOT NULL,
    money INT NOT NULL,
    health INT NOT NULL,
    stress INT NOT NULL,
    objectives_completed BOOLEAN NOT NULL,     -- Did they complete all weekly goals?
    weekend_activity VARCHAR(100),             -- 'rest', 'mamak', 'skip', etc.
    is_game_over BOOLEAN NOT NULL,
    UNIQUE KEY idx_game_week (convex_game_id, week)
);
```

### Why TiDB? (Key Selling Points)

| Feature | How We Use It |
|---------|---------------|
| **MySQL Compatibility** | Used `mysql2` library directly, no learning curve |
| **Serverless Scaling** | Perfect for hackathon budget - pay only for queries |
| **Complex SQL Support** | Window functions, CTEs, subqueries for analytics |
| **HTAP Capability** | Same database for both OLTP syncs and OLAP analytics |
| **Cloud Native** | No infrastructure management needed |

### Analytics Queries We Run

**1. Global Statistics**
```sql
SELECT
    COUNT(*) as total_games,
    AVG(final_money) as avg_final_money,
    AVG(final_credit_score) as avg_credit_score,
    (SUM(CASE WHEN ending_type = 'survived' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as success_rate
FROM completed_games;
```

**2. Persona Performance Comparison**
```sql
SELECT
    persona_id,
    COUNT(*) as total_games,
    AVG(final_money) as avg_final_money,
    AVG(weeks_completed) as avg_weeks_completed,
    (SUM(CASE WHEN ending_type = 'survived' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as success_rate
FROM completed_games
GROUP BY persona_id;
```

**3. Failure Pattern Analysis**
```sql
SELECT
    failure_reason,
    persona_id,
    COUNT(*) as count,
    AVG(weeks_completed) as avg_week_failed
FROM completed_games
WHERE failure_reason IS NOT NULL
GROUP BY failure_reason, persona_id
ORDER BY count DESC;
```

**4. Weekly Survival Funnel**
```sql
SELECT
    week,
    COUNT(DISTINCT convex_game_id) as started,
    SUM(CASE WHEN is_game_over = FALSE THEN 1 ELSE 0 END) as survived
FROM weekly_snapshots
GROUP BY week
ORDER BY week;
```

**5. Behavioral Insights (Key Stats)**
```sql
-- Unhealthy food choice rate
SELECT
    (SUM(CASE WHEN choice_text LIKE '%instant noodles%' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as unhealthy_rate
FROM player_decisions
WHERE location = 'shop';

-- Overtime acceptance rate
SELECT
    (SUM(CASE WHEN choice_text LIKE '%overtime%' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as overtime_rate
FROM player_decisions
WHERE location = 'office';
```

### TiDB Views for Dashboard

```sql
-- Global Statistics View
CREATE VIEW global_stats AS
SELECT
    COUNT(*) as total_games,
    AVG(final_money) as avg_final_money,
    AVG(final_credit_score) as avg_credit_score,
    (SUM(CASE WHEN ending_type = 'survived' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as success_rate
FROM completed_games;

-- Leaderboard with Window Functions
CREATE VIEW leaderboard_top50 AS
SELECT
    ROW_NUMBER() OVER (ORDER BY final_money DESC) as rank,
    player_name,
    persona_id,
    final_money,
    final_credit_score,
    weeks_completed,
    ending_type
FROM completed_games
ORDER BY final_money DESC
LIMIT 50;

-- Per-Persona Leaderboard (TiDB handles partitioning efficiently)
CREATE VIEW persona_leaderboard AS
SELECT * FROM (
    SELECT
        ROW_NUMBER() OVER (PARTITION BY persona_id ORDER BY final_money DESC) as persona_rank,
        player_name,
        persona_id,
        final_money
    FROM completed_games
) ranked
WHERE persona_rank <= 10;
```

### Sync Architecture

```typescript
// convex/tidbSync.ts - Fire-and-forget sync to TiDB

export const syncWeeklyProgress = action({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    // 1. Fetch game state from Convex
    const game = await ctx.runQuery(internal.games.getGame, { gameId: args.gameId });

    // 2. Fetch this week's decisions
    const decisions = await ctx.runQuery(internal.games.getWeekDecisions, {
      gameId: args.gameId,
      week: game.currentWeek
    });

    // 3. POST to our API which writes to TiDB
    await fetch(`${APP_URL}/api/analytics/sync`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${INTERNAL_API_KEY}` },
      body: JSON.stringify({
        type: "weekly",
        snapshot: { /* weekly snapshot data */ },
        decisions: decisions
      })
    });
  }
});
```

```typescript
// lib/tidb.ts - Transaction helper for atomic operations

export async function withTransaction<T>(
  callback: (connection: PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Used for atomic batch insert of player decisions
await withTransaction(async (conn) => {
  await conn.execute("DELETE FROM player_decisions WHERE convex_game_id = ?", [gameId]);
  await conn.execute("INSERT INTO player_decisions ... VALUES ...", flatValues);
});
```

---

## 📈 PART 5: ANALYTICS INSIGHTS WE GENERATE (5 mins)

### Dashboard Overview

Our analytics dashboard (powered entirely by TiDB) shows:

**Global Metrics**
- Total games played
- Average final money
- Average credit score
- Success rate (% who survived 4 weeks)

**Key Behavioral Insights**
| Metric | What It Reveals |
|--------|-----------------|
| Unhealthy Food Rate | % choosing instant noodles over vegetables to save RM20 |
| Weekend Skip Rate | % who skip rest to save money (leads to burnout) |
| Overtime Accept Rate | % who accept extra work despite high stress |
| Debt Payment Rate | % who successfully pay debt in Week 4 |
| Avg Dropout Week | Which week do most players fail? |

**Survival Funnel**
```
Week 1: 100 started → 85 survived (85%)
Week 2: 85 started → 60 survived (71%)
Week 3: 60 started → 45 survived (75%)
Week 4: 45 started → 30 survived (67%)

Overall: 30% complete the game
```

**Persona Comparison**
- Fresh Graduate: Higher income but bigger debt (PTPTN)
- Single Parent: Lower income but more government aid events
- Which persona has higher survival rate? (Interesting data point!)

### Research Data Export

```
/api/analytics/export?format=csv&includeDecisions=true
/api/analytics/export?format=json&includeDecisions=true
```

Export includes:
- All completed games with final stats
- All player decisions with timestamps
- Weekly snapshots for progression analysis

---

## 🤖 PART 6: FUTURE ML & AI APPLICATIONS (5-7 mins)

### Machine Learning Opportunities

**1. Decision Pattern Clustering**
```
Use Case: Group players by decision-making style
Data: player_decisions (location, choice_text, outcomes)
Model: K-Means / DBSCAN clustering
Output:
  - "Risk Takers" (skip insurance, max overtime)
  - "Conservative Planners" (save first, rest prioritized)
  - "Emotional Spenders" (retail therapy, weekend splurges)
```

**2. Failure Prediction Model**
```
Use Case: Predict if player will fail before Week 4
Data: weekly_snapshots (money trajectory, stress levels, objective completion)
Model: Random Forest / XGBoost classifier
Features:
  - Money trend (slope)
  - Stress acceleration
  - Consecutive missed objectives
  - Weekend skip streak
Output: Probability of failure + recommended intervention
```

**3. Personalized Difficulty Adjustment**
```
Use Case: Make game harder/easier based on player skill
Data: Historical games from similar personas
Model: Reinforcement learning / bandit algorithm
Output: Dynamic adjustment of:
  - Random event frequency
  - NPC generosity (discounts, credit limits)
  - Salary bonuses
```

**4. Financial Literacy Assessment**
```
Use Case: Score players on financial literacy dimensions
Data: Choice patterns across locations
Dimensions:
  - Budgeting (shop choices, petrol planning)
  - Risk Management (insurance, emergency fund)
  - Delayed Gratification (overtime vs rest)
  - Credit Awareness (bank visits, debt payment)
Output: Personalized learning recommendations
```

### TiDB's Role in ML Pipeline

```
┌────────────────────────────────────────────────────────────────┐
│                      ML PIPELINE                                │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  DATA COLLECTION (TiDB)                                         │
│  ─────────────────────                                          │
│  └── 3 tables: completed_games, player_decisions, snapshots    │
│                                                                 │
│  FEATURE ENGINEERING (TiDB SQL)                                │
│  ─────────────────────                                          │
│  └── SQL views with aggregations, window functions, CTEs       │
│  └── Example: "decisions_per_week", "stress_trajectory"        │
│                                                                 │
│  MODEL TRAINING (Python + TiDB)                                │
│  ─────────────────────                                          │
│  └── mysql-connector-python to query TiDB                      │
│  └── pandas/sklearn for model training                         │
│  └── Store model predictions back to TiDB                      │
│                                                                 │
│  INFERENCE (Real-time via TiDB)                                │
│  ─────────────────────                                          │
│  └── Model stored as ONNX or serialized in TiDB               │
│  └── Fast point lookups for real-time predictions              │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### Potential Feature Engineering Queries

```sql
-- Feature: Money trajectory (Week 1 → Week 4)
SELECT
    convex_game_id,
    MAX(CASE WHEN week = 1 THEN money END) as week1_money,
    MAX(CASE WHEN week = 4 THEN money END) as week4_money,
    (MAX(CASE WHEN week = 4 THEN money END) - MAX(CASE WHEN week = 1 THEN money END)) as money_change
FROM weekly_snapshots
GROUP BY convex_game_id;

-- Feature: Stress acceleration (rate of stress increase)
SELECT
    convex_game_id,
    (MAX(stress) - MIN(stress)) / NULLIF(MAX(week) - MIN(week), 0) as stress_per_week
FROM weekly_snapshots
GROUP BY convex_game_id;

-- Feature: Location preference ratio
SELECT
    convex_game_id,
    SUM(CASE WHEN location = 'shop' THEN 1 ELSE 0 END) / COUNT(*) as shop_ratio,
    SUM(CASE WHEN location = 'office' THEN 1 ELSE 0 END) / COUNT(*) as work_ratio
FROM player_decisions
GROUP BY convex_game_id;
```

---

## 🌍 PART 7: WORLD IMPACT & SOCIAL GOOD (3-5 mins)

### Immediate Impact

**1. Financial Literacy Education**
- Schools can use this as an interactive teaching tool
- Students experience consequences, not lectures
- Memorable learning through emotional engagement

**2. Empathy Building**
- Upper/middle class Malaysians experience B40 struggles
- Challenges stereotypes ("they're poor because they're lazy")
- Creates understanding for policy discussions

**3. Research Data for Policymakers**
- Real behavioral data on financial decision patterns
- Identify common failure points (Week 2 dropout spike?)
- Evidence for designing better social safety nets

### Long-Term Vision

**1. Government Integration**
- Partner with AKPK (Credit Counselling Malaysia)
- Integrate with Bantuan MySara (government aid) education
- Use in EPF (pension fund) financial literacy programs

**2. Banking Sector**
- Banks can use to educate customers on credit scores
- Gamified onboarding for first-time borrowers
- Reduce loan defaults through preventive education

**3. Academic Research**
- Export data for behavioral economics studies
- Compare decision patterns across demographics
- Publish findings on financial literacy gaps

### The "Aha Moment"

> When a player chooses instant noodles to save RM20, then later faces a hospital bill because of poor health — they *feel* the consequence.
>
> That emotional learning sticks far longer than reading "eat healthy to save medical costs" in a pamphlet.

---

## 🚀 PART 8: FUTURE ROADMAP (3 mins)

### Near-Term (1-3 months)

- [ ] **More Personas**: Factory Worker JB, Hawker Stall Owner, Gig Worker
- [ ] **Bahasa Malaysia**: Full localization for wider reach
- [ ] **Voice-Over**: ElevenLabs narration for accessibility
- [ ] **Mobile App**: React Native version for phone play

### Medium-Term (3-6 months)

- [ ] **Multiplayer Mode**: Compare decisions with friends
- [ ] **School Curriculum**: Partner with MOE for pilot program
- [ ] **ML Integration**: Predictive analytics on player behavior
- [ ] **A/B Testing**: Use TiDB data to test game balance changes

### Long-Term (6-12 months)

- [ ] **API Platform**: Let researchers query anonymized data
- [ ] **Regional Expansion**: Singapore B20, Indonesia adaptation
- [ ] **Government Partnership**: Official AKPK/EPF integration
- [ ] **Impact Measurement**: Pre/post financial literacy testing

### TiDB's Role Going Forward

| Phase | TiDB Usage |
|-------|------------|
| Current | Analytics dashboard, research export |
| Near-term | A/B test analysis, player segmentation |
| Medium-term | ML feature store, prediction serving |
| Long-term | Multi-region data, research API platform |

---

## 📝 PART 9: DEMO WALKTHROUGH (Live Demo)

### Demo Script

1. **Landing Page** → Show persona selection
2. **Game Map** → Walk to Kedai Pak Ali, show AI scenario
3. **Decision Making** → Choose between healthy/unhealthy food
4. **Stats Panel** → Show how choice affects health/money
5. **Analytics Dashboard** → Show TiDB-powered insights
6. **Export Feature** → Download CSV for research

### Key Demo Points

- Point out the "Powered by TiDB" badge on analytics page
- Show a complex SQL query running against TiDB
- Demonstrate real-time sync (complete a week, show data in TiDB)
- Export sample research data

---

## 🎤 PART 10: INTERVIEW TALKING POINTS

### One-Liners to Remember

> "We use Convex for the heartbeat, TiDB for the brain"

> "Every decision in the game becomes a row in TiDB — that's thousands of data points teaching us about financial behavior"

> "TiDB's MySQL compatibility meant zero learning curve. We connected in 30 minutes"

> "Serverless TiDB was perfect for hackathon — we paid nothing until we had real traffic"

### Questions They Might Ask

**Q: Why not just use Convex for everything?**
> A: Convex is amazing for real-time gameplay, but for complex analytical queries like "what percentage of players who chose unhealthy food also failed due to health issues", TiDB's SQL capabilities are essential. It's the right tool for the right job.

**Q: How much data do you store in TiDB?**
> A: About 50-100 decisions per game, plus weekly snapshots. With thousands of games, that's substantial behavioral data. TiDB handles it seamlessly with serverless scaling.

**Q: What was the hardest part of TiDB integration?**
> A: Honestly, setting up SSL certificates was the trickiest part. The actual SQL and queries? Felt like working with any MySQL database. That compatibility is TiDB's superpower.

**Q: What's the most surprising insight from your data?**
> A: [Check your actual data and have a real stat ready!] Something like: "Players who skip weekend rest are 3x more likely to burn out — we didn't expect the correlation to be that strong."

---

## 📎 APPENDIX: LINKS & RESOURCES

### Project Links
- **Live Demo**: https://hidupb40.vercel.app
- **Analytics Dashboard**: https://hidupb40.vercel.app/analytics
- **GitHub**: [Your repo URL]

### Team
- **Redzwan Latif** (Team Lead) - https://linkedin.com/in/redzl/
- **Muhammad Shafeeq** - https://linkedin.com/in/muhammad-shafeeq-971ab2232/
- **Adam Danial** - https://linkedin.com/in/adam-danial/

### Tech Stack
- Next.js 16 + React 19
- Convex (real-time database)
- TiDB Cloud (analytics database)
- Claude AI (Anthropic)
- Vercel (hosting)

---

## ⏱️ PRESENTATION TIMING

| Section | Duration | Running Total |
|---------|----------|---------------|
| B40 Context | 3-5 min | 5 min |
| The Game | 5 min | 10 min |
| Architecture | 5-7 min | 17 min |
| TiDB Deep Dive | 7-10 min | 27 min |
| Analytics | 5 min | 32 min |
| Future ML | 5-7 min | 39 min |
| World Impact | 3-5 min | 44 min |
| Roadmap | 3 min | 47 min |
| Demo | 5-10 min | 57 min |
| Q&A | 5+ min | 60+ min |

**Suggested Short Version (15-20 min):**
- B40 Context (3 min)
- Game Overview (3 min)
- Architecture + TiDB (5 min)
- Key Insights (3 min)
- Future Plans (2 min)
- Quick Demo (4 min)

---

*Good luck with the interview! You've built something impactful. 🚀*
