import { NextRequest, NextResponse } from "next/server";
import { syncWeeklySnapshot, syncPlayerDecisions, WeeklySnapshot, PlayerDecision } from "@/lib/tidb";

// POST /api/analytics/simulate
// Simulates end-of-week data entry for testing TiDB sync
export async function POST(request: NextRequest) {
  // Verify internal API key for security
  const apiKey = request.headers.get("X-Internal-Key");
  const expectedKey = process.env.INTERNAL_API_KEY || "dev-key";

  if (apiKey !== expectedKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      playerName = "Test Player",
      personaId = "freshGrad",
      week = 1,
      count = 1, // Number of simulated entries to create
    } = body;

    const results = [];

    for (let i = 0; i < count; i++) {
      const gameId = `sim_${Date.now()}_${i}`;

      // Randomize stats for variety
      const money = Math.floor(Math.random() * 1500) + 200;
      const health = Math.floor(Math.random() * 40) + 50;
      const stress = Math.floor(Math.random() * 50) + 20;
      const creditScore = Math.floor(Math.random() * 100) + 580;
      const workDays = Math.floor(Math.random() * 2) + 4; // 4-5 work days
      const objectivesCompleted = workDays >= 5 && Math.random() > 0.3;

      // Create weekly snapshot
      const snapshot: WeeklySnapshot = {
        convex_game_id: gameId,
        player_name: `${playerName}_${i + 1}`,
        persona_id: personaId,
        week,
        money,
        debt: personaId === "freshGrad" ? 30000 : 7000,
        credit_score: creditScore,
        health,
        stress,
        objectives_completed: objectivesCompleted,
        work_days_completed: workDays,
        bought_groceries: Math.random() > 0.2,
        filled_petrol: Math.random() > 0.2,
        paid_debt: week === 4 ? Math.random() > 0.4 : false,
        weekend_activity: ["rest", "mamak", "jogging", "skip"][Math.floor(Math.random() * 4)],
        is_game_over: !objectivesCompleted && Math.random() > 0.7,
        ending_type: !objectivesCompleted ? "objectives_failed" : undefined,
      };

      const snapshotId = await syncWeeklySnapshot(snapshot);

      // Create some random decisions for this game
      const decisions: PlayerDecision[] = [];
      const locations = ["office", "shop", "petrol", "home", "bank"];
      const numDecisions = Math.floor(Math.random() * 5) + 3;

      for (let d = 0; d < numDecisions; d++) {
        decisions.push({
          convex_game_id: gameId,
          location: locations[Math.floor(Math.random() * locations.length)],
          scenario_id: `scenario_${d}`,
          choice_index: Math.floor(Math.random() * 3),
          choice_text: ["Accept offer", "Decline politely", "Ask for more time", "Pay now", "Pay later"][Math.floor(Math.random() * 5)],
          money_change: Math.floor(Math.random() * 200) - 100,
          credit_change: Math.floor(Math.random() * 20) - 10,
          health_change: Math.floor(Math.random() * 20) - 10,
          stress_change: Math.floor(Math.random() * 30) - 10,
          day: Math.floor(Math.random() * 5) + 1,
          week,
        });
      }

      await syncPlayerDecisions(decisions);

      results.push({
        gameId,
        snapshotId,
        decisionsCount: decisions.length,
        playerName: snapshot.player_name,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Simulated ${count} week ${week} entries`,
      results,
    });
  } catch (error) {
    console.error("Simulation error:", error);
    return NextResponse.json(
      { error: "Failed to simulate data", details: String(error) },
      { status: 500 }
    );
  }
}

// GET /api/analytics/simulate - Show usage
export async function GET() {
  return NextResponse.json({
    usage: "POST /api/analytics/simulate",
    headers: {
      "X-Internal-Key": "your-api-key",
      "Content-Type": "application/json",
    },
    body: {
      playerName: "Test Player (optional)",
      personaId: "freshGrad | singleParent (optional)",
      week: "1-4 (optional)",
      count: "number of entries to simulate (optional, default 1)",
    },
    example: {
      playerName: "Demo User",
      personaId: "freshGrad",
      week: 1,
      count: 5,
    },
  });
}
