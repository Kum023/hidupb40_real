import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Default weekly objectives
const DEFAULT_WEEKLY_OBJECTIVES = {
  workDaysCompleted: 0,
  boughtGroceries: false,
  filledPetrol: false,
  paidDebt: false, // tracks optional EXTRA bank payment this week
};

// Weekly financial breakdown per persona.
// Salary is paid at end of each week (like monthly salary ÷ 4).
// Rent and minimum debt installment are auto-deducted at the same time (bank auto-debit).
const WEEKLY_FINANCES: Record<string, {
  weeklySalary: number;
  weeklyRent: number;
  weeklyDebtMin: number; // minimum installment auto-deducted
  debtInterestRate: number; // weekly interest on remaining debt
  debtLabel: string;
}> = {
  freshGrad: {
    weeklySalary: 550,       // RM 2,200 monthly ÷ 4 weeks
    weeklyRent: 138,          // RM 550/month KL apartment ÷ 4 weeks
    weeklyDebtMin: 150,       // PTPTN RM 600/month ÷ 4 weeks
    debtInterestRate: 0.0003, // ~1.5% annual student loan
    debtLabel: "PTPTN",
  },
  singleParent: {
    weeklySalary: 450,        // RM 1,800 monthly ÷ 4 weeks
    weeklyRent: 113,          // RM 450/month Penang house ÷ 4 weeks
    weeklyDebtMin: 88,        // Personal loan RM 350/month ÷ 4 weeks
    debtInterestRate: 0.0006, // Higher rate on personal loan
    debtLabel: "Personal Loan",
  },
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
    playerName:         v.string(),
    personaId:          v.string(),
    initialMoney:       v.number(),
    initialDebt:        v.number(),
    initialCreditScore: v.number(),
    classroomCode:      v.optional(v.string()), // links game to teacher's classroom session
  },
  handler: async (ctx, args) => {
    const gameId = await ctx.db.insert("games", {
      playerName:       args.playerName,
      personaId:        args.personaId,
      money:            args.initialMoney,
      debt:             args.initialDebt,
      creditScore:      args.initialCreditScore,
      health:           100,
      stress:           20,
      currentDay:       1,
      currentWeek:      1,
      energyRemaining:  11,
      currentLocation:  "home",
      classroomCode:    args.classroomCode?.trim().toUpperCase(),
      weeklyObjectives: {
        workDaysCompleted: 0,
        boughtGroceries:   false,
        filledPetrol:      false,
        paidDebt:          false,
      },
      weeklyEventTriggered: false,
      weeklyEventDay:       getRandomEventDay(),
      workedToday:          false,
      isGameOver:           false,
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

    // Check if it's impossible to complete objectives with remaining energy.
    // Debt payment is now auto-deducted at week end — not a manual energy cost.
    const workDaysNeeded = Math.max(0, 5 - objectives.workDaysCompleted);
    const groceriesNeeded = objectives.boughtGroceries ? 0 : 1;
    const petrolNeeded = objectives.filledPetrol ? 0 : 1;
    const minEnergyNeeded = workDaysNeeded + groceriesNeeded + petrolNeeded;

    // FIX: if the destination itself completes a pending objective, don't count
    // that energy as "needed" — arriving there IS the completion.
    const destinationCompletesObjective =
      (args.location === "office" && workDaysNeeded > 0 && !game.workedToday) ||
      (args.location === "shop"   && groceriesNeeded > 0) ||
      (args.location === "petrol" && petrolNeeded > 0);
    const adjustedMinEnergy = destinationCompletesObjective
      ? Math.max(0, minEnergyNeeded - 1)
      : minEnergyNeeded;

    let isGameOver = false;
    let endingType: string | undefined;
    let failureReason: string | undefined;

    if (newEnergy < adjustedMinEnergy) {
      isGameOver = true;
      endingType = "impossible_objectives";
      failureReason = `Not enough energy left to finish the week. Need ${adjustedMinEnergy} more actions but only ${newEnergy} energy remains. Work: ${workDaysNeeded} days, Groceries: ${groceriesNeeded ? "pending" : "done"}, Petrol: ${petrolNeeded ? "pending" : "done"}.`;
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
        stressChange = 7; // Work increases stress by 7% (realistic: draining but manageable)
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

      case "debt": {
        // This is an EXTRA voluntary payment at the bank (on top of auto-debit at week end).
        // Rewards the player with a credit score boost — teaches proactive debt management.
        if (objectives.paidDebt) {
          throw new Error("Already made an extra payment this week — come back next week");
        }
        if (game.debt <= 0) {
          throw new Error("You have no remaining debt. Great job!");
        }
        const extraPayment = 200; // Fixed RM 200 extra above the weekly minimum installment
        if (game.money < extraPayment) {
          throw new Error(`Need at least RM ${extraPayment} to make an extra debt payment`);
        }
        updates.weeklyObjectives = { ...objectives, paidDebt: true };
        updates.debt = Math.max(0, game.debt - extraPayment);
        // Reward: paying extra above minimum significantly boosts credit score
        updates.creditScore = Math.min(850, game.creditScore + 20);
        moneyChange = -extraPayment;
        break;
      }

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

    // Log credit event for voluntary extra debt payment
    let objectiveCreditChange = 0;
    if (args.objectiveType === "debt" && !isGameOver) {
      objectiveCreditChange = 20;
      await ctx.db.insert("creditEvents", {
        gameId: args.gameId,
        change: 20,
        reason: "Voluntary extra debt payment — responsible financial behaviour",
        day: game.currentDay,
        week: game.currentWeek,
      });
    }

    return {
      moneyChange,
      stressChange,
      healthChange,
      creditChange: objectiveCreditChange,
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
    // Note: Debt payment is now auto-deducted at week end (like bank auto-debit).
    // The bank visit for extra payment is optional and rewards credit score, not mandatory.

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

    // ── Objectives check (work, groceries, petrol — debt is auto-deducted) ──
    const objectives = getObjectives(game);
    const workComplete = objectives.workDaysCompleted >= 5;
    const groceriesComplete = objectives.boughtGroceries;
    const petrolComplete = objectives.filledPetrol;

    if (!workComplete || !groceriesComplete || !petrolComplete) {
      const missing: string[] = [];
      if (!workComplete) missing.push(`Work (${objectives.workDaysCompleted}/5 days)`);
      if (!groceriesComplete) missing.push("Groceries");
      if (!petrolComplete) missing.push("Petrol");

      await ctx.db.patch(args.gameId, {
        isGameOver: true,
        endingType: "objectives_failed",
        failureReason: `You didn't complete: ${missing.join(", ")}. Life doesn't pause when you don't keep up.`,
      });

      return {
        isGameOver: true,
        endingType: "objectives_failed",
        failureReason: `Missed objectives: ${missing.join(", ")}`,
        salaryBreakdown: null,
      };
    }

    // ── Weekend activity cost ──
    const moneyAfterActivity = game.money - args.moneyCost;

    // ── PAYDAY: weekly salary credited (like monthly salary ÷ 4) ──
    const finances = WEEKLY_FINANCES[game.personaId] ?? WEEKLY_FINANCES.freshGrad;
    const moneyAfterSalary = moneyAfterActivity + finances.weeklySalary;

    // ── AUTO-DEBIT: rent deducted (landlord auto-collects) ──
    const moneyAfterRent = moneyAfterSalary - finances.weeklyRent;

    // ── AUTO-DEBIT: minimum debt instalment (progressive difficulty) ──
    // Week 1 = 33% (PTPTN grace period), Week 2 = 67% (transition),
    // Week 3-4 = 100% (full repayment — welcome to adult life).
    // This mirrors how PTPTN and personal loans actually ramp up after graduation.
    const weekScales: Record<number, number> = { 1: 0.33, 2: 0.67, 3: 1.0, 4: 1.0 };
    const difficultyScale = weekScales[game.currentWeek] ?? 1.0;
    const scaledDebtMin = Math.round(finances.weeklyDebtMin * difficultyScale);

    const hasDebt = game.debt > 0;
    const minimumInstalment = Math.min(scaledDebtMin, game.debt);
    const canPayInstalment = hasDebt && moneyAfterRent >= minimumInstalment;
    const actualInstalmentPaid = canPayInstalment ? minimumInstalment : 0;
    const moneyAfterDebt = moneyAfterRent - actualInstalmentPaid;

    // ── INTEREST: remaining debt accrues interest (compound effect) ──
    const debtAfterInstalment = Math.max(0, game.debt - actualInstalmentPaid);
    const weeklyInterest = Math.round(debtAfterInstalment * finances.debtInterestRate);
    const finalDebt = debtAfterInstalment + weeklyInterest;

    // ── Stress and health from weekend activity ──
    const newStress = Math.min(100, Math.max(0, game.stress + args.stressChange));
    const newHealth = Math.min(100, Math.max(0, game.health + (args.healthChange || 0)));

    // ── Final money (floor at 0) ──
    const newMoney = Math.max(0, moneyAfterDebt);

    // ── Credit score from auto-debit result ──
    let creditChange = 0;
    if (hasDebt && canPayInstalment) {
      creditChange = 5; // On-time auto-payment: small but steady credit improvement
    } else if (hasDebt && !canPayInstalment) {
      creditChange = -20; // Missed instalment: real credit damage
    }
    const newCreditScore = Math.min(850, Math.max(300, game.creditScore + creditChange));

    // ── Game-over checks ──
    let isGameOver = false;
    let endingType: string | undefined;
    let failureReason: string | undefined;

    if (newHealth <= 0) {
      isGameOver = true;
      endingType = "health_crisis";
      failureReason = "Your health completely failed. You had to stop working.";
    } else if (newStress >= 100) {
      isGameOver = true;
      endingType = "burnout";
      failureReason = "You burned out completely. Your body and mind gave up.";
    } else if (moneyAfterRent < 0 && game.currentWeek < 4) {
      // Can't cover rent even after salary — eviction
      isGameOver = true;
      endingType = "evicted";
      failureReason = "After salary, you still couldn't cover rent. You received an eviction notice.";
    }

    // ── Final week: determine ending ──
    if (game.currentWeek >= 4 && !isGameOver) {
      isGameOver = true;
      const debtImproving = finalDebt <= game.debt; // debt shrinking or stable
      const hasSavedUp = newMoney >= 400;            // some cushion left
      const goodCredit = newCreditScore >= 650;      // reasonable credit standing

      if (hasSavedUp && goodCredit && debtImproving) {
        endingType = "success";          // on track financially
      } else if (!hasSavedUp && !goodCredit) {
        endingType = "struggle";         // treading water
      } else {
        endingType = "survivor";         // made it, but barely
      }
    }

    // ── Log credit event from auto-debit ──
    if (creditChange !== 0) {
      await ctx.db.insert("creditEvents", {
        gameId: args.gameId,
        change: creditChange,
        reason: canPayInstalment
          ? `${finances.debtLabel} auto-instalment paid on time`
          : `${finances.debtLabel} instalment missed — insufficient funds`,
        day: 7,
        week: game.currentWeek,
      });
    }

    // ── Advance to next week ──
    const newWeek = game.currentWeek + 1;

    await ctx.db.patch(args.gameId, {
      money: newMoney,
      debt: finalDebt,
      creditScore: newCreditScore,
      stress: newStress,
      health: newHealth,
      currentDay: 1,
      currentWeek: newWeek,
      energyRemaining: 11,
      weeklyObjectives: {
        workDaysCompleted: 0,
        boughtGroceries: false,
        filledPetrol: false,
        paidDebt: false,
      },
      weeklyEventTriggered: false,
      weeklyEventDay: getRandomEventDay(),
      workedToday: false,
      isGameOver,
      endingType,
      failureReason,
    });

    return {
      newWeek,
      newMoney,
      newDebt: finalDebt,
      newStress,
      newHealth,
      newCreditScore,
      isGameOver,
      endingType,
      // Full breakdown returned so frontend can show the payday summary + warnings
      salaryBreakdown: {
        grossSalary: finances.weeklySalary,
        rentDeducted: finances.weeklyRent,
        instalmentPaid: actualInstalmentPaid,
        instalmentExpected: scaledDebtMin,
        interestAdded: weeklyInterest,
        weekendCost: args.moneyCost,
        creditChange,
        couldPayInstalment: canPayInstalment,
        debtLabel: finances.debtLabel,
        difficultyScale,
        // Next week's instalment so the frontend can warn the player
        nextWeekInstalmentMin: game.currentWeek < 4
          ? Math.round(finances.weeklyDebtMin * (weekScales[game.currentWeek + 1] ?? 1.0))
          : scaledDebtMin,
        nextWeekIsFullDebt: (game.currentWeek + 1) >= 3,
      },
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
      // Debt is auto-deducted at week end — not part of energy-based objectives.
      const debtComplete = true;

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
