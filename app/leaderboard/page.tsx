"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Trophy, Medal, Award, ArrowLeft, TrendingUp, Users, BarChart3, Download } from "lucide-react";
import { PERSONAS } from "@/lib/constants";
import { useState, useEffect } from "react";

interface TiDBStats {
  totalPlayers: number;
  avgScore: number;
  topScore: number;
  personaBreakdown: Array<{
    persona: string;
    count: number;
    avgMoney: number;
    avgCredit: number;
    successRate: number;
  }>;
}

interface TiDBLeaderboardEntry {
  rank: number;
  playerName: string;
  persona: string;
  money: number;
  creditScore: number;
  weeksCompleted: number;
  endingType: string;
  date: string;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const topScores = useQuery(api.leaderboard.getTopScores);
  const [tidbStats, setTidbStats] = useState<TiDBStats | null>(null);
  const [tidbLeaderboard, setTidbLeaderboard] = useState<TiDBLeaderboardEntry[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);

  // Fetch TiDB analytics
  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch("/api/analytics/leaderboard");
        const data = await response.json();
        if (data.success) {
          setTidbStats(data.stats);
          setTidbLeaderboard(data.leaderboard);
        }
      } catch (error) {
        console.log("TiDB analytics not available:", error);
      }
    }
    fetchAnalytics();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-300" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-slate-400 font-bold">{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-600/20 to-amber-600/20 border-yellow-500/50";
      case 2:
        return "bg-gradient-to-r from-gray-500/20 to-slate-500/20 border-gray-400/50";
      case 3:
        return "bg-gradient-to-r from-amber-700/20 to-orange-700/20 border-amber-600/50";
      default:
        return "bg-slate-800/50 border-slate-700";
    }
  };

  const handleExport = async () => {
    window.open("/api/analytics/export?format=csv", "_blank");
  };

  // Filter leaderboard by persona if selected
  const filteredLeaderboard = selectedPersona
    ? tidbLeaderboard.filter((entry) => entry.persona === selectedPersona)
    : tidbLeaderboard;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Trophy className="h-8 w-8 text-yellow-400" />
            Leaderboard
            <Trophy className="h-8 w-8 text-yellow-400" />
          </h1>
          <p className="text-slate-400">Top Players by Cash in Hand</p>
        </motion.div>

        {/* Analytics Toggle */}
        <div className="flex justify-center mb-6 gap-2">
          <Button
            variant={!showAnalytics ? "default" : "outline"}
            onClick={() => setShowAnalytics(false)}
            className={!showAnalytics ? "bg-emerald-600 text-white" : "bg-slate-800 border-slate-600 text-white hover:bg-slate-700"}
          >
            <Trophy className="h-4 w-4 mr-2" />
            Leaderboard
          </Button>
          <Button
            variant={showAnalytics ? "default" : "outline"}
            onClick={() => setShowAnalytics(true)}
            className={showAnalytics ? "bg-purple-600 text-white" : "bg-slate-800 border-slate-600 text-white hover:bg-slate-700"}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        </div>

        {showAnalytics ? (
          /* Analytics View */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Global Stats Cards */}
            {tidbStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4 text-center">
                    <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{tidbStats.totalPlayers}</p>
                    <p className="text-xs text-slate-400">Total Players</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-emerald-400">RM {tidbStats.avgScore.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">Avg Final Money</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4 text-center">
                    <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-yellow-400">RM {tidbStats.topScore.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">Top Score</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4 text-center">
                    <BarChart3 className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-400">
                      {tidbStats.personaBreakdown.length}
                    </p>
                    <p className="text-xs text-slate-400">Personas Played</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Persona Breakdown */}
            {tidbStats && tidbStats.personaBreakdown.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Performance by Persona</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tidbStats.personaBreakdown.map((stat) => {
                    const persona = PERSONAS[stat.persona as keyof typeof PERSONAS];
                    return (
                      <div key={stat.persona} className="p-4 bg-slate-900/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-semibold">
                            {persona?.name || stat.persona}
                          </span>
                          <span className="text-slate-400 text-sm">{stat.count} games</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-emerald-400 font-bold">RM {stat.avgMoney.toLocaleString()}</p>
                            <p className="text-xs text-slate-500">Avg Money</p>
                          </div>
                          <div>
                            <p className="text-blue-400 font-bold">{stat.avgCredit}</p>
                            <p className="text-xs text-slate-500">Avg Credit</p>
                          </div>
                          <div>
                            <p className="text-green-400 font-bold">{stat.successRate}%</p>
                            <p className="text-xs text-slate-500">Success Rate</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Export Button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={handleExport}
                className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700 hover:text-white hover:border-slate-500"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Research Data (CSV)
              </Button>
            </div>

            {!tidbStats && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-8 text-center text-slate-400">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Analytics powered by TiDB</p>
                  <p className="text-sm mt-2">Configure TiDB to see detailed statistics</p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        ) : (
          /* Leaderboard View */
          <>
            {/* Persona Filter */}
            {tidbLeaderboard.length > 0 && (
              <div className="flex gap-2 mb-4 flex-wrap justify-center">
                <Button
                  variant={selectedPersona === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPersona(null)}
                  className={selectedPersona === null ? "bg-emerald-600 text-white" : "bg-slate-800 border-slate-600 text-white hover:bg-slate-700"}
                >
                  All
                </Button>
                {Object.entries(PERSONAS).map(([id, persona]) => (
                  <Button
                    key={id}
                    variant={selectedPersona === id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPersona(id)}
                    className={selectedPersona === id ? "bg-emerald-600 text-white" : "bg-slate-800 border-slate-600 text-white hover:bg-slate-700"}
                  >
                    {persona.location}
                  </Button>
                ))}
              </div>
            )}

            <Card className="bg-slate-800/50 border-slate-700 mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-lg flex items-center justify-between">
                  <span>Top Scores</span>
                  <span className="text-sm text-slate-400 font-normal">Score = Final Cash</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topScores === undefined ? (
                  <div className="text-center py-8 text-slate-400">Loading...</div>
                ) : topScores.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    No scores yet. Be the first to play!
                  </div>
                ) : (
                  topScores.map((score: { _id: string; playerName: string; personaId: string; score: number; weeksCompleted: number; endingType: string }, index: number) => {
                    const persona = PERSONAS[score.personaId as keyof typeof PERSONAS];
                    
                    // Skip if filtering by persona and doesn't match
                    if (selectedPersona && score.personaId !== selectedPersona) {
                      return null;
                    }

                    return (
                      <motion.div
                        key={score._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-lg border ${getRankBg(index + 1)}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0">
                            {getRankIcon(index + 1)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-bold truncate">
                                {score.playerName}
                              </span>
                              <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-0.5 rounded">
                                {persona?.location || score.personaId}
                              </span>
                            </div>
                            <div className="text-xs text-slate-400">
                              Week {score.weeksCompleted} - {score.endingType}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-emerald-400 font-bold">
                              RM {score.score.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center gap-4"
        >
          <Button
            variant="outline"
            className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700 hover:text-white hover:border-slate-500"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Home
          </Button>
          <Button
            variant="outline"
            className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700 hover:text-white hover:border-slate-500"
            onClick={() => router.push("/analytics")}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Full Analytics
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => router.push("/setup")}
          >
            Play Game
          </Button>
        </motion.div>
      </div>
    </main>
  );
}
