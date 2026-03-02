// TiDB Seed Data - Realistic Malaysian Player Gameplay Data
// This seeds all 4 tables: completed_games, player_decisions, weekly_snapshots, persona_stats_cache

import { execute } from "./tidb";

// Malaysian names for realistic data
const MALAY_NAMES = [
  "Ahmad Rizal", "Nurul Ain", "Muhammad Hafiz", "Siti Aminah", "Mohd Faizal",
  "Nur Atiqah", "Amir Syafiq", "Fatimah Zahra", "Haziq Rahman", "Aisyah Noor",
  "Danial Hakim", "Nurshahira", "Irfan Malik", "Zahra Yasmin", "Arif Budiman",
  "Hanis Safiya", "Zulkifli Omar", "Mariam Husna", "Firdaus Azmi", "Syafiqah Iman",
  "Kamarul Arifin", "Nabila Huda", "Ismail Hakimi", "Rina Suhaila", "Azlan Shah",
  "Melissa Tan", "Kevin Lim", "Sarah Wong", "Jason Ng", "Emily Chen",
  "Raj Kumar", "Priya Devi", "Muthu Samy", "Kavitha Nair", "Suresh Rao"
];

const PERSONAS = ["freshGrad", "singleParent"];

const ENDING_TYPES = {
  positive: ["survived", "thrived"],
  negative: ["health_crisis", "burnout", "bankruptcy", "credit_destroyed", "objectives_failed"]
};

const LOCATIONS = ["office", "shop", "petrol", "home", "bank"];

const WEEKEND_ACTIVITIES = ["rest", "mamak", "jogging", "skip"];

// Scenario templates for each location
const SCENARIOS = {
  office: [
    { id: "office_overtime", choices: ["Work overtime (+RM50)", "Leave on time", "Take MC"] },
    { id: "office_project", choices: ["Accept extra project", "Decline politely", "Negotiate deadline"] },
    { id: "office_lunch", choices: ["Eat expensive lunch (-RM15)", "Tapau from home", "Skip lunch"] },
    { id: "office_meeting", choices: ["Present confidently", "Stay quiet", "Volunteer for task"] },
  ],
  shop: [
    { id: "shop_groceries", choices: ["Buy fresh ingredients (-RM80)", "Buy instant food (-RM30)", "Buy minimum items (-RM50)"] },
    { id: "shop_temptation", choices: ["Resist temptation", "Buy snacks (-RM20)", "Buy only essentials"] },
    { id: "shop_pakali", choices: ["Chat with Pak Ali", "Quick transaction", "Ask for discount"] },
  ],
  petrol: [
    { id: "petrol_full", choices: ["Full tank (-RM100)", "Half tank (-RM50)", "RM30 only"] },
    { id: "petrol_maintenance", choices: ["Check tires", "Skip check", "Full service (-RM150)"] },
  ],
  home: [
    { id: "home_rest", choices: ["Rest early", "Watch TV late", "Do side hustle"] },
    { id: "home_bills", choices: ["Pay bills on time", "Delay payment", "Partial payment"] },
    { id: "home_cooking", choices: ["Cook healthy meal", "Order Grab Food (-RM25)", "Eat instant noodles"] },
  ],
  bank: [
    { id: "bank_debt", choices: ["Pay minimum (RM200)", "Pay extra (RM500)", "Skip payment"] },
    { id: "bank_loan", choices: ["Decline loan offer", "Consider restructuring", "Apply for more credit"] },
  ]
};

// Generate a unique game ID
function generateGameId(): string {
  return `seed_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

// Generate realistic player journey
interface PlayerJourney {
  gameId: string;
  playerName: string;
  personaId: string;
  weeklySnapshots: WeeklySnapshot[];
  decisions: PlayerDecision[];
  finalGame: CompletedGame | null;
}

interface WeeklySnapshot {
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
  weekend_activity: string;
  is_game_over: boolean;
  ending_type?: string;
}

interface PlayerDecision {
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
}

interface CompletedGame {
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
}

function generatePlayerJourney(playerName: string, personaId: string, outcomeType: "positive" | "negative" | "incomplete"): PlayerJourney {
  const gameId = generateGameId();

  // Initial stats based on persona
  const initialStats = personaId === "freshGrad"
    ? { money: 500, debt: 30000, credit: 650, health: 80, stress: 30 }
    : { money: 300, debt: 7000, credit: 580, health: 70, stress: 40 };

  let currentMoney = initialStats.money;
  let currentDebt = initialStats.debt;
  let currentCredit = initialStats.credit;
  let currentHealth = initialStats.health;
  let currentStress = initialStats.stress;

  const weeklySnapshots: WeeklySnapshot[] = [];
  const decisions: PlayerDecision[] = [];

  // Determine how many weeks this player survives
  let weeksToPlay = outcomeType === "incomplete" ? Math.floor(Math.random() * 3) + 1 : 4;
  let gameOver = false;
  let endingType = "";
  let failureReason: string | null = null;

  // Simulate each week
  for (let week = 1; week <= weeksToPlay && !gameOver; week++) {
    let workDays = 0;
    let boughtGroceries = false;
    let filledPetrol = false;
    let paidDebt = false;

    // Simulate each day (5 work days)
    for (let day = 1; day <= 5; day++) {
      // Each day has ~3 actions
      const actionsPerDay = Math.floor(Math.random() * 2) + 2;

      for (let action = 0; action < actionsPerDay; action++) {
        // Choose a location (weighted towards office on weekdays)
        const locationWeights: Record<string, number> = day <= 5
          ? { office: 0.5, shop: 0.2, petrol: 0.15, home: 0.1, bank: week === 4 ? 0.05 : 0 }
          : { home: 0.6, shop: 0.2, petrol: 0.1, bank: 0.1, office: 0 };

        const location = weightedRandom(locationWeights);
        const scenarios = SCENARIOS[location as keyof typeof SCENARIOS];
        const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];

        // Player behavior based on outcome type
        let choiceIndex: number;
        let moneyChange = 0;
        let creditChange = 0;
        let healthChange = 0;
        let stressChange = 0;

        if (outcomeType === "positive") {
          // Smart choices - balance money and health
          choiceIndex = Math.random() > 0.3 ? 0 : 1;
          moneyChange = location === "office" ? Math.floor(Math.random() * 80) + 20 : -Math.floor(Math.random() * 50);
          creditChange = Math.floor(Math.random() * 5);
          healthChange = Math.floor(Math.random() * 10) - 3;
          stressChange = Math.floor(Math.random() * 15) - 5;
        } else if (outcomeType === "negative") {
          // Poor choices - prioritize short term
          choiceIndex = Math.random() > 0.4 ? 2 : 1;
          moneyChange = location === "office" ? Math.floor(Math.random() * 30) : -Math.floor(Math.random() * 80) - 20;
          creditChange = Math.floor(Math.random() * 10) - 8;
          healthChange = Math.floor(Math.random() * 10) - 8;
          stressChange = Math.floor(Math.random() * 20) + 5;
        } else {
          // Mixed choices
          choiceIndex = Math.floor(Math.random() * 3);
          moneyChange = Math.floor(Math.random() * 100) - 50;
          creditChange = Math.floor(Math.random() * 10) - 5;
          healthChange = Math.floor(Math.random() * 10) - 5;
          stressChange = Math.floor(Math.random() * 15) - 5;
        }

        // Track objectives
        if (location === "office") workDays = Math.min(workDays + 1, 5);
        if (location === "shop") boughtGroceries = true;
        if (location === "petrol") filledPetrol = true;
        if (location === "bank" && week === 4) paidDebt = true;

        // Update stats
        currentMoney += moneyChange;
        currentCredit = Math.max(300, Math.min(850, currentCredit + creditChange));
        currentHealth = Math.max(0, Math.min(100, currentHealth + healthChange));
        currentStress = Math.max(0, Math.min(100, currentStress + stressChange));

        // Record decision
        decisions.push({
          convex_game_id: gameId,
          location,
          scenario_id: scenario.id,
          choice_index: choiceIndex,
          choice_text: scenario.choices[Math.min(choiceIndex, scenario.choices.length - 1)],
          money_change: moneyChange,
          credit_change: creditChange,
          health_change: healthChange,
          stress_change: stressChange,
          day,
          week
        });
      }
    }

    // Check for game over conditions
    if (currentHealth <= 0) {
      gameOver = true;
      endingType = "health_crisis";
      failureReason = "Health dropped to critical levels";
    } else if (currentStress >= 100) {
      gameOver = true;
      endingType = "burnout";
      failureReason = "Extreme stress led to burnout";
    } else if (currentMoney < -500) {
      gameOver = true;
      endingType = "bankruptcy";
      failureReason = "Ran out of money";
    } else if (currentCredit < 300) {
      gameOver = true;
      endingType = "credit_destroyed";
      failureReason = "Credit score became too low";
    } else if (workDays < 4 || !boughtGroceries || !filledPetrol || (week === 4 && !paidDebt)) {
      if (outcomeType === "negative" && Math.random() > 0.5) {
        gameOver = true;
        endingType = "objectives_failed";
        failureReason = "Failed to complete weekly objectives";
      }
    }

    // Weekend activity and salary
    const weekendActivity = WEEKEND_ACTIVITIES[Math.floor(Math.random() * WEEKEND_ACTIVITIES.length)];

    // Apply weekend effects
    if (weekendActivity === "rest") {
      currentHealth = Math.min(100, currentHealth + 10);
      currentStress = Math.max(0, currentStress - 20);
    } else if (weekendActivity === "mamak") {
      currentMoney -= 30;
      currentStress = Math.max(0, currentStress - 15);
      currentHealth = Math.min(100, currentHealth + 5);
    } else if (weekendActivity === "jogging") {
      currentHealth = Math.min(100, currentHealth + 15);
      currentStress = Math.max(0, currentStress - 25);
    }

    // End of month: salary and debt payment
    if (week === 4 && !gameOver) {
      const salary = personaId === "freshGrad" ? 2200 : 1800;
      const debtPayment = Math.max(200, Math.ceil(currentDebt * 0.05));
      currentMoney += salary;
      if (paidDebt) {
        currentMoney -= debtPayment;
        currentDebt -= debtPayment;
        currentCredit += 5;
      }
    }

    // Record weekly snapshot
    const objectivesCompleted = workDays >= 5 && boughtGroceries && filledPetrol && (week < 4 || paidDebt);

    weeklySnapshots.push({
      convex_game_id: gameId,
      player_name: playerName,
      persona_id: personaId,
      week,
      money: currentMoney,
      debt: currentDebt,
      credit_score: currentCredit,
      health: currentHealth,
      stress: currentStress,
      objectives_completed: objectivesCompleted,
      work_days_completed: workDays,
      bought_groceries: boughtGroceries,
      filled_petrol: filledPetrol,
      paid_debt: paidDebt,
      weekend_activity: weekendActivity,
      is_game_over: gameOver,
      ending_type: gameOver ? endingType : undefined
    });
  }

  // Determine final outcome
  if (!gameOver && weeksToPlay === 4) {
    endingType = currentMoney > 1000 && currentCredit > 650 ? "thrived" : "survived";
  } else if (!gameOver) {
    endingType = "incomplete";
  }

  // Create completed game record (unless incomplete)
  const finalGame: CompletedGame | null = outcomeType !== "incomplete" ? {
    convex_game_id: gameId,
    player_name: playerName,
    persona_id: personaId,
    final_money: currentMoney,
    final_credit_score: currentCredit,
    final_health: currentHealth,
    final_stress: currentStress,
    final_debt: currentDebt,
    weeks_completed: weeklySnapshots.length,
    ending_type: endingType,
    failure_reason: failureReason
  } : null;

  return {
    gameId,
    playerName,
    personaId,
    weeklySnapshots,
    decisions,
    finalGame
  };
}

function weightedRandom(weights: Record<string, number>): string {
  const entries = Object.entries(weights).filter(([, w]) => w > 0);
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let random = Math.random() * total;

  for (const [key, weight] of entries) {
    random -= weight;
    if (random <= 0) return key;
  }
  return entries[0][0];
}

// Main seed function
export async function seedTiDBWithMockData(playerCount: number = 50): Promise<{
  gamesCreated: number;
  decisionsCreated: number;
  snapshotsCreated: number;
  errors: string[];
}> {
  const errors: string[] = [];

  let gamesCreated = 0;
  let decisionsCreated = 0;
  let snapshotsCreated = 0;

  try {
    // Generate player journeys with different outcomes
    const journeys: PlayerJourney[] = [];

    for (let i = 0; i < playerCount; i++) {
      const playerName = MALAY_NAMES[i % MALAY_NAMES.length] + (i >= MALAY_NAMES.length ? ` ${Math.floor(i / MALAY_NAMES.length) + 1}` : "");
      const personaId = PERSONAS[i % 2];

      // Distribution: 40% positive, 40% negative, 20% incomplete
      let outcomeType: "positive" | "negative" | "incomplete";
      if (i % 5 === 4) {
        outcomeType = "incomplete";
      } else if (i % 2 === 0) {
        outcomeType = "positive";
      } else {
        outcomeType = "negative";
      }

      journeys.push(generatePlayerJourney(playerName, personaId, outcomeType));
    }

    // Insert completed games one by one (to avoid batch issues)
    const completedGames = journeys.filter(j => j.finalGame !== null).map(j => j.finalGame!);

    for (const game of completedGames) {
      try {
        await execute(
          `INSERT INTO completed_games
           (convex_game_id, player_name, persona_id, final_money, final_credit_score,
            final_health, final_stress, final_debt, weeks_completed, ending_type, failure_reason)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            game.convex_game_id, game.player_name, game.persona_id,
            game.final_money, game.final_credit_score, game.final_health,
            game.final_stress, game.final_debt, game.weeks_completed,
            game.ending_type, game.failure_reason
          ]
        );
        gamesCreated++;
      } catch (err) {
        errors.push(`Game insert error: ${err}`);
      }
    }

    // Insert weekly snapshots
    const allSnapshots = journeys.flatMap(j => j.weeklySnapshots);

    for (const snapshot of allSnapshots) {
      try {
        await execute(
          `INSERT INTO weekly_snapshots
           (convex_game_id, player_name, persona_id, week, money, debt, credit_score,
            health, stress, objectives_completed, work_days_completed, bought_groceries,
            filled_petrol, paid_debt, weekend_activity, is_game_over, ending_type)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            snapshot.convex_game_id, snapshot.player_name, snapshot.persona_id,
            snapshot.week, snapshot.money, snapshot.debt, snapshot.credit_score,
            snapshot.health, snapshot.stress, snapshot.objectives_completed,
            snapshot.work_days_completed, snapshot.bought_groceries,
            snapshot.filled_petrol, snapshot.paid_debt, snapshot.weekend_activity,
            snapshot.is_game_over, snapshot.ending_type || null
          ]
        );
        snapshotsCreated++;
      } catch (err) {
        // Ignore duplicate key errors for snapshots
        if (!String(err).includes("Duplicate")) {
          errors.push(`Snapshot insert error: ${err}`);
        }
      }
    }

    // Insert decisions
    const allDecisions = journeys.flatMap(j => j.decisions);

    for (const decision of allDecisions) {
      try {
        await execute(
          `INSERT INTO player_decisions
           (convex_game_id, location, scenario_id, choice_index, choice_text,
            money_change, credit_change, health_change, stress_change, day, week)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            decision.convex_game_id, decision.location, decision.scenario_id,
            decision.choice_index, decision.choice_text, decision.money_change,
            decision.credit_change, decision.health_change, decision.stress_change,
            decision.day, decision.week
          ]
        );
        decisionsCreated++;
      } catch (err) {
        errors.push(`Decision insert error: ${err}`);
      }
    }

    // Update persona_stats_cache
    await execute(`
      INSERT INTO persona_stats_cache (persona_id, total_games, avg_final_money, avg_credit_score, avg_weeks_completed, success_rate, most_common_ending)
      SELECT
        persona_id,
        COUNT(*) as total_games,
        AVG(final_money) as avg_final_money,
        AVG(final_credit_score) as avg_credit_score,
        AVG(weeks_completed) as avg_weeks_completed,
        (SUM(CASE WHEN ending_type IN ('survived', 'thrived') THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as success_rate,
        (SELECT ending_type FROM completed_games cg2 WHERE cg2.persona_id = completed_games.persona_id
         GROUP BY ending_type ORDER BY COUNT(*) DESC LIMIT 1) as most_common_ending
      FROM completed_games
      GROUP BY persona_id
      ON DUPLICATE KEY UPDATE
        total_games = VALUES(total_games),
        avg_final_money = VALUES(avg_final_money),
        avg_credit_score = VALUES(avg_credit_score),
        avg_weeks_completed = VALUES(avg_weeks_completed),
        success_rate = VALUES(success_rate),
        most_common_ending = VALUES(most_common_ending),
        updated_at = CURRENT_TIMESTAMP
    `);

  } catch (error) {
    errors.push(String(error));
  }

  return {
    gamesCreated,
    decisionsCreated,
    snapshotsCreated,
    errors
  };
}

// Export for API route
export default seedTiDBWithMockData;
