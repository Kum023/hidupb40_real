import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get top 10 scores
export const getTopScores = query({
  args: {},
  handler: async (ctx) => {
    const scores = await ctx.db
      .query("leaderboard")
      .withIndex("by_score")
      .order("desc")
      .take(10);
    return scores;
  },
});

// Submit a score to the leaderboard
export const submitScore = mutation({
  args: {
    playerName: v.string(),
    personaId: v.string(),
    score: v.number(),
    weeksCompleted: v.number(),
    endingType: v.string(),
  },
  handler: async (ctx, args) => {
    const scoreId = await ctx.db.insert("leaderboard", {
      playerName: args.playerName,
      personaId: args.personaId,
      score: args.score,
      weeksCompleted: args.weeksCompleted,
      endingType: args.endingType,
      createdAt: Date.now(),
    });
    return scoreId;
  },
});

// Update score live (upsert based on gameId)
export const updateLiveScore = mutation({
  args: {
    gameId: v.id("games"),
    playerName: v.string(),
    personaId: v.string(),
    score: v.number(),
    weeksCompleted: v.number(),
  },
  handler: async (ctx, args) => {
    // Find existing entry for this game
    const existing = await ctx.db
      .query("leaderboard")
      .withIndex("by_game")
      .filter((q) => q.eq(q.field("gameId"), args.gameId))
      .first();

    if (existing) {
      // Update existing entry
      await ctx.db.patch(existing._id, {
        score: args.score,
        weeksCompleted: args.weeksCompleted,
      });
      return existing._id;
    } else {
      // Create new entry
      const scoreId = await ctx.db.insert("leaderboard", {
        gameId: args.gameId,
        playerName: args.playerName,
        personaId: args.personaId,
        score: args.score,
        weeksCompleted: args.weeksCompleted,
        endingType: "playing",
        createdAt: Date.now(),
      });
      return scoreId;
    }
  },
});

// Check if score qualifies for top 10
export const checkIfTopScore = query({
  args: { score: v.number() },
  handler: async (ctx, args) => {
    const scores = await ctx.db
      .query("leaderboard")
      .withIndex("by_score")
      .order("desc")
      .take(10);

    if (scores.length < 10) return true;

    const lowestTopScore = scores[scores.length - 1].score;
    return args.score > lowestTopScore;
  },
});

// Clear all leaderboard entries (dev only)
export const clearLeaderboard = mutation({
  args: {},
  handler: async (ctx) => {
    const allScores = await ctx.db.query("leaderboard").collect();

    for (const score of allScores) {
      await ctx.db.delete(score._id);
    }

    return { deleted: allScores.length };
  },
});
