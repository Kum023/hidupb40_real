import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Default weekly objectives
const DEFAULT_WEEKLY_OBJECTIVES = {
  workDaysCompleted: 0,
  boughtGroceries: false,
  filledPetrol: false,
  paidDebt: false,
};

// Helper to get energy with fallback
function getEnergy(game: { energyRemaining?: number }): number {
  return game.energyRemaining ?? 11;
}

// Helper to get weekly objectives with fallback
function getObjectives(game: { weeklyObjectives?: typeof DEFAULT_WEEKLY_OBJECTIVES }) {
  return game.weeklyObjectives ?? DEFAULT_WEEKLY_OBJECTIVES;
}

// Get the most recent active game
export const getCurrentGame = query({
  args: {},
  handler: async (ctx) => {
    const games = await ctx.db
      .query("games")
      .order("desc")
      .filter((q) => q.eq(q.field("isGameOver"), false))
      .first();
    return games;
  },
});

// Get a specific game by ID
export const getGame = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.gameId);
  },
});

// Helper function to generate random event day (1-5)
function getRandomEventDay(): number {
  return Math.floor(Math.random() * 5) + 1;
}

// Create a new game with selected persona
export const createGame = mutation({
  args: {
    playerName: v.string(),
    personaId: v.string(),
    initialMoney: v.number(),
    initialDebt: v.number(),
    initialCreditScore: v.number(),
  },
  handler: async (ctx, args) => {
    const gameId = await ctx.db.insert("games", {
      playerName: args.playerName,
      personaId: args.personaId,
      money: args.initialMoney,
      debt: args.initialDebt,
      creditScore: args.initialCreditScore,
      health: 100,
      stress: 20,
      currentDay: 1,
      currentWeek: 1,
      energyRemaining: 11, // 11 energy per week
      currentLocation: "home",
      weeklyObjectives: {
        workDaysCompleted: 0,
        boughtGroceries: false,
        filledPetrol: false,
        paidDebt: false,
      },
      weeklyEventTriggered: false,
      weeklyEventDay: getRandomEventDay(),
      workedToday: false, // Track daily work
      isGameOver: false,
    });

    return gameId;
  },
});

// Update game state after a choice
export const updateGameState = mutation({
  args: {
    gameId: v.id("games"),
    moneyChange: v.number(),
    creditChange: v.number(),
    healthChange: v.number(),
    stressChange: v.number(),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");

    const newMoney = Math.max(0, game.money + args.moneyChange);
    const newCreditScore = Math.min(850, Math.max(300, game.creditScore + args.creditChange));
    const newHealth = Math.min(100, Math.max(0, game.health + args.healthChange));
    const newStress = Math.min(100, Math.max(0, game.stress + args.stressChange));

    // Check for game over conditions
    let isGameOver = false;
    let endingType: string | undefined;
    let failureReason: string | undefined;

    if (newHealth <= 0) {
      isGameOver = true;
      endingType = "health_crisis";
      failureReason = "Your health has deteriorated to dangerous levels. You need to focus on recovery.";
    } else if (newStress >= 100) {
      isGameOver = true;
      endingType = "burnout";
      failureReason = "The stress has become overwhelming. You've burned out and can't continue.";
    }

    await ctx.db.patch(args.gameId, {
      money: newMoney,
      creditScore: newCreditScore,
      health: newHealth,
      stress: newStress,
      isGameOver,
      endingType,
      failureReason,
    });

    // Log credit score change if significant
    if (args.creditChange !== 0) {
      await ctx.db.insert("creditEvents", {
        gameId: args.gameId,
        change: args.creditChange,
        reason: args.creditChange > 0 ? "Good financial decision" : "Financial setback",
        day: game.currentDay,
        week: game.currentWeek,
      });
    }

    return { isGameOver, endingType, failureReason };
  },
});

// Move player to a new location (uses 1 energy)
export const moveToLocation = mutation({
  args: {
    gameId: v.id("games"),
    location: v.string(),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    const energy = getEnergy(game);
    if (energy <= 0) throw new Error("No energy remaining");

    const newEnergy = energy - 1;
    const objectives = getObjectives(game);

    // Check if it's impossible to complete objectives with remaining energy
    const workDaysNeeded = Math.max(0, 5 - objectives.workDaysCompleted);
    const groceriesNeeded = objectives.boughtGroceries ? 0 : 1;
    const petrolNeeded = objectives.filledPetrol ? 0 : 1;
    const debtNeeded = (game.currentWeek === 4 && !objectives.paidDebt) ? 1 : 0;

    // Minimum energy needed (work days + other objectives that aren't at same location)
    const minEnergyNeeded = workDaysNeeded + groceriesNeeded + petrolNeeded + debtNeeded;

    let isGameOver = false;
    let endingType: string | undefined;
    let failureReason: string | undefined;

    if (newEnergy < minEnergyNeeded) {
      isGameOver = true;
      endingType = "impossible_objectives";
      failureReason = `Not enough energy to complete objectives. Need ${minEnergyNeeded} energy but only have ${newEnergy}. Work: ${workDaysNeeded} days needed, Groceries: ${groceriesNeeded ? "pending" : "done"}, Petrol: ${petrolNeeded ? "pending" : "done"}${debtNeeded ? ", Debt: pending" : ""}.`;
    }

    await ctx.db.patch(args.gameId, {
      currentLocation: args.location,
      energyRemaining: newEnergy,
      isGameOver,
      endingType,
      failureReason,
    });

    return { energyRemaining: newEnergy, isGameOver, endingType, failureReason };
  },
});

// Complete an objective (work, groceries, petrol, debt)
export const completeObjective = mutation({
  args: {
    gameId: v.id("games"),
    objectiveType: v.string(), // "work" | "groceries_healthy" | "groceries_unhealthy" | "petrol" | "debt"
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");

    const objectives = getObjectives(game);
    const updates: Record<string, unknown> = {};
    let moneyChange = 0;
    let stressChange = 0;
    let healthChange = 0;

    switch (args.objectiveType) {
      case "work":
        // Can only work once per day
        if (game.workedToday) {
          throw new Error("Already worked today");
        }
        // Can only work max 5 times per week
        if (objectives.workDaysCompleted >= 5) {
          throw new Error("Already completed all work days for this week");
        }
        updates.workedToday = true;
        updates.weeklyObjectives = {
          ...objectives,
          workDaysCompleted: objectives.workDaysCompleted + 1,
        };
        stressChange = 10; // Work increases stress by 10%
        break;

      case "groceries_healthy":
        if (objectives.boughtGroceries) {
          throw new Error("Already bought groceries this week");
        }
        updates.weeklyObjectives = {
          ...objectives,
          boughtGroceries: true,
        };
        moneyChange = -50; // RM50 for healthy groceries
        stressChange = -10; // Reduces stress by 10%
        healthChange = 10; // Improves health by 10%
        break;

      case "groceries_unhealthy":
        if (objectives.boughtGroceries) {
          throw new Error("Already bought groceries this week");
        }
        updates.weeklyObjectives = {
          ...objectives,
          boughtGroceries: true,
        };
        moneyChange = -30; // RM30 for unhealthy groceries
        stressChange = -15; // More stress relief (comfort food)
        healthChange = -10; // Reduces health by 10%
        break;

      case "petrol":
        if (objectives.filledPetrol) {
          throw new Error("Already filled petrol this week");
        }
        updates.weeklyObjectives = {
          ...objectives,
          filledPetrol: true,
        };
        moneyChange = -80; // RM80 for petrol
        break;

      case "debt":
        if (objectives.paidDebt) {
          throw new Error("Already paid debt this week");
        }
        // Calculate debt payment - realistic monthly installment
        // Degree/loans typically paid over 5-10 years, so ~5% of total debt per month
        // Fresh Grad: RM30k → RM500, Single Parent: RM7k → RM350
        const debtPayment = Math.max(200, Math.ceil(game.debt * 0.05));
        if (game.money < debtPayment) {
          throw new Error("Not enough money to pay debt");
        }
        updates.weeklyObjectives = {
          ...objectives,
          paidDebt: true,
        };
        moneyChange = -debtPayment;
        // Update debt amount
        updates.debt = Math.max(0, game.debt - debtPayment);
        break;

      default:
        throw new Error("Invalid objective type");
    }

    // Apply stat changes
    const newMoney = Math.max(0, game.money + moneyChange);
    const newStress = Math.min(100, Math.max(0, game.stress + stressChange));
    const newHealth = Math.min(100, Math.max(0, game.health + healthChange));

    // Check for game over conditions
    let isGameOver = false;
    let endingType: string | undefined;
    let failureReason: string | undefined;

    if (newHealth <= 0) {
      isGameOver = true;
      endingType = "health_crisis";
      failureReason = "Your health has deteriorated to dangerous levels.";
    } else if (newStress >= 100) {
      isGameOver = true;
      endingType = "burnout";
      failureReason = "The stress has become overwhelming. You've burned out.";
    }

    await ctx.db.patch(args.gameId, {
      ...updates,
      money: newMoney,
      stress: newStress,
      health: newHealth,
      isGameOver,
      endingType,
      failureReason,
    });

    return {
      moneyChange,
      stressChange,
      healthChange,
      isGameOver,
      endingType,
    };
  },
});

// Trigger a random special event
export const triggerRandomEvent = mutation({
  args: {
    gameId: v.id("games"),
    eventId: v.string(),
    moneyChange: v.number(),
    stressChange: v.number(),
    healthChange: v.number(),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");

    if (game.weeklyEventTriggered) {
      throw new Error("Weekly event already triggered");
    }

    // Apply event effects
    const newMoney = Math.max(0, game.money + args.moneyChange);
    const newStress = Math.min(100, Math.max(0, game.stress + args.stressChange));
    const newHealth = Math.min(100, Math.max(0, game.health + args.healthChange));

    // Check for game over conditions
    let isGameOver = false;
    let endingType: string | undefined;
    let failureReason: string | undefined;

    if (newHealth <= 0) {
      isGameOver = true;
      endingType = "health_crisis";
      failureReason = "A sudden health crisis has ended your journey.";
    } else if (newStress >= 100) {
      isGameOver = true;
      endingType = "burnout";
      failureReason = "The stress became too much to handle.";
    }

    await ctx.db.patch(args.gameId, {
      money: newMoney,
      stress: newStress,
      health: newHealth,
      weeklyEventTriggered: true,
      isGameOver,
      endingType,
      failureReason,
    });

    return { newMoney, newStress, newHealth, isGameOver };
  },
});

// Check if week is complete (all objectives done)
export const checkWeekComplete = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");

    const objectives = getObjectives(game);
    const missing: string[] = [];

    if (objectives.workDaysCompleted < 5) {
      missing.push(`Work (${objectives.workDaysCompleted}/5 days)`);
    }
    if (!objectives.boughtGroceries) {
      missing.push("Buy Groceries");
    }
    if (!objectives.filledPetrol) {
      missing.push("Fill Petrol");
    }
    // Debt payment only required on week 4
    if (game.currentWeek === 4 && !objectives.paidDebt) {
      missing.push("Pay Debt");
    }

    const complete = missing.length === 0;

    return { complete, missing, objectives };
  },
});

// Advance to the next day
export const advanceDay = mutation({
  args: {
    gameId: v.id("games"),
    applyLeave: v.optional(v.boolean()), // If true, skip work with penalty
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");

    // Check if worked today (required on weekdays 1-5)
    if (game.currentDay <= 5 && !game.workedToday && !args.applyLeave) {
      return {
        canAdvance: false,
        reason: "work_required",
        message: "You haven't worked today! Go to office or apply leave.",
      };
    }

    // Apply leave penalty if skipping work
    let stressChange = 0;
    let healthChange = 0;
    let creditChange = 0;

    if (args.applyLeave && !game.workedToday) {
      stressChange = 15; // +15% stress (guilt/anxiety)
      healthChange = -5; // -5% health
      creditChange = -5; // -5 credit score (seen as unreliable)
    }

    const newDay = game.currentDay + 1;

    // If we've passed day 5, we're at weekend (handled separately)
    if (newDay > 5) {
      // Don't advance past day 5 - weekend dialog should handle this
      return {
        canAdvance: true,
        newDay: 5,
        newWeek: game.currentWeek,
        isWeekend: true,
        shouldShowWeekendDialog: true,
      };
    }

    // Apply changes and advance
    const newStress = Math.min(100, Math.max(0, game.stress + stressChange));
    const newHealth = Math.min(100, Math.max(0, game.health + healthChange));
    const newCreditScore = Math.min(850, Math.max(300, game.creditScore + creditChange));

    // Check for game over from leave penalty
    let isGameOver = false;
    let endingType: string | undefined;
    let failureReason: string | undefined;

    if (newHealth <= 0) {
      isGameOver = true;
      endingType = "health_crisis";
      failureReason = "Your health has deteriorated to dangerous levels.";
    } else if (newStress >= 100) {
      isGameOver = true;
      endingType = "burnout";
      failureReason = "The stress has become overwhelming. You've burned out.";
    }

    await ctx.db.patch(args.gameId, {
      currentDay: newDay,
      workedToday: false, // Reset for new day
      stress: newStress,
      health: newHealth,
      creditScore: newCreditScore,
      isGameOver,
      endingType,
      failureReason,
    });

    return {
      canAdvance: true,
      newDay,
      newWeek: game.currentWeek,
      isWeekend: false,
      shouldShowWeekendDialog: false,
      appliedLeave: args.applyLeave && !game.workedToday,
      isGameOver,
    };
  },
});

// Select weekend activity and advance to next week
export const selectWeekendActivity = mutation({
  args: {
    gameId: v.id("games"),
    activityId: v.string(), // "skip" or specific activity id
    moneyCost: v.number(),
    stressChange: v.number(),
    healthChange: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");

    // Check if objectives are complete
    const objectives = getObjectives(game);
    const workComplete = objectives.workDaysCompleted >= 5;
    const groceriesComplete = objectives.boughtGroceries;
    const petrolComplete = objectives.filledPetrol;
    const debtComplete = game.currentWeek === 4 ? objectives.paidDebt : true;

    if (!workComplete || !groceriesComplete || !petrolComplete || !debtComplete) {
      // Game over - objectives not complete
      const missing: string[] = [];
      if (!workComplete) missing.push("Work");
      if (!groceriesComplete) missing.push("Groceries");
      if (!petrolComplete) missing.push("Petrol");
      if (!debtComplete) missing.push("Debt Payment");

      await ctx.db.patch(args.gameId, {
        isGameOver: true,
        endingType: "objectives_failed",
        failureReason: `Failed to complete weekly objectives: ${missing.join(", ")}. You couldn't keep up with life's demands.`,
      });

      return {
        isGameOver: true,
        endingType: "objectives_failed",
        failureReason: `Failed to complete weekly objectives: ${missing.join(", ")}`,
      };
    }

    // Apply weekend activity effects
    const newMoney = Math.max(0, game.money - args.moneyCost);
    const newStress = Math.min(100, Math.max(0, game.stress + args.stressChange));
    const newHealth = Math.min(100, Math.max(0, game.health + (args.healthChange || 0)));

    // Check for game over from weekend activity
    let isGameOver = false;
    let endingType: string | undefined;
    let failureReason: string | undefined;

    if (newHealth <= 0) {
      isGameOver = true;
      endingType = "health_crisis";
      failureReason = "Your health has failed.";
    } else if (newStress >= 100) {
      isGameOver = true;
      endingType = "burnout";
      failureReason = "You've completely burned out.";
    }

    // Check if this was the final week
    if (game.currentWeek >= 4 && !isGameOver) {
      isGameOver = true;
      endingType = newMoney > 0 && game.creditScore > 600 ? "success" : "struggle";
    }

    // Advance to next week
    const newWeek = game.currentWeek + 1;

    await ctx.db.patch(args.gameId, {
      money: newMoney,
      stress: newStress,
      health: newHealth,
      currentDay: 1,
      currentWeek: newWeek,
      energyRemaining: 11, // Reset energy for new week
      weeklyObjectives: {
        workDaysCompleted: 0,
        boughtGroceries: false,
        filledPetrol: false,
        paidDebt: false,
      },
      weeklyEventTriggered: false,
      weeklyEventDay: getRandomEventDay(),
      workedToday: false, // Reset for new week
      isGameOver,
      endingType,
      failureReason,
    });

    return {
      newWeek,
      newMoney,
      newStress,
      newHealth,
      isGameOver,
      endingType,
    };
  },
});

// Check if game should be over due to no energy and incomplete objectives
export const checkGameOverCondition = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");

    const energy = getEnergy(game);

    // If energy is 0 and objectives not complete, game over
    if (energy <= 0) {
      const objectives = getObjectives(game);
      const workComplete = objectives.workDaysCompleted >= 5;
      const groceriesComplete = objectives.boughtGroceries;
      const petrolComplete = objectives.filledPetrol;
      const debtComplete = game.currentWeek === 4 ? objectives.paidDebt : true;

      if (!workComplete || !groceriesComplete || !petrolComplete || !debtComplete) {
        const missing: string[] = [];
        if (!workComplete) missing.push(`Work (${objectives.workDaysCompleted}/5)`);
        if (!groceriesComplete) missing.push("Groceries");
        if (!petrolComplete) missing.push("Petrol");
        if (!debtComplete) missing.push("Debt Payment");

        await ctx.db.patch(args.gameId, {
          isGameOver: true,
          endingType: "energy_depleted",
          failureReason: `Ran out of energy before completing objectives: ${missing.join(", ")}. Life demands more than you could give.`,
        });

        return {
          isGameOver: true,
          endingType: "energy_depleted",
          failureReason: `Ran out of energy: ${missing.join(", ")}`,
          missing,
        };
      }
    }

    return { isGameOver: false };
  },
});

// Record a decision
export const recordDecision = mutation({
  args: {
    gameId: v.id("games"),
    location: v.string(),
    scenarioId: v.string(),
    choiceIndex: v.number(),
    choiceText: v.string(),
    moneyChange: v.number(),
    creditChange: v.number(),
    healthChange: v.number(),
    stressChange: v.number(),
    hiddenConsequence: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");

    const decisionId = await ctx.db.insert("decisions", {
      gameId: args.gameId,
      location: args.location,
      scenarioId: args.scenarioId,
      choiceIndex: args.choiceIndex,
      choiceText: args.choiceText,
      moneyChange: args.moneyChange,
      creditChange: args.creditChange,
      healthChange: args.healthChange,
      stressChange: args.stressChange,
      hiddenConsequence: args.hiddenConsequence,
      consequenceTriggered: false,
      day: game.currentDay,
      week: game.currentWeek,
    });

    return decisionId;
  },
});

// Get recent decisions for a game
export const getRecentDecisions = query({
  args: { gameId: v.id("games"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const decisions = await ctx.db
      .query("decisions")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .order("desc")
      .take(args.limit ?? 5);
    return decisions;
  },
});

// Get all decisions for a game
export const getAllDecisions = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("decisions")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .collect();
  },
});

// Eat at restaurant (no energy cost, only money and health/stress effects)
export const eatAtRestaurant = mutation({
  args: {
    gameId: v.id("games"),
    moneyCost: v.number(),
    healthChange: v.number(),
    stressChange: v.number(),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");

    // Check if player has enough money
    if (game.money < args.moneyCost) {
      throw new Error("Not enough money to eat here");
    }

    // Apply effects (no energy cost!)
    const newMoney = game.money - args.moneyCost;
    const newHealth = Math.min(100, Math.max(0, game.health + args.healthChange));
    const newStress = Math.min(100, Math.max(0, game.stress + args.stressChange));

    // Check for game over conditions
    let isGameOver = false;
    let endingType: string | undefined;
    let failureReason: string | undefined;

    if (newHealth <= 0) {
      isGameOver = true;
      endingType = "health_crisis";
      failureReason = "Your health has deteriorated to dangerous levels.";
    } else if (newStress >= 100) {
      isGameOver = true;
      endingType = "burnout";
      failureReason = "The stress has become overwhelming. You've burned out.";
    }

    await ctx.db.patch(args.gameId, {
      money: newMoney,
      health: newHealth,
      stress: newStress,
      isGameOver,
      endingType,
      failureReason,
    });

    return {
      newMoney,
      newHealth,
      newStress,
      isGameOver,
      endingType,
    };
  },
});

// Reset/delete current game
export const resetGame = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    // Delete all related data
    const decisions = await ctx.db
      .query("decisions")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .collect();
    for (const d of decisions) {
      await ctx.db.delete(d._id);
    }

    const bills = await ctx.db
      .query("bills")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .collect();
    for (const b of bills) {
      await ctx.db.delete(b._id);
    }

    const events = await ctx.db
      .query("scheduledEvents")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .collect();
    for (const e of events) {
      await ctx.db.delete(e._id);
    }

    const creditEvents = await ctx.db
      .query("creditEvents")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .collect();
    for (const c of creditEvents) {
      await ctx.db.delete(c._id);
    }

    // Delete the game itself
    await ctx.db.delete(args.gameId);

    return { success: true };
  },
});
