"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trophy, Medal, Award } from "lucide-react";
import { PERSONAS } from "@/lib/constants";
import { useState, Component, type ReactNode } from "react";

interface LeaderboardDialogProps {
  children: React.ReactNode;
}

type ScoreEntry = {
  _id: string;
  playerName: string;
  personaId: string;
  score: number;
  weeksCompleted: number;
  endingType: string;
};

class LeaderboardErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError = () => ({ hasError: true });
  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-8 text-slate-400 text-sm px-4">
          Leaderboard unavailable. Run <code className="bg-slate-800 px-1 rounded">npx convex dev</code> to sync the backend.
        </div>
      );
    }
    return this.props.children;
  }
}

function LeaderboardContent({ selectedPersona, setSelectedPersona }: { selectedPersona: string; setSelectedPersona: (s: string) => void }) {
  const topScores = useQuery(api.leaderboard.getTopScores);
  return (
    <>
      <div className="flex gap-1 justify-center mb-2">
        <button
          onClick={() => setSelectedPersona("all")}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            selectedPersona === "all"
              ? "bg-emerald-600 text-white"
              : "bg-slate-800 text-slate-400 hover:bg-slate-700"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setSelectedPersona("freshGrad")}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            selectedPersona === "freshGrad"
              ? "bg-cyan-600 text-white"
              : "bg-slate-800 text-slate-400 hover:bg-slate-700"
          }`}
        >
          Kuala Lumpur
        </button>
        <button
          onClick={() => setSelectedPersona("singleParent")}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            selectedPersona === "singleParent"
              ? "bg-teal-600 text-white"
              : "bg-slate-800 text-slate-400 hover:bg-slate-700"
          }`}
        >
          Penang
        </button>
      </div>
      <div className="text-center text-xs text-slate-500 mb-2">
        Top 10 by Cash in Hand
      </div>
      <div className="space-y-2 overflow-y-auto flex-1 pr-1">
        {topScores === undefined ? (
          <div className="text-center py-8 text-slate-400">Loading...</div>
        ) : (() => {
          const filteredScores = topScores.filter((score: ScoreEntry) =>
            selectedPersona === "all" || score.personaId === selectedPersona
          );
          return filteredScores.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              No scores yet. Be the first to play!
            </div>
          ) : (
            filteredScores.slice(0, 10).map((score: ScoreEntry, index: number) => {
              const persona = PERSONAS[score.personaId as keyof typeof PERSONAS];
              return (
                <div
                  key={score._id}
                  className={`p-3 rounded-lg border ${getRankBg(index + 1)}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {getRankIcon(index + 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold truncate text-sm">
                          {score.playerName}
                        </span>
                        {selectedPersona === "all" && (
                          <span className="text-[10px] text-slate-500 bg-slate-700/50 px-1.5 py-0.5 rounded">
                            {persona?.location || score.personaId}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Week {score.weeksCompleted}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-emerald-400 font-bold text-sm">
                        RM {score.score.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          );
        })()}
      </div>
    </>
  );
}

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Trophy className="h-5 w-5 text-yellow-400" />;
    case 2:
      return <Medal className="h-5 w-5 text-gray-300" />;
    case 3:
      return <Award className="h-5 w-5 text-amber-600" />;
    default:
      return <span className="w-5 h-5 flex items-center justify-center text-slate-400 font-bold text-sm">{rank}</span>;
  }
}

function getRankBg(rank: number) {
  switch (rank) {
    case 1:
      return "bg-gradient-to-r from-yellow-600/20 to-amber-600/20 border-yellow-500/30";
    case 2:
      return "bg-gradient-to-r from-gray-500/20 to-slate-500/20 border-gray-400/30";
    case 3:
      return "bg-gradient-to-r from-amber-700/20 to-orange-700/20 border-amber-600/30";
    default:
      return "bg-slate-800/50 border-slate-700/50";
  }
}

export function LeaderboardDialog({ children }: LeaderboardDialogProps) {
  const [selectedPersona, setSelectedPersona] = useState<string | "all">("all");
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2 text-xl">
            <Trophy className="h-6 w-6 text-yellow-400" />
            Leaderboard
            <Trophy className="h-6 w-6 text-yellow-400" />
          </DialogTitle>
        </DialogHeader>
        <LeaderboardErrorBoundary>
          {open ? (
            <LeaderboardContent
              selectedPersona={selectedPersona}
              setSelectedPersona={setSelectedPersona}
            />
          ) : null}
        </LeaderboardErrorBoundary>
      </DialogContent>
    </Dialog>
  );
}
