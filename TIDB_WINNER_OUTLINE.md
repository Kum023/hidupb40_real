# TiDB 1st Place Winner - Interview & Promotion Outline

## 🏆 Award Details
- **Award:** 1st Place - Best Use of TiDB
- **Project:** B40 Life Simulator
- **Team Leader:** Redzwan Latif

## 📅 Scheduled Events

### Interview with TiDB Community Manager
- **Date:** 18 December 2025 (Tomorrow)
- **Time:** 3:00 PM SGT
- **Format:** Quick call (invite sent to redzwanlatif@gmail.com)
- **Purpose:** Short interview for podcast and social media feature

---

## 🎤 Interview Talking Points

### 1. Project Introduction
- "B40 Life Simulator is a financial literacy game targeting Malaysia's bottom 40% income earners"
- "Players navigate real-life financial decisions - paying bills, buying groceries, managing debt"
- "AI-powered scenarios using Claude create immersive, personalized experiences"

### 2. Why TiDB? (Key Points)
- **Dual Database Architecture:**
  - Convex for real-time gameplay (low latency)
  - TiDB for analytics and research data (scalable SQL)

- **TiDB Use Cases in Our Project:**
  | Feature | How TiDB Helps |
  |---------|----------------|
  | Weekly Progress Tracking | Stores game snapshots after each week |
  | Player Decision Analytics | Aggregates behavioral patterns across all players |
  | Research Data Export | SQL queries for CSV/JSON export |
  | Leaderboard Analytics | Complex ranking queries with window functions |

- **Why TiDB over alternatives:**
  - MySQL compatibility (easy to use)
  - Serverless scaling (hackathon budget-friendly)
  - Complex analytical queries on player behavior data

### 3. Technical Implementation Highlights
```
Game Flow → Convex (real-time) → Weekly Sync → TiDB (analytics)
                                      ↓
                              Player Decisions
                              Weekly Snapshots
                              Completed Games
```

- "We sync data to TiDB after every week completion, not just game end"
- "This lets us analyze player progression and identify where players struggle"
- "TiDB's SQL views power our analytics dashboard"

### 4. Data Insights We Can Generate
- "X% of players chose unhealthy food to save money"
- "Week 2 has the highest dropout rate"
- "Fresh grad persona has 40% lower survival rate than single parent"
- "Players who skip weekends have 3x higher burnout"

### 5. Future Plans (Mention these!)
- Expand analytics dashboard with more visualizations
- Use TiDB data for academic research on financial behavior
- A/B test different game mechanics using TiDB analytics
- Scale to more players with TiDB serverless

---

## 📱 Social Media Tasks

### Team LinkedIn Profiles
- Redzwan: https://www.linkedin.com/in/redzl/
- Shafeeq: https://www.linkedin.com/in/muhammad-shafeeq-971ab2232/
- Adam: https://www.linkedin.com/in/adam-danial/

### X (Twitter)
- Redzwan: https://x.com/redzlatif

### Post Ideas (Tag @TiaboraCommunity / @PingaboraHQ)
```
🏆 Thrilled to announce we won 1st Place for Best Use of TiDB at the hackathon!

Our project: B40 Life Simulator - a financial literacy game for Malaysia's B40 community

We used @TiaboraCommunity for:
✅ Player behavior analytics
✅ Weekly progress tracking
✅ Research data export

Thanks TiDB team! 🙏

#TiDB #Hackathon #FinancialLiteracy #Malaysia
```

---

## ✅ Action Items

### Before Interview (Today)
- [ ] Review this outline
- [ ] Test the live demo: https://hidupb40.vercel.app
- [ ] Ensure TiDB connection is working on production
- [ ] Prepare screen share of analytics dashboard (if asked)

### During Interview
- [ ] Explain the dual-database architecture
- [ ] Highlight TiDB-specific features used (SQL views, serverless, MySQL compat)
- [ ] Mention future plans to expand TiDB usage
- [ ] Ask about TiDB resources for continued development

### After Interview
- [ ] Post on LinkedIn/X and tag TiDB
- [ ] Share project link in TiDB community
- [ ] Connect with community manager on LinkedIn

---

## 🔗 Project Links
- **Live Demo:** https://hidupb40.vercel.app
- **GitHub:** (if public)
- **Analytics API:** https://hidupb40.vercel.app/api/analytics/stats

---

## 💰 Prize Collection
- **Method:** Touch n Go
- **Status:** QR code shared ✓
- **Team Leader Confirmed:** Yes ✓
