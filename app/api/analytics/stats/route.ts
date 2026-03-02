import { NextResponse } from "next/server";
import {
  getGlobalStats,
  getPersonaStats,
  getFailurePatterns,
  getDecisionAnalytics,
  getWeeklyProgression,
  getKeyInsights,
  getSurvivalFunnel,
} from "@/lib/tidb";

// GET /api/analytics/stats
// Returns global statistics and analytics from TiDB
export async function GET() {
  try {
    // Fetch all analytics data in parallel
    const [
      globalStats,
      personaStats,
      failurePatterns,
      decisionAnalytics,
      weeklyProgression,
      keyInsights,
      survivalFunnel,
    ] = await Promise.all([
      getGlobalStats(),
      getPersonaStats(),
      getFailurePatterns(),
      getDecisionAnalytics(),
      getWeeklyProgression(),
      getKeyInsights(),
      getSurvivalFunnel(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        global: globalStats,
        byPersona: personaStats,
        failures: failurePatterns,
        decisions: decisionAnalytics,
        weeklyProgression,
        keyInsights,
        survivalFunnel,
      },
    });
  } catch (error) {
    console.error("Analytics stats error:", error);

    // Return empty data structure if TiDB is not configured
    if (String(error).includes("environment variables not configured")) {
      return NextResponse.json({
        success: false,
        error: "TiDB not configured",
        data: {
          global: {
            totalGames: 0,
            avgFinalMoney: 0,
            avgCreditScore: 0,
            successRate: 0,
          },
          byPersona: [],
          failures: [],
          decisions: [],
          weeklyProgression: [],
          keyInsights: {
            totalDecisions: 0,
            unhealthyFoodRate: 0,
            weekendSkipRate: 0,
            avgWeekDropout: 0,
            overtimeAcceptRate: 0,
            debtPaymentRate: 0,
          },
          survivalFunnel: [],
        },
      });
    }

    return NextResponse.json(
      { error: "Failed to fetch analytics", details: String(error) },
      { status: 500 }
    );
  }
}

