import { NextRequest, NextResponse } from "next/server";
import { getPool, query, syncWeeklySnapshot, WeeklySnapshot } from "@/lib/tidb";

// GET /api/analytics/test
// Test TiDB connection and optionally insert test data
export async function GET(request: NextRequest) {
  const results: {
    connectionTest: { success: boolean; error?: string };
    schemaTest?: { success: boolean; tables?: string[]; error?: string };
    insertTest?: { success: boolean; snapshotId?: number; error?: string };
    queryTest?: { success: boolean; count?: number; error?: string };
  } = {
    connectionTest: { success: false },
  };

  // Test 1: Basic connection
  try {
    const pool = getPool();
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    results.connectionTest = { success: true };
  } catch (error) {
    results.connectionTest = {
      success: false,
      error: String(error),
    };
    return NextResponse.json(results, { status: 500 });
  }

  // Test 2: Check schema exists
  try {
    const tables = await query<{ TABLE_NAME: string }>(
      `SELECT TABLE_NAME FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('completed_games', 'player_decisions', 'weekly_snapshots')`,
      [process.env.TIDB_DATABASE || "test"]
    );
    results.schemaTest = {
      success: tables.length > 0,
      tables: tables.map((t) => t.TABLE_NAME),
    };
  } catch (error) {
    results.schemaTest = {
      success: false,
      error: String(error),
    };
  }

  // Test 3: Insert test weekly snapshot (if insertTest param is true)
  const searchParams = request.nextUrl.searchParams;
  if (searchParams.get("insertTest") === "true") {
    try {
      const testSnapshot: WeeklySnapshot = {
        convex_game_id: `test_game_${Date.now()}`,
        player_name: "Test Player",
        persona_id: "freshGrad",
        week: 1,
        money: 800,
        debt: 30000,
        credit_score: 650,
        health: 100,
        stress: 20,
        objectives_completed: true,
        work_days_completed: 5,
        bought_groceries: true,
        filled_petrol: true,
        paid_debt: false,
        weekend_activity: "test_activity",
        is_game_over: false,
      };

      const snapshotId = await syncWeeklySnapshot(testSnapshot);
      results.insertTest = {
        success: true,
        snapshotId,
      };
    } catch (error) {
      results.insertTest = {
        success: false,
        error: String(error),
      };
    }
  }

  // Test 4: Query weekly snapshots count
  try {
    const countResult = await query<{ count: number }>(
      "SELECT COUNT(*) as count FROM weekly_snapshots"
    );
    results.queryTest = {
      success: true,
      count: countResult[0]?.count || 0,
    };
  } catch (error) {
    results.queryTest = {
      success: false,
      error: String(error),
    };
  }

  return NextResponse.json(results);
}
