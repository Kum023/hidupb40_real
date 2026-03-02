import { NextRequest, NextResponse } from "next/server";
import {
  syncCompletedGame,
  syncPlayerDecisions,
  syncWeeklySnapshot,
  CompletedGame,
  PlayerDecision,
  WeeklySnapshot,
} from "@/lib/tidb";

// POST /api/analytics/sync
// Syncs game data from Convex to TiDB
// Supports both weekly snapshots (during gameplay) and completed games (at end)
export async function POST(request: NextRequest) {
  try {
    // Verify internal API key for security
    const apiKey = request.headers.get("X-Internal-Key");
    const expectedKey = process.env.INTERNAL_API_KEY || "dev-key";

    if (apiKey !== expectedKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { game, decisions, weeklySnapshot, syncType } = body as {
      game?: CompletedGame;
      decisions?: PlayerDecision[];
      weeklySnapshot?: WeeklySnapshot;
      syncType: "weekly" | "completed" | "full";
    };

    const result: {
      success: boolean;
      gameId?: number;
      snapshotId?: number;
      decisionsCount?: number;
      syncType: string;
    } = {
      success: true,
      syncType: syncType || "completed",
    };

    // Handle weekly snapshot sync
    if (syncType === "weekly" && weeklySnapshot) {
      result.snapshotId = await syncWeeklySnapshot(weeklySnapshot);

      // Also sync decisions for this week if provided
      if (decisions && decisions.length > 0) {
        await syncPlayerDecisions(decisions);
        result.decisionsCount = decisions.length;
      }
    }
    // Handle completed game sync
    else if ((syncType === "completed" || syncType === "full") && game) {
      result.gameId = await syncCompletedGame(game);

      // Sync decisions if provided
      if (decisions && decisions.length > 0) {
        await syncPlayerDecisions(decisions);
        result.decisionsCount = decisions.length;
      }
    }
    // Legacy support: if no syncType specified but game is provided
    else if (game) {
      result.gameId = await syncCompletedGame(game);
      result.syncType = "completed";

      if (decisions && decisions.length > 0) {
        await syncPlayerDecisions(decisions);
        result.decisionsCount = decisions.length;
      }
    }
    else {
      return NextResponse.json(
        { error: "Missing required data for sync" },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("TiDB sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync data", details: String(error) },
      { status: 500 }
    );
  }
}

