"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Types for the sync data
interface GameSyncData {
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

interface DecisionSyncData {
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

interface WeeklySnapshotData {
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
}

interface SyncResult {
  success: boolean;
  error?: string;
  gameId?: number;
  snapshotId?: number;
  decisionsCount?: number;
}

// TiDB sync action - syncs completed game data to TiDB for analytics
// This calls the Next.js API route which handles the actual TiDB connection

export const syncCompletedGame = action({
  args: {
    gameId: v.id("games"),
  },
  handler: async (ctx, args): Promise<SyncResult> => {
    // Get the game data from Convex
    const game = await ctx.runQuery(api.games.getGame, { gameId: args.gameId });
    if (!game) {
      throw new Error("Game not found");
    }

    // Get all decisions for this game
    const decisions = await ctx.runQuery(api.games.getAllDecisions, {
      gameId: args.gameId,
    });

    // Prepare the data for TiDB
    const gameData: GameSyncData = {
      convex_game_id: args.gameId,
      player_name: game.playerName || "Anonymous",
      persona_id: game.personaId,
      final_money: game.money,
      final_credit_score: game.creditScore,
      final_health: game.health,
      final_stress: game.stress,
      final_debt: game.debt,
      weeks_completed: game.currentWeek,
      ending_type: game.endingType || "unknown",
      failure_reason: game.failureReason || null,
    };

    const decisionsData: DecisionSyncData[] = decisions.map((d: {
      location: string;
      scenarioId: string;
      choiceIndex: number;
      choiceText: string;
      moneyChange: number;
      creditChange: number;
      healthChange: number;
      stressChange: number;
      day: number;
      week: number;
    }) => ({
      convex_game_id: args.gameId,
      location: d.location,
      scenario_id: d.scenarioId,
      choice_index: d.choiceIndex,
      choice_text: d.choiceText,
      money_change: d.moneyChange,
      credit_change: d.creditChange,
      health_change: d.healthChange,
      stress_change: d.stressChange,
      day: d.day,
      week: d.week,
    }));

    // Call the Next.js API route to sync to TiDB
    // The API route handles the actual database connection
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    try {
      const response = await fetch(`${baseUrl}/api/analytics/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add an internal API key for security
          "X-Internal-Key": process.env.INTERNAL_API_KEY || "dev-key",
        },
        body: JSON.stringify({
          game: gameData,
          decisions: decisionsData,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("TiDB sync failed:", errorText);
        // Don't throw - we don't want to break the game flow if analytics fails
        return { success: false, error: errorText };
      }

      const result = await response.json() as SyncResult;
      return { ...result, success: true };
    } catch (err) {
      console.error("TiDB sync error:", err);
      // Don't throw - analytics sync failure shouldn't break the game
      return { success: false, error: String(err) };
    }
  },
});

// Sync weekly progress to TiDB (called after each week completion)
export const syncWeeklyProgress = action({
  args: {
    gameId: v.id("games"),
    weekCompleted: v.number(),
    weekendActivity: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<SyncResult> => {
    // Get the game data from Convex
    const game = await ctx.runQuery(api.games.getGame, { gameId: args.gameId });
    if (!game) {
      return { success: false, error: "Game not found" };
    }

    // Get decisions for this specific week
    const allDecisions = await ctx.runQuery(api.games.getAllDecisions, {
      gameId: args.gameId,
    });

    // Filter decisions for the completed week
    const weekDecisions = allDecisions.filter((d: { week: number }) => d.week === args.weekCompleted);

    // Get objectives (with fallback for old games)
    const objectives = game.weeklyObjectives ?? {
      workDaysCompleted: 0,
      boughtGroceries: false,
      filledPetrol: false,
      paidDebt: false,
    };

    // Prepare weekly snapshot data
    const snapshotData: WeeklySnapshotData = {
      convex_game_id: args.gameId,
      player_name: game.playerName || "Anonymous",
      persona_id: game.personaId,
      week: args.weekCompleted,
      money: game.money,
      debt: game.debt,
      credit_score: game.creditScore,
      health: game.health,
      stress: game.stress,
      objectives_completed: objectives.workDaysCompleted >= 5 &&
                           objectives.boughtGroceries &&
                           objectives.filledPetrol &&
                           (args.weekCompleted < 4 || objectives.paidDebt),
      work_days_completed: objectives.workDaysCompleted,
      bought_groceries: objectives.boughtGroceries,
      filled_petrol: objectives.filledPetrol,
      paid_debt: objectives.paidDebt,
      weekend_activity: args.weekendActivity,
      is_game_over: game.isGameOver,
      ending_type: game.endingType,
    };

    const decisionsData: DecisionSyncData[] = weekDecisions.map((d: {
      location: string;
      scenarioId: string;
      choiceIndex: number;
      choiceText: string;
      moneyChange: number;
      creditChange: number;
      healthChange: number;
      stressChange: number;
      day: number;
      week: number;
    }) => ({
      convex_game_id: args.gameId,
      location: d.location,
      scenario_id: d.scenarioId,
      choice_index: d.choiceIndex,
      choice_text: d.choiceText,
      money_change: d.moneyChange,
      credit_change: d.creditChange,
      health_change: d.healthChange,
      stress_change: d.stressChange,
      day: d.day,
      week: d.week,
    }));

    // Call the Next.js API route to sync to TiDB
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    try {
      const response = await fetch(`${baseUrl}/api/analytics/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-Key": process.env.INTERNAL_API_KEY || "dev-key",
        },
        body: JSON.stringify({
          syncType: "weekly",
          weeklySnapshot: snapshotData,
          decisions: decisionsData,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("TiDB weekly sync failed:", errorText);
        return { success: false, error: errorText };
      }

      const result = await response.json() as SyncResult;
      console.log(`TiDB weekly sync successful: Week ${args.weekCompleted}, Game ${args.gameId}`);
      return { ...result, success: true };
    } catch (err) {
      console.error("TiDB weekly sync error:", err);
      return { success: false, error: String(err) };
    }
  },
});

// Helper action to sync a batch of games (useful for backfilling)
export const syncBatchGames = action({
  args: {
    gameIds: v.array(v.id("games")),
  },
  handler: async (ctx, args): Promise<Array<{ gameId: Id<"games">; success: boolean; error?: string }>> => {
    const results: Array<{ gameId: Id<"games">; success: boolean; error?: string }> = [];
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    for (const gameId of args.gameIds) {
      try {
        // Get game and decisions for each game
        const game = await ctx.runQuery(api.games.getGame, { gameId });
        if (!game) {
          results.push({ gameId, success: false, error: "Game not found" });
          continue;
        }

        const decisions = await ctx.runQuery(api.games.getAllDecisions, { gameId });

        const gameData: GameSyncData = {
          convex_game_id: gameId,
          player_name: game.playerName || "Anonymous",
          persona_id: game.personaId,
          final_money: game.money,
          final_credit_score: game.creditScore,
          final_health: game.health,
          final_stress: game.stress,
          final_debt: game.debt,
          weeks_completed: game.currentWeek,
          ending_type: game.endingType || "unknown",
          failure_reason: game.failureReason || null,
        };

        const decisionsData: DecisionSyncData[] = decisions.map((d: {
          location: string;
          scenarioId: string;
          choiceIndex: number;
          choiceText: string;
          moneyChange: number;
          creditChange: number;
          healthChange: number;
          stressChange: number;
          day: number;
          week: number;
        }) => ({
          convex_game_id: gameId,
          location: d.location,
          scenario_id: d.scenarioId,
          choice_index: d.choiceIndex,
          choice_text: d.choiceText,
          money_change: d.moneyChange,
          credit_change: d.creditChange,
          health_change: d.healthChange,
          stress_change: d.stressChange,
          day: d.day,
          week: d.week,
        }));

        const response = await fetch(`${baseUrl}/api/analytics/sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Internal-Key": process.env.INTERNAL_API_KEY || "dev-key",
          },
          body: JSON.stringify({ game: gameData, decisions: decisionsData }),
        });

        if (response.ok) {
          results.push({ gameId, success: true });
        } else {
          results.push({ gameId, success: false, error: await response.text() });
        }
      } catch (err) {
        results.push({ gameId, success: false, error: String(err) });
      }
    }

    return results;
  },
});
