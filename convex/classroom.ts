import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ─── Code generation ───────────────────────────────────────────────────────
// Uses unambiguous characters only (no 0/O, 1/I/L) so teachers can read
// codes aloud in class without confusion.
const CONSONANTS = "BCDFGHJKMNPQRSTVWXYZ";
const VOWELS    = "AEIOU";
const DIGITS    = "23456789";

function generateCode(): string {
  // Pattern: CVCV + 2 digits  →  e.g. "MAJU47", "BIKO23"
  const pick = (s: string) => s[Math.floor(Math.random() * s.length)];
  return (
    pick(CONSONANTS) + pick(VOWELS) +
    pick(CONSONANTS) + pick(VOWELS) +
    pick(DIGITS)     + pick(DIGITS)
  );
}

// ─── Teacher: create a classroom session ───────────────────────────────────
export const createClassroom = mutation({
  args: {
    teacherName: v.string(),
    subject:     v.optional(v.string()),
    institution: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Generate a unique code (retry on collision)
    let code = generateCode();
    let tries = 0;
    while (tries < 10) {
      const existing = await ctx.db
        .query("classrooms")
        .withIndex("by_code", q => q.eq("code", code))
        .first();
      if (!existing) break;
      code = generateCode();
      tries++;
    }

    const id = await ctx.db.insert("classrooms", {
      code,
      teacherName: args.teacherName.trim(),
      subject:     args.subject?.trim(),
      institution: args.institution?.trim(),
      isActive:    true,
      createdAt:   Date.now(),
    });

    return { code, classroomId: id };
  },
});

// ─── Student: validate a code exists ──────────────────────────────────────
export const validateCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const classroom = await ctx.db
      .query("classrooms")
      .withIndex("by_code", q => q.eq("code", args.code.trim().toUpperCase()))
      .first();
    return classroom ? { valid: true, teacherName: classroom.teacherName, subject: classroom.subject } : { valid: false };
  },
});

// ─── Link an existing game to a classroom ─────────────────────────────────
export const joinClassroom = mutation({
  args: { gameId: v.id("games"), code: v.string() },
  handler: async (ctx, args) => {
    const code = args.code.trim().toUpperCase();
    const classroom = await ctx.db
      .query("classrooms")
      .withIndex("by_code", q => q.eq("code", code))
      .first();
    if (!classroom) throw new Error("Classroom not found");

    await ctx.db.patch(args.gameId, { classroomCode: code });
    return { success: true };
  },
});

// ─── Teacher: get classroom info ──────────────────────────────────────────
export const getClassroom = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("classrooms")
      .withIndex("by_code", q => q.eq("code", args.code.trim().toUpperCase()))
      .first();
  },
});

// ─── Teacher: live list of all student games ──────────────────────────────
// Convex's reactive query means the teacher dashboard auto-refreshes whenever
// any student's game state changes — no polling needed.
export const getClassroomGames = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const games = await ctx.db
      .query("games")
      .withIndex("by_classroom", q =>
        q.eq("classroomCode", args.code.trim().toUpperCase())
      )
      .collect();

    // Sort: active players first, then completed, then game-over
    return games.sort((a, b) => {
      const rank = (g: typeof a) =>
        g.isGameOver && g.endingType !== "success" ? 2
        : g.isGameOver ? 1
        : 0;
      return rank(a) - rank(b);
    });
  },
});

// ─── Teacher: aggregated class statistics ─────────────────────────────────
export const getClassroomStats = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const games = await ctx.db
      .query("games")
      .withIndex("by_classroom", q =>
        q.eq("classroomCode", args.code.trim().toUpperCase())
      )
      .collect();

    if (games.length === 0) {
      return {
        totalStudents: 0,
        activeStudents: 0,
        completedStudents: 0,
        gameOverStudents: 0,
        avgCreditScore: 0,
        avgMoney: 0,
        avgStress: 0,
        avgHealth: 0,
        mostCommonPersona: null as string | null,
        strugglingCount: 0,   // stress > 70 or money < 100
        bankVisitRate: 0,     // % who made extra bank payment this week
      };
    }

    const active    = games.filter(g => !g.isGameOver);
    const completed = games.filter(g => g.isGameOver && (g.endingType === "success" || g.endingType === "survivor"));
    const gameOver  = games.filter(g => g.isGameOver && g.endingType !== "success" && g.endingType !== "survivor");
    const struggling = games.filter(g => !g.isGameOver && (g.stress > 70 || g.money < 100 || g.health < 40));

    const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

    // Most common persona
    const personaCounts: Record<string, number> = {};
    games.forEach(g => { personaCounts[g.personaId] = (personaCounts[g.personaId] ?? 0) + 1; });
    const mostCommonPersona = Object.entries(personaCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    // Bank visit rate (paidDebt = made extra payment this week)
    const withExtraPayment = games.filter(g => g.weeklyObjectives?.paidDebt).length;
    const bankVisitRate = Math.round((withExtraPayment / games.length) * 100);

    return {
      totalStudents:     games.length,
      activeStudents:    active.length,
      completedStudents: completed.length,
      gameOverStudents:  gameOver.length,
      avgCreditScore:    avg(games.map(g => g.creditScore)),
      avgMoney:          avg(games.map(g => g.money)),
      avgStress:         avg(games.map(g => g.stress)),
      avgHealth:         avg(games.map(g => g.health)),
      mostCommonPersona,
      strugglingCount:   struggling.length,
      bankVisitRate,
    };
  },
});
