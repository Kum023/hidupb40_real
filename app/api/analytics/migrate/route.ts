import { NextRequest, NextResponse } from "next/server";
import { execute, query } from "@/lib/tidb";

// POST /api/analytics/migrate
// Run database migrations for TiDB
export async function POST(request: NextRequest) {
  // Verify internal API key for security
  const apiKey = request.headers.get("X-Internal-Key");
  const expectedKey = process.env.INTERNAL_API_KEY || "dev-key";

  if (apiKey !== expectedKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: {
    migrations: Array<{ name: string; success: boolean; error?: string }>;
  } = {
    migrations: [],
  };

  // Migration 1: Remove FK constraint from player_decisions (if exists)
  try {
    // Check if FK exists first
    const fkExists = await query<{ CONSTRAINT_NAME: string }>(
      `SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'player_decisions'
       AND CONSTRAINT_TYPE = 'FOREIGN KEY'`,
      [process.env.TIDB_DATABASE || "test"]
    );

    if (fkExists.length > 0) {
      for (const fk of fkExists) {
        await execute(
          `ALTER TABLE player_decisions DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}`
        );
      }
      results.migrations.push({
        name: "remove_player_decisions_fk",
        success: true,
      });
    } else {
      results.migrations.push({
        name: "remove_player_decisions_fk",
        success: true,
        error: "No FK to remove (already migrated)",
      });
    }
  } catch (error) {
    results.migrations.push({
      name: "remove_player_decisions_fk",
      success: false,
      error: String(error),
    });
  }

  // Migration 2: Create weekly_snapshots table
  try {
    await execute(`
      CREATE TABLE IF NOT EXISTS weekly_snapshots (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        convex_game_id VARCHAR(255) NOT NULL,
        player_name VARCHAR(255) NOT NULL,
        persona_id VARCHAR(50) NOT NULL,
        week INT NOT NULL,
        money INT NOT NULL DEFAULT 0,
        debt INT NOT NULL DEFAULT 0,
        credit_score INT NOT NULL DEFAULT 300,
        health INT NOT NULL DEFAULT 100,
        stress INT NOT NULL DEFAULT 0,
        objectives_completed BOOLEAN NOT NULL DEFAULT FALSE,
        work_days_completed INT NOT NULL DEFAULT 0,
        bought_groceries BOOLEAN NOT NULL DEFAULT FALSE,
        filled_petrol BOOLEAN NOT NULL DEFAULT FALSE,
        paid_debt BOOLEAN NOT NULL DEFAULT FALSE,
        weekend_activity VARCHAR(100),
        is_game_over BOOLEAN NOT NULL DEFAULT FALSE,
        ending_type VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY idx_game_week (convex_game_id, week),
        INDEX idx_persona (persona_id),
        INDEX idx_week (week)
      )
    `);
    results.migrations.push({
      name: "create_weekly_snapshots",
      success: true,
    });
  } catch (error) {
    results.migrations.push({
      name: "create_weekly_snapshots",
      success: false,
      error: String(error),
    });
  }

  // Migration 3: Create weekly_progress_analytics view
  try {
    await execute(`
      CREATE OR REPLACE VIEW weekly_progress_analytics AS
      SELECT
        week,
        persona_id,
        COUNT(*) as games_at_week,
        AVG(money) as avg_money,
        AVG(debt) as avg_debt,
        AVG(credit_score) as avg_credit_score,
        AVG(health) as avg_health,
        AVG(stress) as avg_stress,
        SUM(CASE WHEN objectives_completed = TRUE THEN 1 ELSE 0 END) as objectives_completed_count,
        SUM(CASE WHEN is_game_over = TRUE THEN 1 ELSE 0 END) as games_ended
      FROM weekly_snapshots
      GROUP BY week, persona_id
      ORDER BY week, persona_id
    `);
    results.migrations.push({
      name: "create_weekly_progress_view",
      success: true,
    });
  } catch (error) {
    results.migrations.push({
      name: "create_weekly_progress_view",
      success: false,
      error: String(error),
    });
  }

  const allSuccess = results.migrations.every((m) => m.success);
  return NextResponse.json(results, { status: allSuccess ? 200 : 500 });
}

// GET /api/analytics/migrate - Check migration status
export async function GET() {
  try {
    const tables = await query<{ TABLE_NAME: string }>(
      `SELECT TABLE_NAME FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('completed_games', 'player_decisions', 'weekly_snapshots')`,
      [process.env.TIDB_DATABASE || "test"]
    );

    const views = await query<{ TABLE_NAME: string }>(
      `SELECT TABLE_NAME FROM information_schema.VIEWS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'weekly_progress_analytics'`,
      [process.env.TIDB_DATABASE || "test"]
    );

    return NextResponse.json({
      tables: tables.map((t) => t.TABLE_NAME),
      views: views.map((v) => v.TABLE_NAME),
      hasWeeklySnapshots: tables.some((t) => t.TABLE_NAME === "weekly_snapshots"),
      hasWeeklyProgressView: views.length > 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
