"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Users, Copy, RefreshCw, TrendingUp, TrendingDown,
  Heart, Brain, Coins, CreditCard, AlertTriangle,
  CheckCircle2, XCircle, Loader2, ArrowLeft,
  GraduationCap, BarChart3,
} from "lucide-react";

const PERSONA_LABELS: Record<string, { name: string; emoji: string; shortName: string }> = {
  fresh_grad:      { name: "Fresh Grad KL",        emoji: "🎓", shortName: "Grad" },
  single_parent:   { name: "Single Parent Penang",  emoji: "👩‍👧", shortName: "Parent" },
  factory_worker:  { name: "Pekerja Kilang JB",     emoji: "🏭", shortName: "Factory" },
};

const CREDIT_BAND = (score: number) =>
  score >= 750 ? { label: "Excellent", colour: "text-emerald-400" }
  : score >= 700 ? { label: "Good",    colour: "text-lime-400" }
  : score >= 650 ? { label: "Fair",    colour: "text-yellow-400" }
  : score >= 550 ? { label: "Poor",    colour: "text-orange-400" }
  :                { label: "Bad",     colour: "text-red-400" };

const STATUS = (game: { isGameOver: boolean; endingType?: string; stress: number; money: number; health: number }) => {
  if (game.isGameOver) {
    const good = game.endingType === "success" || game.endingType === "survivor";
    return good
      ? { label: "Completed ✓",  colour: "bg-emerald-900/40 text-emerald-300 border-emerald-500/40" }
      : { label: "Game Over 💀", colour: "bg-red-900/40 text-red-300 border-red-500/40" };
  }
  if (game.stress > 70 || game.money < 100 || game.health < 40) {
    return { label: "⚠ Struggling", colour: "bg-amber-900/40 text-amber-300 border-amber-500/40" };
  }
  return { label: "▶ Playing",    colour: "bg-cyan-900/40 text-cyan-300 border-cyan-500/40" };
};

// ─── Stat Pill ───────────────────────────────────────────────────────────────
function StatPill({ label, value, colour, icon: Icon }: {
  label: string; value: string | number; colour: string; icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/40 rounded-lg px-3 py-2 text-center">
      <Icon className={`w-4 h-4 mx-auto mb-0.5 ${colour}`} />
      <p className={`text-lg font-bold font-mono ${colour}`}>{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

// ─── Student Card ────────────────────────────────────────────────────────────
function StudentCard({ game }: { game: Record<string, unknown> }) {
  const g = game as {
    _id: string; playerName?: string; personaId: string; currentWeek: number;
    money: number; debt: number; creditScore: number; health: number;
    stress: number; isGameOver: boolean; endingType?: string;
    weeklyObjectives?: { paidDebt?: boolean };
  };

  const persona = PERSONA_LABELS[g.personaId] ?? { name: g.personaId, emoji: "👤", shortName: "Player" };
  const status  = STATUS(g);
  const credit  = CREDIT_BAND(g.creditScore);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-4 ${
        g.isGameOver ? "bg-slate-800/50 opacity-80" : "bg-slate-800/80"
      } border-slate-700/50`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{persona.emoji}</span>
          <div>
            <p className="text-sm font-bold text-white leading-tight">
              {g.playerName || "Anonymous"}
            </p>
            <p className="text-xs text-slate-500">{persona.name}</p>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-xs px-2 py-1 rounded-full border font-medium ${status.colour}`}>
            {status.label}
          </span>
          <p className="text-xs text-slate-600 mt-0.5">Week {g.currentWeek}/4</p>
        </div>
      </div>

      {/* Stat bars */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <div className="flex justify-between text-xs mb-0.5">
            <span className="text-slate-500">Health</span>
            <span className={g.health < 40 ? "text-red-400" : "text-pink-400"}>{g.health}%</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${g.health > 60 ? "bg-pink-500" : g.health > 30 ? "bg-orange-500" : "bg-red-500"}`}
              style={{ width: `${g.health}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-0.5">
            <span className="text-slate-500">Stress</span>
            <span className={g.stress > 70 ? "text-red-400" : "text-orange-400"}>{g.stress}%</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${g.stress < 50 ? "bg-orange-400" : g.stress < 75 ? "bg-amber-500" : "bg-red-500"}`}
              style={{ width: `${g.stress}%` }} />
          </div>
        </div>
      </div>

      {/* Money + Credit row */}
      <div className="flex items-center justify-between text-xs">
        <span className={`font-mono font-bold ${g.money < 100 ? "text-red-400" : "text-emerald-400"}`}>
          💵 RM {g.money.toLocaleString()}
        </span>
        <span className={`font-mono font-bold ${credit.colour}`}>
          🎯 {g.creditScore} <span className="font-normal opacity-70">({credit.label})</span>
        </span>
        {g.weeklyObjectives?.paidDebt && (
          <span title="Made extra bank payment this week" className="text-purple-400 text-xs">🏦 +20</span>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function ClassroomDashboardPage() {
  const params  = useParams();
  const router  = useRouter();
  const code    = (params.code as string).toUpperCase();
  const [copied, setCopied] = useState(false);

  const classroom = useQuery(api.classroom.getClassroom,      { code });
  const games     = useQuery(api.classroom.getClassroomGames, { code });
  const stats     = useQuery(api.classroom.getClassroomStats, { code });

  const joinLink = typeof window !== "undefined" ? `${window.location.origin}/join/${code}` : `/join/${code}`;

  const copyLink = () => {
    navigator.clipboard.writeText(joinLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Loading state
  if (classroom === undefined || games === undefined || stats === undefined) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  // Not found
  if (!classroom) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
        <XCircle className="w-12 h-12 text-red-400" />
        <p className="text-white text-xl font-bold">Classroom Not Found</p>
        <p className="text-slate-400">Code: <span className="font-mono text-red-300">{code}</span></p>
        <button onClick={() => router.push("/classroom")} className="mt-4 px-6 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors">
          Back
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950 p-6">
      <div className="max-w-6xl mx-auto">

        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/classroom")}
              className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <GraduationCap className="w-6 h-6 text-emerald-400" />
                <h1 className="text-2xl font-bold text-white">{classroom.teacherName}&apos;s Class</h1>
              </div>
              {classroom.subject && (
                <p className="text-slate-400 text-sm ml-9">{classroom.subject}</p>
              )}
              {classroom.institution && (
                <p className="text-slate-500 text-xs ml-9">{classroom.institution}</p>
              )}
            </div>
          </div>

          {/* Live indicator + code */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </div>
            <div className="bg-slate-800 border border-emerald-500/40 rounded-xl px-5 py-3 text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Class Code</p>
              <p className="text-3xl font-mono font-bold text-emerald-400 tracking-widest">{code}</p>
            </div>
            <button onClick={copyLink}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white text-sm transition-colors">
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </div>

        {/* ── Summary Stats ── */}
        {stats && stats.totalStudents > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6"
          >
            <StatPill label="Students"   value={stats.totalStudents}     colour="text-white"       icon={Users} />
            <StatPill label="Playing"    value={stats.activeStudents}    colour="text-cyan-400"    icon={RefreshCw} />
            <StatPill label="Completed"  value={stats.completedStudents} colour="text-emerald-400" icon={CheckCircle2} />
            <StatPill label="Game Over"  value={stats.gameOverStudents}  colour="text-red-400"     icon={XCircle} />
            <StatPill label="Avg Credit" value={stats.avgCreditScore}    colour="text-purple-400"  icon={CreditCard} />
            <StatPill label="Avg Cash"   value={`RM${stats.avgMoney}`}   colour="text-emerald-400" icon={Coins} />
            <StatPill label="Avg Stress" value={`${stats.avgStress}%`}   colour={stats.avgStress > 65 ? "text-red-400" : "text-orange-400"} icon={Brain} />
            <StatPill label="Struggling" value={stats.strugglingCount}   colour={stats.strugglingCount > 0 ? "text-amber-400" : "text-slate-500"} icon={AlertTriangle} />
          </motion.div>
        )}

        {/* ── Teacher Insight Bar ── */}
        {stats && stats.totalStudents > 0 && (
          <div className="grid md:grid-cols-3 gap-3 mb-6">
            {/* Most common persona */}
            <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Most Chosen Persona</p>
              <p className="text-white font-bold text-lg">
                {stats.mostCommonPersona
                  ? `${PERSONA_LABELS[stats.mostCommonPersona]?.emoji} ${PERSONA_LABELS[stats.mostCommonPersona]?.name}`
                  : "—"}
              </p>
            </div>

            {/* Bank visit rate */}
            <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Extra Bank Payment This Week</p>
              <div className="flex items-end gap-2">
                <p className={`font-bold text-3xl font-mono ${stats.bankVisitRate > 50 ? "text-emerald-400" : "text-amber-400"}`}>
                  {stats.bankVisitRate}%
                </p>
                <p className="text-xs text-slate-500 mb-1">of class</p>
              </div>
              <p className="text-xs text-slate-500">+20 credit = key behaviour to teach</p>
            </div>

            {/* Common mistake */}
            <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl p-4">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Class Health</p>
              <div className="flex items-center gap-2">
                <Heart className={`w-5 h-5 ${stats.avgHealth < 60 ? "text-red-400 animate-pulse" : "text-pink-400"}`} />
                <p className={`text-2xl font-bold font-mono ${stats.avgHealth < 60 ? "text-red-400" : "text-pink-400"}`}>
                  {stats.avgHealth}%
                </p>
              </div>
              {stats.avgHealth < 60 && (
                <p className="text-xs text-amber-400 mt-1">⚠ Class is overworked — discuss rest vs productivity</p>
              )}
            </div>
          </div>
        )}

        {/* ── Student Grid ── */}
        {!games || games.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 border-2 border-dashed border-slate-700 rounded-2xl"
          >
            <div className="text-6xl mb-4">📡</div>
            <h2 className="text-xl font-bold text-white mb-2">Waiting for students to join…</h2>
            <p className="text-slate-400 mb-6">Share the code or link with your class</p>
            <div className="inline-flex items-center gap-3 bg-slate-800 rounded-xl px-6 py-4 border border-slate-700">
              <p className="text-4xl font-mono font-bold text-emerald-400 tracking-widest">{code}</p>
              <button onClick={copyLink} className="text-slate-400 hover:text-white transition-colors">
                <Copy className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-4">Students go to: <span className="font-mono">{joinLink}</span></p>
          </motion.div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-slate-400" />
              <h2 className="text-lg font-bold text-white">
                Live Student Progress
                <span className="ml-2 text-sm font-normal text-slate-400">({games.length} students)</span>
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              <AnimatePresence>
                {games.map(game => (
                  <StudentCard key={game._id} game={game as unknown as Record<string, unknown>} />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* ── Discussion Prompts ── */}
        {stats && stats.totalStudents >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 bg-slate-800/50 border border-cyan-500/20 rounded-2xl p-5"
          >
            <h3 className="text-base font-bold text-cyan-400 mb-3">💬 Suggested Discussion Questions</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              {stats.bankVisitRate < 30 && (
                <li>• Only <strong className="text-amber-300">{stats.bankVisitRate}%</strong> of the class made an extra bank payment. Why do you think most people avoid paying extra debt? What stops them in real life?</li>
              )}
              {stats.avgStress > 65 && (
                <li>• The class average stress is <strong className="text-red-300">{stats.avgStress}%</strong>. What decisions led to this? What does burnout cost financially (medical bills, missed work)?</li>
              )}
              {stats.avgCreditScore < 640 && (
                <li>• Average credit score is <strong className="text-orange-300">{stats.avgCreditScore}</strong> (Poor range). What real-life consequences does this have for renting, car loans, or mortgages?</li>
              )}
              <li>• Which persona was the hardest to play? Why does income level alone not determine financial success?</li>
              <li>• If you could replay the game with one different strategy, what would you change?</li>
            </ul>
          </motion.div>
        )}

      </div>
    </main>
  );
}
