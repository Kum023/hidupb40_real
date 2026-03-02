import mysql from "mysql2/promise";

// TiDB connection configuration
const tidbConfig = {
  host: process.env.TIDB_HOST,
  port: parseInt(process.env.TIDB_PORT || "4000"),
  user: process.env.TIDB_USER,
  password: process.env.TIDB_PASSWORD,
  database: process.env.TIDB_DATABASE,
  ssl: {
    minVersion: "TLSv1.2" as const,
    rejectUnauthorized: true,
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Create connection pool (singleton)
let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (!pool) {
    if (!process.env.TIDB_HOST) {
      throw new Error("TiDB environment variables not configured");
    }
    pool = mysql.createPool(tidbConfig);
  }
  return pool;
}

// Helper to execute queries
export async function query<T>(sql: string, params?: unknown[]): Promise<T[]> {
  const connection = await getPool().getConnection();
  try {
    const [rows] = await connection.execute(sql, params);
    return rows as T[];
  } finally {
    connection.release();
  }
}

// Helper to execute single result queries
export async function queryOne<T>(
  sql: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] || null;
}

// Helper to execute insert/update/delete
export async function execute(
  sql: string,
  params?: unknown[]
): Promise<mysql.ResultSetHeader> {
  const connection = await getPool().getConnection();
  try {
    const [result] = await connection.execute(sql, params);
    return result as mysql.ResultSetHeader;
  } finally {
    connection.release();
  }
}

// Helper to execute operations within a transaction
export async function withTransaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    try {
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } finally {
    connection.release();
  }
}

// Types for analytics data
export interface CompletedGame {
  id?: number;
  convex_game_id: string;
  player_name: string;
  persona_id: string;
  final_money: number;
  final_credit_score: number;
  final_health: number;
  final_stress: number;
  final_debt: number;
  weeks_completed: number;
  ending_type: string;
  failure_reason: string | null;
  created_at?: Date;
}

export interface PlayerDecision {
  id?: number;
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
  created_at?: Date;
}

export interface WeeklySnapshot {
  id?: number;
  convex_game_id: string;
  player_name: string;
  persona_id: string;
  week: number;
  money: number;
  debt: number;
  credit_score: number;
  health: number;
  stress: number;
  objectives_completed: boolean;
  work_days_completed: number;
  bought_groceries: boolean;
  filled_petrol: boolean;
  paid_debt: boolean;
  weekend_activity?: string;
  is_game_over: boolean;
  ending_type?: string;
  created_at?: Date;
}

export interface PersonaStats {
  persona_id: string;
  total_games: number;
  avg_final_money: number;
  avg_credit_score: number;
  avg_weeks_completed: number;
  success_rate: number;
  most_common_ending: string;
}

export interface FailurePattern {
  failure_reason: string;
  count: number;
  persona_id: string;
  avg_week_failed: number;
}

// Analytics query functions
export async function syncCompletedGame(game: CompletedGame): Promise<number> {
  const result = await execute(
    `INSERT INTO completed_games 
     (convex_game_id, player_name, persona_id, final_money, final_credit_score, 
      final_health, final_stress, final_debt, weeks_completed, ending_type, failure_reason)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       final_money = VALUES(final_money),
       final_credit_score = VALUES(final_credit_score),
       final_health = VALUES(final_health),
       final_stress = VALUES(final_stress),
       final_debt = VALUES(final_debt),
       weeks_completed = VALUES(weeks_completed),
       ending_type = VALUES(ending_type),
       failure_reason = VALUES(failure_reason)`,
    [
      game.convex_game_id,
      game.player_name,
      game.persona_id,
      game.final_money,
      game.final_credit_score,
      game.final_health,
      game.final_stress,
      game.final_debt,
      game.weeks_completed,
      game.ending_type,
      game.failure_reason,
    ]
  );
  return result.insertId;
}

export async function syncPlayerDecisions(
  decisions: PlayerDecision[]
): Promise<void> {
  if (decisions.length === 0) return;

  // Ensure all decisions share the same convex_game_id
  const gameIds = new Set(decisions.map((d) => d.convex_game_id));
  if (gameIds.size !== 1) {
    throw new Error(
      `All decisions must share the same convex_game_id. Found: ${Array.from(gameIds).join(", ")}`
    );
  }

  const convexGameId = decisions[0].convex_game_id;

  // Prepare values for batch insert
  const values = decisions.map((d) => [
    d.convex_game_id,
    d.location,
    d.scenario_id,
    d.choice_index,
    d.choice_text,
    d.money_change,
    d.credit_change,
    d.health_change,
    d.stress_change,
    d.day,
    d.week,
  ]);

  const placeholders = values.map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").join(", ");
  const flatValues = values.flat();

  // Use transaction to ensure atomicity: delete existing + insert new
  await withTransaction(async (connection) => {
    // Delete existing decisions for this game_id to make operation idempotent
    await connection.execute(
      `DELETE FROM player_decisions WHERE convex_game_id = ?`,
      [convexGameId]
    );

    // Insert the new batch
    await connection.execute(
      `INSERT INTO player_decisions 
       (convex_game_id, location, scenario_id, choice_index, choice_text, 
        money_change, credit_change, health_change, stress_change, day, week)
       VALUES ${placeholders}`,
      flatValues
    );
  });
}

export async function syncWeeklySnapshot(snapshot: WeeklySnapshot): Promise<number> {
  const result = await execute(
    `INSERT INTO weekly_snapshots
     (convex_game_id, player_name, persona_id, week, money, debt, credit_score,
      health, stress, objectives_completed, work_days_completed, bought_groceries,
      filled_petrol, paid_debt, weekend_activity, is_game_over, ending_type)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       money = VALUES(money),
       debt = VALUES(debt),
       credit_score = VALUES(credit_score),
       health = VALUES(health),
       stress = VALUES(stress),
       objectives_completed = VALUES(objectives_completed),
       work_days_completed = VALUES(work_days_completed),
       bought_groceries = VALUES(bought_groceries),
       filled_petrol = VALUES(filled_petrol),
       paid_debt = VALUES(paid_debt),
       weekend_activity = VALUES(weekend_activity),
       is_game_over = VALUES(is_game_over),
       ending_type = VALUES(ending_type)`,
    [
      snapshot.convex_game_id,
      snapshot.player_name,
      snapshot.persona_id,
      snapshot.week,
      snapshot.money,
      snapshot.debt,
      snapshot.credit_score,
      snapshot.health,
      snapshot.stress,
      snapshot.objectives_completed,
      snapshot.work_days_completed,
      snapshot.bought_groceries,
      snapshot.filled_petrol,
      snapshot.paid_debt,
      snapshot.weekend_activity || null,
      snapshot.is_game_over,
      snapshot.ending_type || null,
    ]
  );
  return result.insertId;
}

export async function getGlobalStats(): Promise<{
  totalGames: number;
  avgFinalMoney: number;
  avgCreditScore: number;
  successRate: number;
}> {
  const result = await queryOne<{
    total_games: number;
    avg_money: number;
    avg_credit: number;
    success_rate: number;
  }>(
    `SELECT 
       COUNT(*) as total_games,
       AVG(final_money) as avg_money,
       AVG(final_credit_score) as avg_credit,
       (SUM(CASE WHEN ending_type = 'survived' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as success_rate
     FROM completed_games`
  );

  return {
    totalGames: result?.total_games || 0,
    avgFinalMoney: Math.round(result?.avg_money || 0),
    avgCreditScore: Math.round(result?.avg_credit || 0),
    successRate: Math.round(result?.success_rate || 0),
  };
}

export async function getPersonaStats(): Promise<PersonaStats[]> {
  return query<PersonaStats>(
    `SELECT 
       persona_id,
       COUNT(*) as total_games,
       AVG(final_money) as avg_final_money,
       AVG(final_credit_score) as avg_credit_score,
       AVG(weeks_completed) as avg_weeks_completed,
       (SUM(CASE WHEN ending_type = 'survived' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as success_rate,
       (SELECT ending_type FROM completed_games cg2 
        WHERE cg2.persona_id = completed_games.persona_id 
        GROUP BY ending_type ORDER BY COUNT(*) DESC LIMIT 1) as most_common_ending
     FROM completed_games
     GROUP BY persona_id`
  );
}

export async function getFailurePatterns(): Promise<FailurePattern[]> {
  return query<FailurePattern>(
    `SELECT 
       failure_reason,
       COUNT(*) as count,
       persona_id,
       AVG(weeks_completed) as avg_week_failed
     FROM completed_games
     WHERE failure_reason IS NOT NULL
     GROUP BY failure_reason, persona_id
     ORDER BY count DESC`
  );
}

export async function getEnhancedLeaderboard(limit: number = 50): Promise<
  Array<{
    rank: number;
    player_name: string;
    persona_id: string;
    final_money: number;
    final_credit_score: number;
    weeks_completed: number;
    ending_type: string;
    created_at: Date;
  }>
> {
  // Sanitize limit to be a positive integer
  const safeLimit = Math.max(1, Math.min(1000, Math.floor(Number(limit) || 50)));
  return query(
    `SELECT
       ROW_NUMBER() OVER (ORDER BY final_money DESC) as \`rank\`,
       player_name,
       persona_id,
       final_money,
       final_credit_score,
       weeks_completed,
       ending_type,
       created_at
     FROM completed_games
     ORDER BY final_money DESC
     LIMIT ${safeLimit}`
  );
}

export async function getDecisionAnalytics(): Promise<
  Array<{
    location: string;
    total_decisions: number;
    avg_money_change: number;
    avg_credit_change: number;
    most_common_choice: string;
  }>
> {
  return query(
    `SELECT 
       location,
       COUNT(*) as total_decisions,
       AVG(money_change) as avg_money_change,
       AVG(credit_change) as avg_credit_change,
       (SELECT choice_text FROM player_decisions pd2 
        WHERE pd2.location = player_decisions.location 
        GROUP BY choice_text ORDER BY COUNT(*) DESC LIMIT 1) as most_common_choice
     FROM player_decisions
     GROUP BY location
     ORDER BY total_decisions DESC`
  );
}

export async function exportResearchData(): Promise<
  Array<CompletedGame & { decisions_count: number }>
> {
  return query(
    `SELECT
       cg.*,
       (SELECT COUNT(*) FROM player_decisions pd WHERE pd.convex_game_id = cg.convex_game_id) as decisions_count
     FROM completed_games cg
     ORDER BY cg.created_at DESC`
  );
}

// Get weekly progression analytics from weekly_snapshots
export async function getWeeklyProgression(): Promise<
  Array<{
    week: number;
    total_snapshots: number;
    avg_money: number;
    avg_health: number;
    avg_stress: number;
    objectives_completion_rate: number;
    dropout_count: number;
  }>
> {
  return query(
    `SELECT
       week,
       COUNT(*) as total_snapshots,
       AVG(money) as avg_money,
       AVG(health) as avg_health,
       AVG(stress) as avg_stress,
       (SUM(CASE WHEN objectives_completed = TRUE THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as objectives_completion_rate,
       SUM(CASE WHEN is_game_over = TRUE THEN 1 ELSE 0 END) as dropout_count
     FROM weekly_snapshots
     GROUP BY week
     ORDER BY week`
  );
}

// Get key insights for dashboard
export async function getKeyInsights(): Promise<{
  totalDecisions: number;
  unhealthyFoodRate: number;
  weekendSkipRate: number;
  avgWeekDropout: number;
  overtimeAcceptRate: number;
  debtPaymentRate: number;
}> {
  // Get total decisions
  const totalResult = await queryOne<{ count: number }>(
    "SELECT COUNT(*) as count FROM player_decisions"
  );

  // Get unhealthy food choice rate
  const unhealthyResult = await queryOne<{ rate: number }>(
    `SELECT
       (SUM(CASE WHEN choice_text LIKE '%instant noodles%' OR choice_text LIKE '%unhealthy%' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0)) as rate
     FROM player_decisions
     WHERE location = 'shop'`
  );

  // Get weekend skip rate
  const skipResult = await queryOne<{ rate: number }>(
    `SELECT
       (SUM(CASE WHEN weekend_activity = 'skip' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0)) as rate
     FROM weekly_snapshots`
  );

  // Get average week of dropout
  const dropoutResult = await queryOne<{ avg_week: number }>(
    `SELECT AVG(weeks_completed) as avg_week
     FROM completed_games
     WHERE ending_type != 'survived' AND ending_type != 'success'`
  );

  // Get overtime acceptance rate
  const overtimeResult = await queryOne<{ rate: number }>(
    `SELECT
       (SUM(CASE WHEN choice_text LIKE '%overtime%' OR choice_text LIKE '%Accept the overtime%' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0)) as rate
     FROM player_decisions
     WHERE location = 'office'`
  );

  // Get debt payment rate (week 4)
  const debtResult = await queryOne<{ rate: number }>(
    `SELECT
       (SUM(CASE WHEN paid_debt = TRUE THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0)) as rate
     FROM weekly_snapshots
     WHERE week = 4`
  );

  return {
    totalDecisions: totalResult?.count || 0,
    unhealthyFoodRate: Math.round(unhealthyResult?.rate || 0),
    weekendSkipRate: Math.round(skipResult?.rate || 0),
    avgWeekDropout: dropoutResult?.avg_week || 0,
    overtimeAcceptRate: Math.round(overtimeResult?.rate || 0),
    debtPaymentRate: Math.round(debtResult?.rate || 0),
  };
}

// Get survival funnel data
export async function getSurvivalFunnel(): Promise<
  Array<{
    week: number;
    started: number;
    survived: number;
    survival_rate: number;
  }>
> {
  // Get count of games that reached each week
  const weekCounts = await query<{ week: number; count: number }>(
    `SELECT week, COUNT(DISTINCT convex_game_id) as count
     FROM weekly_snapshots
     GROUP BY week
     ORDER BY week`
  );

  // Get count of games that ended at each week
  const endCounts = await query<{ week: number; ended: number }>(
    `SELECT week, COUNT(*) as ended
     FROM weekly_snapshots
     WHERE is_game_over = TRUE
     GROUP BY week`
  );

  const endMap = new Map(endCounts.map(e => [e.week, e.ended]));

  let previousCount = weekCounts[0]?.count || 0;

  return weekCounts.map((wc, index) => {
    const ended = endMap.get(wc.week) || 0;
    const survived = wc.count - ended;
    const survivalRate = previousCount > 0 ? (survived / previousCount) * 100 : 100;
    previousCount = survived;

    return {
      week: wc.week,
      started: wc.count,
      survived,
      survival_rate: Math.round(survivalRate),
    };
  });
}

