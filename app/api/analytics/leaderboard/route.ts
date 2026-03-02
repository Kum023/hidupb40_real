import { NextRequest, NextResponse } from "next/server";
import { getEnhancedLeaderboard, getPersonaStats } from "@/lib/tidb";

// GET /api/analytics/leaderboard
// Returns enhanced leaderboard data with rankings and persona stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const persona = searchParams.get("persona");

    // Fetch leaderboard and persona stats
    const [leaderboard, personaStats] = await Promise.all([
      getEnhancedLeaderboard(limit),
      getPersonaStats(),
    ]);

    // Filter by persona if specified
    const filteredLeaderboard = persona
      ? leaderboard.filter((entry) => entry.persona_id === persona)
      : leaderboard;

    // Calculate additional stats
    const stats = {
      totalPlayers: leaderboard.length,
      avgScore: leaderboard.length > 0
        ? Math.round(
            leaderboard.reduce((sum, e) => sum + e.final_money, 0) /
              leaderboard.length
          )
        : 0,
      topScore: leaderboard.length > 0 ? leaderboard[0]?.final_money : 0,
      personaBreakdown: personaStats.map((p) => ({
        persona: p.persona_id,
        count: p.total_games,
        avgMoney: Math.round(p.avg_final_money),
        avgCredit: Math.round(p.avg_credit_score),
        successRate: Math.round(p.success_rate),
      })),
    };

    return NextResponse.json({
      success: true,
      leaderboard: filteredLeaderboard.map((entry) => ({
        rank: entry.rank,
        playerName: entry.player_name,
        persona: entry.persona_id,
        money: entry.final_money,
        creditScore: entry.final_credit_score,
        weeksCompleted: entry.weeks_completed,
        endingType: entry.ending_type,
        date: entry.created_at,
      })),
      stats,
    });
  } catch (error) {
    console.error("Leaderboard error:", error);

    // Return empty data if TiDB not configured
    if (String(error).includes("environment variables not configured")) {
      return NextResponse.json({
        success: false,
        error: "TiDB not configured",
        leaderboard: [],
        stats: {
          totalPlayers: 0,
          avgScore: 0,
          topScore: 0,
          personaBreakdown: [],
        },
      });
    }

    return NextResponse.json(
      { error: "Failed to fetch leaderboard", details: String(error) },
      { status: 500 }
    );
  }
}

