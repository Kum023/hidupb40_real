"use client";

import { Trophy } from "lucide-react";
import { LeaderboardDialog } from "./LeaderboardDialog";
import { Button } from "./ui/button";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800">
      <div className="max-w-4xl mx-auto px-4 h-12 flex items-center justify-between">
        <div className="text-sm font-bold text-white">
          Hidup B40
        </div>

        <LeaderboardDialog>
          <Button
            variant="ghost"
            size="sm"
            className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 gap-2"
          >
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">Leaderboard</span>
          </Button>
        </LeaderboardDialog>
      </div>
    </header>
  );
}
