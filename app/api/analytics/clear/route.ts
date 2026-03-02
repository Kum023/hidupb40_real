import { NextRequest, NextResponse } from "next/server";
import { execute } from "@/lib/tidb";

// POST /api/analytics/clear
// Clears all data from TiDB analytics tables
export async function POST(request: NextRequest) {
  // Verify internal API key for security
  const apiKey = request.headers.get("X-Internal-Key");
  const expectedKey = process.env.INTERNAL_API_KEY || "dev-key";

  if (apiKey !== expectedKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Clear tables in order (due to potential FK references)
    await execute("DELETE FROM player_decisions");
    await execute("DELETE FROM weekly_snapshots");
    await execute("DELETE FROM completed_games");

    return NextResponse.json({
      success: true,
      message: "All analytics data cleared",
    });
  } catch (error) {
    console.error("Clear error:", error);
    return NextResponse.json(
      { error: "Failed to clear data", details: String(error) },
      { status: 500 }
    );
  }
}
