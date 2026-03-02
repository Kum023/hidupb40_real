import { NextRequest, NextResponse } from "next/server";
import { exportResearchData, query } from "@/lib/tidb";

// GET /api/analytics/export
// Exports research data as CSV or JSON
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "json";
    const includeDecisions = searchParams.get("includeDecisions") === "true";

    // Fetch research data
    const games = await exportResearchData();

    // If including decisions, fetch them all
    let decisions: Array<{
      convex_game_id: string;
      location: string;
      scenario_id: string;
      choice_index: number;
      choice_text: string;
      money_change: number;
      credit_change: number;
      health_change: number;
      stress_change: number;
      day: number;
      week: number;
    }> = [];

    if (includeDecisions) {
      decisions = await query(
        `SELECT * FROM player_decisions ORDER BY convex_game_id, week, day`
      );
    }

    if (format === "csv") {
      // Generate CSV for games
      const headers = [
        "id",
        "convex_game_id",
        "player_name",
        "persona_id",
        "final_money",
        "final_credit_score",
        "final_health",
        "final_stress",
        "final_debt",
        "weeks_completed",
        "ending_type",
        "failure_reason",
        "decisions_count",
        "created_at",
      ];

      const csvRows = [headers.join(",")];

      for (const game of games) {
        const row = [
          game.id,
          game.convex_game_id,
          `"${(game.player_name || "").replace(/"/g, '""')}"`,
          game.persona_id,
          game.final_money,
          game.final_credit_score,
          game.final_health,
          game.final_stress,
          game.final_debt,
          game.weeks_completed,
          game.ending_type,
          game.failure_reason || "",
          game.decisions_count,
          game.created_at,
        ];
        csvRows.push(row.join(","));
      }

      const csv = csvRows.join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="b40-research-data-${Date.now()}.csv"`,
        },
      });
    }

    // Return JSON format
    return NextResponse.json({
      success: true,
      exportDate: new Date().toISOString(),
      gamesCount: games.length,
      decisionsCount: decisions.length,
      data: {
        games,
        decisions: includeDecisions ? decisions : undefined,
      },
    });
  } catch (error) {
    console.error("Export error:", error);

    // Return empty data if TiDB not configured
    if (String(error).includes("environment variables not configured")) {
      return NextResponse.json({
        success: false,
        error: "TiDB not configured",
        data: { games: [], decisions: [] },
      });
    }

    return NextResponse.json(
      { error: "Failed to export data", details: String(error) },
      { status: 500 }
    );
  }
}

