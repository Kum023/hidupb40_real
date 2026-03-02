import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Main game state
  games: defineTable({
    playerName: v.optional(v.string()),
    personaId: v.string(),
    money: v.number(),
    debt: v.number(),
    creditScore: v.number(),
    health: v.number(),
    stress: v.number(),
    currentDay: v.number(), // 1-5 weekdays
    currentWeek: v.number(), // 1-4
    currentLocation: v.string(),

    // New energy system (optional for backwards compatibility with old games)
    energyRemaining: v.optional(v.number()), // 11 per week
    actionsRemaining: v.optional(v.number()), // Legacy field

    // Weekly objectives tracking (optional for backwards compatibility)
    weeklyObjectives: v.optional(v.object({
      workDaysCompleted: v.number(), // 0-5, need 5 to complete
      boughtGroceries: v.boolean(),
      filledPetrol: v.boolean(),
      paidDebt: v.boolean(), // only required week 4
    })),

    // Special event tracking (optional for backwards compatibility)
    weeklyEventTriggered: v.optional(v.boolean()),
    weeklyEventDay: v.optional(v.number()), // random day 1-5 when event triggers

    // Daily work tracking
    workedToday: v.optional(v.boolean()), // Reset to false on day advance

    isGameOver: v.boolean(),
    endingType: v.optional(v.string()),
    failureReason: v.optional(v.string()),
  }),

  // Player decision history
  decisions: defineTable({
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
    consequenceTriggered: v.boolean(),
    day: v.number(),
    week: v.number(),
  }).index("by_game", ["gameId"]),

  // Credit score change history
  creditEvents: defineTable({
    gameId: v.id("games"),
    change: v.number(),
    reason: v.string(),
    day: v.number(),
    week: v.number(),
  }).index("by_game", ["gameId"]),

  // Scheduled events (bills, consequences, salary)
  scheduledEvents: defineTable({
    gameId: v.id("games"),
    type: v.string(), // "consequence" | "salary" | "bill" | "random"
    triggerDay: v.number(),
    triggerWeek: v.number(),
    description: v.string(),
    data: v.any(),
    isTriggered: v.boolean(),
  })
    .index("by_game", ["gameId"])
    .index("by_trigger", ["gameId", "triggerWeek", "triggerDay", "isTriggered"]),

  // Bills tracking
  bills: defineTable({
    gameId: v.id("games"),
    type: v.string(), // "rent" | "electricity" | "water" | "phone" | "ptptn" | "loan"
    amount: v.number(),
    dueDay: v.number(),
    dueWeek: v.number(),
    isPaid: v.boolean(),
    isOverdue: v.boolean(),
  })
    .index("by_game", ["gameId"])
    .index("by_due", ["gameId", "dueWeek", "isPaid"]),

  // Leaderboard for top scores
  leaderboard: defineTable({
    gameId: v.optional(v.id("games")),
    playerName: v.string(),
    personaId: v.string(),
    score: v.number(), // Final cash money in hand
    weeksCompleted: v.number(),
    endingType: v.string(),
    createdAt: v.number(),
  })
    .index("by_score", ["score"])
    .index("by_game", ["gameId"]),
});
