import { NextRequest, NextResponse } from "next/server";
import { execute, query } from "@/lib/tidb";

// Inline seed data - pre-formatted SQL values
const SEED_GAMES = `
INSERT INTO completed_games (convex_game_id, player_name, persona_id, final_money, final_credit_score, final_health, final_stress, final_debt, weeks_completed, ending_type, failure_reason) VALUES
('seed_fg_001', 'Ahmad Rizal', 'freshGrad', 1850, 680, 75, 35, 28500, 4, 'survived', NULL),
('seed_fg_002', 'Muhammad Hafiz', 'freshGrad', 2200, 700, 80, 25, 28000, 4, 'thrived', NULL),
('seed_fg_003', 'Mohd Faizal', 'freshGrad', 1650, 665, 70, 40, 29000, 4, 'survived', NULL),
('seed_fg_004', 'Amir Syafiq', 'freshGrad', 2500, 720, 85, 20, 27500, 4, 'thrived', NULL),
('seed_fg_005', 'Haziq Rahman', 'freshGrad', 1500, 655, 65, 45, 29200, 4, 'survived', NULL),
('seed_fg_006', 'Danial Hakim', 'freshGrad', 1900, 675, 78, 32, 28800, 4, 'survived', NULL),
('seed_fg_007', 'Irfan Malik', 'freshGrad', 2100, 690, 82, 28, 28200, 4, 'thrived', NULL),
('seed_fg_008', 'Kevin Lim', 'freshGrad', 2300, 710, 83, 22, 27800, 4, 'thrived', NULL),
('seed_fg_009', 'Jason Ng', 'freshGrad', 1600, 660, 68, 42, 29300, 4, 'survived', NULL),
('seed_fg_010', 'Raj Kumar', 'freshGrad', 1750, 670, 72, 38, 29100, 4, 'survived', NULL),
('seed_fg_011', 'Zulkifli Omar', 'freshGrad', -200, 520, 25, 85, 30500, 2, 'health_crisis', 'Health dropped to critical levels'),
('seed_fg_012', 'Firdaus Azmi', 'freshGrad', 150, 480, 55, 95, 31000, 3, 'burnout', 'Extreme stress led to burnout'),
('seed_fg_013', 'Kamarul Arifin', 'freshGrad', -600, 450, 40, 70, 32000, 2, 'bankruptcy', 'Ran out of money'),
('seed_fg_014', 'Ismail Hakimi', 'freshGrad', 300, 290, 60, 65, 30800, 3, 'credit_destroyed', 'Credit score became too low'),
('seed_fg_015', 'Azlan Shah', 'freshGrad', 200, 550, 50, 60, 30200, 1, 'objectives_failed', 'Failed to complete weekly objectives'),
('seed_fg_016', 'Muthu Samy', 'freshGrad', 50, 470, 45, 92, 30900, 2, 'burnout', 'Extreme stress led to burnout'),
('seed_fg_017', 'Suresh Rao', 'freshGrad', -400, 440, 35, 75, 31500, 3, 'bankruptcy', 'Ran out of money'),
('seed_fg_018', 'Ahmad Farhan', 'freshGrad', -100, 510, 30, 88, 31200, 2, 'health_crisis', 'Health dropped to critical levels'),
('seed_sp_001', 'Nurul Ain', 'singleParent', 1200, 610, 70, 40, 6200, 4, 'survived', NULL),
('seed_sp_002', 'Siti Aminah', 'singleParent', 1500, 635, 78, 32, 5800, 4, 'thrived', NULL),
('seed_sp_003', 'Nur Atiqah', 'singleParent', 1100, 600, 65, 45, 6400, 4, 'survived', NULL),
('seed_sp_004', 'Fatimah Zahra', 'singleParent', 1400, 625, 75, 35, 6000, 4, 'survived', NULL),
('seed_sp_005', 'Aisyah Noor', 'singleParent', 1600, 645, 80, 28, 5600, 4, 'thrived', NULL),
('seed_sp_006', 'Nurshahira', 'singleParent', 1050, 595, 62, 48, 6500, 4, 'survived', NULL),
('seed_sp_007', 'Zahra Yasmin', 'singleParent', 1350, 620, 73, 37, 6100, 4, 'survived', NULL),
('seed_sp_008', 'Emily Chen', 'singleParent', 1150, 605, 66, 44, 6350, 4, 'survived', NULL),
('seed_sp_009', 'Melissa Tan', 'singleParent', 1450, 630, 76, 34, 5900, 4, 'thrived', NULL),
('seed_sp_010', 'Sarah Wong', 'singleParent', 1250, 615, 68, 42, 6300, 4, 'survived', NULL),
('seed_sp_011', 'Mariam Husna', 'singleParent', -150, 490, 20, 88, 7800, 2, 'health_crisis', 'Health dropped to critical levels'),
('seed_sp_012', 'Rina Suhaila', 'singleParent', 80, 460, 48, 96, 7500, 3, 'burnout', 'Extreme stress led to burnout'),
('seed_sp_013', 'Nabila Huda', 'singleParent', -350, 420, 35, 72, 8200, 2, 'bankruptcy', 'Ran out of money'),
('seed_sp_014', 'Kavitha Nair', 'singleParent', 50, 530, 42, 62, 7200, 1, 'objectives_failed', 'Failed to complete weekly objectives'),
('seed_sp_015', 'Priya Devi', 'singleParent', -50, 500, 25, 90, 7900, 2, 'health_crisis', 'Health dropped to critical levels'),
('seed_sp_016', 'Syafiqah Iman', 'singleParent', 100, 455, 40, 94, 7700, 2, 'burnout', 'Extreme stress led to burnout'),
('seed_sp_017', 'Hanis Safiya', 'singleParent', 120, 285, 55, 68, 7600, 3, 'credit_destroyed', 'Credit score became too low'),
('seed_sp_018', 'Zara Maisara', 'singleParent', -250, 430, 30, 78, 8000, 3, 'bankruptcy', 'Ran out of money')
`;

const SEED_SNAPSHOTS = `
INSERT INTO weekly_snapshots (convex_game_id, player_name, persona_id, week, money, debt, credit_score, health, stress, objectives_completed, work_days_completed, bought_groceries, filled_petrol, paid_debt, weekend_activity, is_game_over, ending_type) VALUES
('seed_fg_001', 'Ahmad Rizal', 'freshGrad', 1, 650, 30000, 655, 78, 35, TRUE, 5, TRUE, TRUE, FALSE, 'rest', FALSE, NULL),
('seed_fg_001', 'Ahmad Rizal', 'freshGrad', 2, 800, 30000, 660, 80, 32, TRUE, 5, TRUE, TRUE, FALSE, 'mamak', FALSE, NULL),
('seed_fg_001', 'Ahmad Rizal', 'freshGrad', 3, 950, 30000, 670, 77, 38, TRUE, 5, TRUE, TRUE, FALSE, 'jogging', FALSE, NULL),
('seed_fg_001', 'Ahmad Rizal', 'freshGrad', 4, 1850, 28500, 680, 75, 35, TRUE, 5, TRUE, TRUE, TRUE, 'rest', FALSE, 'survived'),
('seed_fg_002', 'Muhammad Hafiz', 'freshGrad', 1, 700, 30000, 660, 82, 28, TRUE, 5, TRUE, TRUE, FALSE, 'jogging', FALSE, NULL),
('seed_fg_002', 'Muhammad Hafiz', 'freshGrad', 2, 900, 30000, 675, 84, 25, TRUE, 5, TRUE, TRUE, FALSE, 'rest', FALSE, NULL),
('seed_fg_002', 'Muhammad Hafiz', 'freshGrad', 3, 1100, 30000, 690, 82, 28, TRUE, 5, TRUE, TRUE, FALSE, 'mamak', FALSE, NULL),
('seed_fg_002', 'Muhammad Hafiz', 'freshGrad', 4, 2200, 28000, 700, 80, 25, TRUE, 5, TRUE, TRUE, TRUE, 'jogging', FALSE, 'thrived'),
('seed_fg_011', 'Zulkifli Omar', 'freshGrad', 1, 300, 30000, 640, 55, 65, TRUE, 4, TRUE, FALSE, FALSE, 'skip', FALSE, NULL),
('seed_fg_011', 'Zulkifli Omar', 'freshGrad', 2, -200, 30500, 520, 25, 85, FALSE, 3, FALSE, FALSE, FALSE, 'skip', TRUE, 'health_crisis'),
('seed_fg_012', 'Firdaus Azmi', 'freshGrad', 1, 400, 30000, 645, 70, 55, TRUE, 5, TRUE, TRUE, FALSE, 'skip', FALSE, NULL),
('seed_fg_012', 'Firdaus Azmi', 'freshGrad', 2, 350, 30200, 520, 62, 75, TRUE, 5, TRUE, FALSE, FALSE, 'skip', FALSE, NULL),
('seed_fg_012', 'Firdaus Azmi', 'freshGrad', 3, 150, 31000, 480, 55, 95, FALSE, 4, FALSE, FALSE, FALSE, 'skip', TRUE, 'burnout'),
('seed_sp_001', 'Nurul Ain', 'singleParent', 1, 400, 7000, 585, 72, 42, TRUE, 5, TRUE, TRUE, FALSE, 'rest', FALSE, NULL),
('seed_sp_001', 'Nurul Ain', 'singleParent', 2, 550, 7000, 595, 70, 44, TRUE, 5, TRUE, TRUE, FALSE, 'mamak', FALSE, NULL),
('seed_sp_001', 'Nurul Ain', 'singleParent', 3, 700, 7000, 605, 68, 42, TRUE, 5, TRUE, TRUE, FALSE, 'rest', FALSE, NULL),
('seed_sp_001', 'Nurul Ain', 'singleParent', 4, 1200, 6200, 610, 70, 40, TRUE, 5, TRUE, TRUE, TRUE, 'rest', FALSE, 'survived'),
('seed_sp_011', 'Mariam Husna', 'singleParent', 1, 200, 7200, 560, 45, 65, TRUE, 4, TRUE, FALSE, FALSE, 'skip', FALSE, NULL),
('seed_sp_011', 'Mariam Husna', 'singleParent', 2, -150, 7800, 490, 20, 88, FALSE, 3, FALSE, FALSE, FALSE, 'skip', TRUE, 'health_crisis')
`;

const SEED_DECISIONS = `
INSERT INTO player_decisions (convex_game_id, location, scenario_id, choice_index, choice_text, money_change, credit_change, health_change, stress_change, day, week) VALUES
('seed_fg_001', 'office', 'office_work', 0, 'Work full shift', 75, 2, -5, 10, 1, 1),
('seed_fg_001', 'shop', 'shop_groceries', 1, 'Buy instant food', -30, 0, -5, -2, 2, 1),
('seed_fg_001', 'petrol', 'petrol_fill', 1, 'Half tank', -50, 0, 0, -1, 3, 1),
('seed_fg_001', 'office', 'office_overtime', 1, 'Leave on time', 0, 0, 5, -8, 4, 1),
('seed_fg_001', 'home', 'home_cooking', 0, 'Cook healthy meal', -20, 0, 10, -5, 5, 1),
('seed_fg_001', 'bank', 'bank_debt', 0, 'Pay minimum', -200, 5, 0, -10, 4, 4),
('seed_fg_002', 'office', 'office_overtime', 0, 'Work overtime', 50, 3, -8, 12, 1, 1),
('seed_fg_002', 'shop', 'shop_groceries', 0, 'Buy fresh ingredients', -80, 0, 10, -3, 2, 1),
('seed_fg_002', 'petrol', 'petrol_full', 0, 'Full tank', -100, 0, 0, -2, 3, 1),
('seed_fg_002', 'bank', 'bank_debt', 1, 'Pay extra', -500, 10, 0, -15, 4, 4),
('seed_fg_011', 'office', 'office_work', 2, 'Skip work', -100, -15, 5, -5, 1, 1),
('seed_fg_011', 'home', 'home_cooking', 1, 'Order Grab Food', -25, 0, -3, 2, 2, 1),
('seed_fg_011', 'shop', 'shop_temptation', 1, 'Buy snacks', -20, 0, -5, 5, 3, 1),
('seed_sp_001', 'office', 'office_work', 0, 'Work full shift', 60, 2, -5, 12, 1, 1),
('seed_sp_001', 'shop', 'shop_groceries', 1, 'Buy instant food', -30, 0, -3, -2, 2, 1),
('seed_sp_001', 'petrol', 'petrol_fill', 2, 'RM30 only', -30, 0, 0, 5, 3, 1),
('seed_sp_001', 'bank', 'bank_debt', 0, 'Pay minimum', -200, 5, 0, -8, 4, 4),
('seed_sp_011', 'office', 'office_overtime', 0, 'Work overtime', 40, 2, -12, 18, 1, 1),
('seed_sp_011', 'home', 'home_cooking', 2, 'Eat instant noodles', -5, 0, -10, 3, 2, 1)
`;

// POST /api/analytics/seed
// Seeds TiDB with realistic mock player data
export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("X-Internal-Key");
  const expectedKey = process.env.INTERNAL_API_KEY || "dev-key";

  if (apiKey !== expectedKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Clear existing seed data first
    await execute("DELETE FROM player_decisions WHERE convex_game_id LIKE 'seed_%'");
    await execute("DELETE FROM weekly_snapshots WHERE convex_game_id LIKE 'seed_%'");
    await execute("DELETE FROM completed_games WHERE convex_game_id LIKE 'seed_%'");

    // Insert seed data
    await execute(SEED_GAMES);
    await execute(SEED_SNAPSHOTS);
    await execute(SEED_DECISIONS);

    // Update persona stats cache
    await execute(`
      INSERT INTO persona_stats_cache (persona_id, total_games, avg_final_money, avg_credit_score, avg_weeks_completed, success_rate, most_common_ending)
      SELECT persona_id, COUNT(*), ROUND(AVG(final_money), 2), ROUND(AVG(final_credit_score), 2),
             ROUND(AVG(weeks_completed), 2),
             ROUND((SUM(CASE WHEN ending_type IN ('survived', 'thrived') THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2),
             'survived'
      FROM completed_games GROUP BY persona_id
      ON DUPLICATE KEY UPDATE
        total_games = VALUES(total_games), avg_final_money = VALUES(avg_final_money),
        avg_credit_score = VALUES(avg_credit_score), avg_weeks_completed = VALUES(avg_weeks_completed),
        success_rate = VALUES(success_rate), updated_at = CURRENT_TIMESTAMP
    `);

    // Get counts
    const games = await query<{count: number}>("SELECT COUNT(*) as count FROM completed_games");
    const snapshots = await query<{count: number}>("SELECT COUNT(*) as count FROM weekly_snapshots");
    const decisions = await query<{count: number}>("SELECT COUNT(*) as count FROM player_decisions");

    return NextResponse.json({
      success: true,
      message: "TiDB seeded successfully with mock Malaysian player data",
      counts: {
        games: games[0]?.count || 0,
        snapshots: snapshots[0]?.count || 0,
        decisions: decisions[0]?.count || 0,
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed data", details: String(error) },
      { status: 500 }
    );
  }
}

// GET /api/analytics/seed - Show usage
export async function GET() {
  return NextResponse.json({
    usage: "POST /api/analytics/seed",
    description: "Seeds TiDB with realistic mock Malaysian player data",
    headers: {
      "X-Internal-Key": "your-api-key",
      "Content-Type": "application/json",
    },
    body: {
      playerCount: "number of mock players to generate (default 50, max 200)",
    },
    tables_seeded: [
      "completed_games - Final game results with different endings",
      "weekly_snapshots - Week-by-week game progress",
      "player_decisions - All player choices at each location",
      "persona_stats_cache - Aggregated statistics by persona"
    ],
    data_distribution: {
      outcomes: "40% positive (survived/thrived), 40% negative (failures), 20% incomplete",
      personas: "50% freshGrad, 50% singleParent",
      names: "35 realistic Malaysian names"
    }
  });
}
