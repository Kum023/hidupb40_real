"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Trophy,
  ArrowLeft,
  AlertTriangle,
  MapPin,
  Download,
  RefreshCw,
  Lightbulb,
  Clock,
  Heart,
  Utensils,
  Briefcase,
  CreditCard,
  Activity,
} from "lucide-react";
import { PERSONAS, LOCATIONS } from "@/lib/constants";

interface GlobalStats {
  totalGames: number;
  avgFinalMoney: number;
  avgCreditScore: number;
  successRate: number;
}

interface PersonaStats {
  persona_id: string;
  total_games: number;
  avg_final_money: number;
  avg_credit_score: number;
  avg_weeks_completed: number;
  success_rate: number;
  most_common_ending: string;
}

interface FailurePattern {
  failure_reason: string;
  count: number;
  persona_id: string;
  avg_week_failed: number;
}

interface DecisionAnalytics {
  location: string;
  total_decisions: number;
  avg_money_change: number;
  avg_credit_change: number;
  most_common_choice: string;
}

interface WeeklyProgression {
  week: number;
  total_snapshots: number;
  avg_money: number;
  avg_health: number;
  avg_stress: number;
  objectives_completion_rate: number;
  dropout_count: number;
}

interface KeyInsights {
  totalDecisions: number;
  unhealthyFoodRate: number;
  weekendSkipRate: number;
  avgWeekDropout: number;
  overtimeAcceptRate: number;
  debtPaymentRate: number;
}

interface SurvivalFunnel {
  week: number;
  started: number;
  survived: number;
  survival_rate: number;
}

interface AnalyticsData {
  global: GlobalStats;
  byPersona: PersonaStats[];
  failures: FailurePattern[];
  decisions: DecisionAnalytics[];
  weeklyProgression: WeeklyProgression[];
  keyInsights: KeyInsights;
  survivalFunnel: SurvivalFunnel[];
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/analytics/stats");
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || "Failed to fetch analytics");
      }
    } catch (err) {
      setError("Failed to connect to analytics server");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleExport = (format: "json" | "csv") => {
    window.open(`/api/analytics/export?format=${format}&includeDecisions=true`, "_blank");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-8 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw className="h-8 w-8 text-purple-400" />
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <BarChart3 className="h-8 w-8 text-purple-400" />
            Hidup B40 Analytics
            <BarChart3 className="h-8 w-8 text-purple-400" />
          </h1>
          <p className="text-slate-400">Player Behavior & Financial Literacy Insights</p>
          <p className="text-xs text-purple-400 mt-1">Powered by TiDB</p>
        </motion.div>

        {error ? (
          <Card className="bg-slate-800/50 border-slate-700 mb-6">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
              <p className="text-white mb-2">{error}</p>
              <p className="text-slate-400 text-sm mb-4">
                Make sure TiDB is configured with the correct environment variables.
              </p>
              <Button onClick={fetchAnalytics} variant="outline" className="border-slate-600">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : data ? (
          <>
            {/* Global Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            >
              <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/50">
                <CardContent className="p-6 text-center">
                  <Users className="h-10 w-10 text-blue-400 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-white">{data.global.totalGames}</p>
                  <p className="text-sm text-blue-300">Total Games Played</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 border-emerald-500/50">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-emerald-400">
                    RM {data.global.avgFinalMoney.toLocaleString()}
                  </p>
                  <p className="text-sm text-emerald-300">Avg Final Money</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-600/20 to-amber-800/20 border-amber-500/50">
                <CardContent className="p-6 text-center">
                  <Trophy className="h-10 w-10 text-amber-400 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-amber-400">{data.global.avgCreditScore}</p>
                  <p className="text-sm text-amber-300">Avg Credit Score</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-500/50">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-10 w-10 text-green-400 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-green-400">{data.global.successRate}%</p>
                  <p className="text-sm text-green-300">Success Rate</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Key Insights - Catchy Stats */}
            {data.keyInsights && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mb-8"
              >
                <Card className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-500/50">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-400" />
                      Key Insights from Player Behavior
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                        <Utensils className="h-6 w-6 text-orange-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-orange-400">
                          {data.keyInsights.unhealthyFoodRate}%
                        </p>
                        <p className="text-xs text-slate-400">Chose cheap unhealthy food</p>
                      </div>
                      <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                        <Clock className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-blue-400">
                          {data.keyInsights.weekendSkipRate}%
                        </p>
                        <p className="text-xs text-slate-400">Skipped weekend rest</p>
                      </div>
                      <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                        <Briefcase className="h-6 w-6 text-amber-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-amber-400">
                          {data.keyInsights.overtimeAcceptRate}%
                        </p>
                        <p className="text-xs text-slate-400">Accepted overtime work</p>
                      </div>
                      <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                        <CreditCard className="h-6 w-6 text-green-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-green-400">
                          {data.keyInsights.debtPaymentRate}%
                        </p>
                        <p className="text-xs text-slate-400">Paid debt on Week 4</p>
                      </div>
                      <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                        <TrendingDown className="h-6 w-6 text-red-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-red-400">
                          Week {(Number(data.keyInsights.avgWeekDropout) || 0).toFixed(1)}
                        </p>
                        <p className="text-xs text-slate-400">Avg dropout week</p>
                      </div>
                      <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                        <Activity className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-purple-400">
                          {data.keyInsights.totalDecisions.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-400">Total decisions made</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Survival Funnel */}
            {data.survivalFunnel && data.survivalFunnel.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                className="mb-8"
              >
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Activity className="h-5 w-5 text-cyan-400" />
                      Weekly Survival Funnel
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end justify-between gap-2 h-48">
                      {data.survivalFunnel.map((week, index) => {
                        const maxStarted = Math.max(...data.survivalFunnel.map(w => w.started));
                        const heightPercent = maxStarted > 0 ? (week.started / maxStarted) * 100 : 0;
                        const survivedPercent = week.started > 0 ? (week.survived / week.started) * 100 : 0;

                        return (
                          <div key={week.week} className="flex-1 flex flex-col items-center">
                            <div className="relative w-full flex flex-col items-center">
                              {/* Survived bar */}
                              <div
                                className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg transition-all duration-500 relative"
                                style={{ height: `${(heightPercent * survivedPercent) / 100}px`, minHeight: week.survived > 0 ? '20px' : '0' }}
                              >
                                {week.survived > 0 && (
                                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-emerald-400 font-bold">
                                    {week.survived}
                                  </span>
                                )}
                              </div>
                              {/* Dropout bar */}
                              <div
                                className="w-full bg-gradient-to-t from-red-600 to-red-400 rounded-t-lg transition-all duration-500"
                                style={{ height: `${(heightPercent * (100 - survivedPercent)) / 100}px`, minHeight: (week.started - week.survived) > 0 ? '10px' : '0' }}
                              />
                            </div>
                            <div className="mt-2 text-center">
                              <p className="text-white font-bold">Week {week.week}</p>
                              <p className="text-xs text-slate-400">{week.started} started</p>
                              <p className={`text-xs font-semibold ${week.survival_rate >= 70 ? 'text-emerald-400' : week.survival_rate >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                                {week.survival_rate}% survived
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-slate-700">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-500 rounded" />
                        <span className="text-xs text-slate-400">Survived</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded" />
                        <span className="text-xs text-slate-400">Dropped out</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Weekly Progression Stats */}
            {data.weeklyProgression && data.weeklyProgression.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.19 }}
                className="mb-8"
              >
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-emerald-400" />
                      Weekly Progression Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-700">
                            <th className="text-left py-2 text-slate-400">Week</th>
                            <th className="text-center py-2 text-slate-400">Players</th>
                            <th className="text-center py-2 text-slate-400">Avg Money</th>
                            <th className="text-center py-2 text-slate-400">Avg Health</th>
                            <th className="text-center py-2 text-slate-400">Avg Stress</th>
                            <th className="text-center py-2 text-slate-400">Objectives Done</th>
                            <th className="text-center py-2 text-slate-400">Dropouts</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.weeklyProgression.map((week) => (
                            <tr key={week.week} className="border-b border-slate-800">
                              <td className="py-3 font-bold text-white">Week {week.week}</td>
                              <td className="text-center text-blue-400">{week.total_snapshots}</td>
                              <td className="text-center text-emerald-400">RM {Math.round(week.avg_money).toLocaleString()}</td>
                              <td className="text-center">
                                <span className={week.avg_health >= 70 ? 'text-green-400' : week.avg_health >= 40 ? 'text-amber-400' : 'text-red-400'}>
                                  {Math.round(week.avg_health)}%
                                </span>
                              </td>
                              <td className="text-center">
                                <span className={week.avg_stress <= 40 ? 'text-green-400' : week.avg_stress <= 70 ? 'text-amber-400' : 'text-red-400'}>
                                  {Math.round(week.avg_stress)}%
                                </span>
                              </td>
                              <td className="text-center text-purple-400">{Math.round(week.objectives_completion_rate)}%</td>
                              <td className="text-center text-red-400">{week.dropout_count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Persona Performance */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-slate-800/50 border-slate-700 h-full">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Users className="h-5 w-5 text-purple-400" />
                      Performance by Persona
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {data.byPersona.length === 0 ? (
                      <p className="text-slate-400 text-center py-4">No data yet</p>
                    ) : (
                      data.byPersona.map((stat) => {
                        const persona = PERSONAS[stat.persona_id as keyof typeof PERSONAS];
                        return (
                          <div
                            key={stat.persona_id}
                            className="p-4 bg-slate-900/50 rounded-lg border border-slate-700"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <p className="text-white font-semibold">
                                  {persona?.name || stat.persona_id}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {persona?.location} • {stat.total_games} games
                                </p>
                              </div>
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  stat.success_rate >= 50
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-red-500/20 text-red-400"
                                }`}
                              >
                                {Math.round(stat.success_rate)}% success
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center text-sm">
                              <div>
                                <p className="text-emerald-400 font-bold">
                                  RM {Math.round(stat.avg_final_money).toLocaleString()}
                                </p>
                                <p className="text-xs text-slate-500">Avg Money</p>
                              </div>
                              <div>
                                <p className="text-blue-400 font-bold">
                                  {Math.round(stat.avg_credit_score)}
                                </p>
                                <p className="text-xs text-slate-500">Avg Credit</p>
                              </div>
                              <div>
                                <p className="text-purple-400 font-bold">
                                  {(Number(stat.avg_weeks_completed) || 0).toFixed(1)}
                                </p>
                                <p className="text-xs text-slate-500">Avg Weeks</p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Failure Patterns */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-slate-800/50 border-slate-700 h-full">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                      Common Failure Patterns
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {data.failures.length === 0 ? (
                      <p className="text-slate-400 text-center py-4">No failures recorded yet</p>
                    ) : (
                      data.failures.slice(0, 5).map((failure, index) => {
                        const persona = PERSONAS[failure.persona_id as keyof typeof PERSONAS];
                        return (
                          <div
                            key={`${failure.failure_reason}-${failure.persona_id}`}
                            className="p-3 bg-red-900/20 rounded-lg border border-red-800/50"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-red-300 font-medium">
                                  {failure.failure_reason}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                  {persona?.location || failure.persona_id} • Avg week:{" "}
                                  {(Number(failure.avg_week_failed) || 0).toFixed(1)}
                                </p>
                              </div>
                              <span className="text-red-400 font-bold">{failure.count}×</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Location Decision Analytics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-slate-800/50 border-slate-700 mb-8">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-cyan-400" />
                    Decision Analytics by Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.decisions.length === 0 ? (
                    <p className="text-slate-400 text-center py-4">No decision data yet</p>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {data.decisions.map((loc) => {
                        const location = LOCATIONS[loc.location as keyof typeof LOCATIONS];
                        const isPositive = loc.avg_money_change >= 0;
                        return (
                          <div
                            key={loc.location}
                            className="p-4 bg-slate-900/50 rounded-lg border border-slate-700"
                          >
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-2xl">{location?.icon || "📍"}</span>
                              <div>
                                <p className="text-white font-semibold">
                                  {location?.name || loc.location}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {loc.total_decisions} decisions
                                </p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-400">Avg Money Impact</span>
                                <span
                                  className={`font-bold ${
                                    isPositive ? "text-emerald-400" : "text-red-400"
                                  }`}
                                >
                                  {isPositive ? "+" : ""}RM{" "}
                                  {Math.round(loc.avg_money_change).toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-400">Avg Credit Impact</span>
                                <span
                                  className={`font-bold ${
                                    loc.avg_credit_change >= 0
                                      ? "text-blue-400"
                                      : "text-orange-400"
                                  }`}
                                >
                                  {loc.avg_credit_change >= 0 ? "+" : ""}
                                  {Math.round(loc.avg_credit_change)}
                                </span>
                              </div>
                              {loc.most_common_choice && (
                                <div className="mt-2 pt-2 border-t border-slate-700">
                                  <p className="text-xs text-slate-500">Most common choice:</p>
                                  <p className="text-xs text-cyan-300 truncate">
                                    {loc.most_common_choice}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Export Options */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center gap-4 mb-8"
            >
              <Button
                onClick={() => handleExport("csv")}
                variant="outline"
                className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700 hover:text-white hover:border-slate-500"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button
                onClick={() => handleExport("json")}
                variant="outline"
                className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700 hover:text-white hover:border-slate-500"
              >
                <Download className="h-4 w-4 mr-2" />
                Export JSON
              </Button>
              <Button
                onClick={fetchAnalytics}
                variant="outline"
                className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700 hover:text-white hover:border-slate-500"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </motion.div>
          </>
        ) : null}

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
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
            onClick={() => router.push("/leaderboard")}
          >
            <Trophy className="h-4 w-4 mr-2" />
            Leaderboard
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

