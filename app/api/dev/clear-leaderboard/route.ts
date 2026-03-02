import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { NextResponse } from "next/server";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET() {
  try {
    const result = await convex.mutation(api.leaderboard.clearLeaderboard);
    return NextResponse.json({
      success: true,
      message: `Cleared ${result.deleted} leaderboard entries`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to clear leaderboard", details: String(error) },
      { status: 500 }
    );
  }
}
