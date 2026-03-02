"use client";

import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Coins, Heart, Brain, TrendingUp, Calendar, Zap } from "lucide-react";
import { EnergyBar } from "./EnergyBar";
import { ObjectivesPanel } from "./ObjectivesPanel";

interface WeeklyObjectives {
  workDaysCompleted: number;
  boughtGroceries: boolean;
  filledPetrol: boolean;
  paidDebt: boolean;
}

interface StatsBarProps {
  money: number;
  debt: number;
  creditScore: number;
  health: number;
  stress: number;
  day: number;
  week: number;
  energyRemaining: number;
  weeklyObjectives: WeeklyObjectives;
  workedToday?: boolean;
}

export function StatsBar({
  money,
  debt,
  creditScore,
  health,
  stress,
  day,
  week,
  energyRemaining,
  weeklyObjectives,
  workedToday,
}: StatsBarProps) {
  const [prevMoney, setPrevMoney] = useState(money);
  const [moneyDiff, setMoneyDiff] = useState(0);
  const [showDiff, setShowDiff] = useState(false);

  useEffect(() => {
    if (money !== prevMoney) {
      setMoneyDiff(money - prevMoney);
      setShowDiff(true);
      setPrevMoney(money);
      const timer = setTimeout(() => setShowDiff(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [money, prevMoney]);

  const getCreditColor = (score: number) => {
    if (score >= 700) return "text-emerald-400 neon-green";
    if (score >= 650) return "text-green-400";
    if (score >= 600) return "text-yellow-400 neon-yellow";
    if (score >= 550) return "text-orange-400";
    return "text-red-400 neon-red animate-pulse";
  };

  const getMoneyClass = () => {
    if (money < 50) return "text-red-500 neon-red animate-stress-shake";
    if (money < 100) return "text-red-400 animate-pulse";
    if (money < 200) return "text-orange-400";
    return "text-emerald-400 neon-green";
  };

  const getHealthClass = () => {
    if (health < 20) return "animate-danger-pulse";
    if (health < 40) return "animate-pulse";
    return "";
  };

  const getStressClass = () => {
    if (stress > 80) return "animate-stress-shake";
    if (stress > 60) return "animate-pulse";
    return "";
  };

  return (
    <div className={`relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-xl p-4 space-y-3 border-2 ${
      stress > 70 || health < 30 ? "border-red-500/50 animate-rainbow-border" : "border-cyan-500/30"
    } overflow-hidden`}>
      {/* Scanline overlay */}
      <div className="absolute inset-0 scanlines opacity-30 pointer-events-none" />

      {/* Top row - Time and Energy */}
      <div className="flex justify-between items-center text-sm relative">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span className="font-mono text-cyan-300">
            WEEK <span className="text-white font-bold text-lg">{week}</span>
            <span className="text-slate-500 mx-1">/</span>
            <span className="text-slate-400">4</span>
            <span className="text-slate-500 mx-2">|</span>
            DAY <span className="text-white font-bold text-lg">{day}</span>
            <span className="text-slate-500 mx-1">/</span>
            <span className="text-slate-400">5</span>
          </span>
        </div>
        <EnergyBar energy={energyRemaining} maxEnergy={11} />
      </div>

      {/* Objectives Panel */}
      <ObjectivesPanel
        objectives={weeklyObjectives}
        currentWeek={week}
        currentDay={day}
        energy={energyRemaining}
        workedToday={workedToday}
      />

      {/* Money and Debt Row */}
      <div className="grid grid-cols-2 gap-4 relative">
        <div className="bg-slate-800/80 rounded-lg p-3 border border-emerald-500/30">
          <div className="flex items-center gap-2 mb-1">
            <motion.div
              animate={{ rotateY: showDiff ? 360 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <Coins className="w-5 h-5 text-yellow-400" />
            </motion.div>
            <span className="text-xs text-slate-400 uppercase tracking-wider">Cash</span>
          </div>
          <div className="relative">
            <motion.span
              key={money}
              initial={{ scale: 1.5, color: moneyDiff >= 0 ? "#00ff88" : "#ff4444" }}
              animate={{ scale: 1, color: money < 100 ? "#ff4444" : "#00ff88" }}
              className={`text-2xl font-bold font-mono ${getMoneyClass()}`}
            >
              RM {money.toLocaleString()}
            </motion.span>
            <AnimatePresence>
              {showDiff && (
                <motion.span
                  initial={{ opacity: 1, y: 0 }}
                  animate={{ opacity: 0, y: -20 }}
                  exit={{ opacity: 0 }}
                  className={`absolute -top-4 right-0 text-sm font-bold ${
                    moneyDiff >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {moneyDiff >= 0 ? "+" : ""}{moneyDiff}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="bg-slate-800/80 rounded-lg p-3 border border-red-500/30">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-red-400 text-lg">💀</span>
            <span className="text-xs text-slate-400 uppercase tracking-wider">Debt</span>
          </div>
          <span className="text-2xl font-bold font-mono text-red-400">
            RM {debt.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Credit Score */}
      <div className="bg-slate-800/80 rounded-lg p-3 border border-purple-500/30">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <span className="text-xs text-slate-400 uppercase tracking-wider">Credit Score</span>
          </div>
          <motion.span
            key={creditScore}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            className={`text-xl font-bold font-mono ${getCreditColor(creditScore)}`}
          >
            {creditScore}
          </motion.span>
        </div>
        <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              background: creditScore >= 700
                ? "linear-gradient(90deg, #00ff88, #00ffcc)"
                : creditScore >= 600
                  ? "linear-gradient(90deg, #ffff00, #ff8800)"
                  : "linear-gradient(90deg, #ff4444, #ff0000)",
              boxShadow: "0 0 10px currentColor",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${((creditScore - 300) / 550) * 100}%` }}
            transition={{ type: "spring", stiffness: 100 }}
          />
          {/* Score markers */}
          <div className="absolute inset-0 flex justify-between px-1">
            {[300, 450, 600, 750, 850].map((mark, i) => (
              <div key={mark} className="w-px h-full bg-slate-600" style={{ left: `${((mark - 300) / 550) * 100}%` }} />
            ))}
          </div>
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1 font-mono">
          <span>POOR</span>
          <span>FAIR</span>
          <span>GOOD</span>
          <span>EXCELLENT</span>
        </div>
      </div>

      {/* Health and Stress */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`bg-slate-800/80 rounded-lg p-3 border border-pink-500/30 ${getHealthClass()}`}>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Heart className={`w-5 h-5 ${health < 30 ? "text-red-500 animate-pulse" : "text-pink-400"}`} />
              <span className="text-xs text-slate-400 uppercase tracking-wider">Health</span>
            </div>
            <span className={`font-bold font-mono ${health < 30 ? "text-red-500 neon-red" : health < 50 ? "text-orange-400" : "text-pink-400"}`}>
              {health}%
            </span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: health < 30
                  ? "linear-gradient(90deg, #ff0000, #ff4444)"
                  : "linear-gradient(90deg, #ff69b4, #ff1493)",
                boxShadow: health < 30 ? "0 0 10px #ff0000" : "none",
              }}
              animate={{ width: `${health}%` }}
              transition={{ type: "spring", stiffness: 100 }}
            />
          </div>
        </div>

        <div className={`bg-slate-800/80 rounded-lg p-3 border border-orange-500/30 ${getStressClass()}`}>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Brain className={`w-5 h-5 ${stress > 70 ? "text-red-500 animate-pulse" : "text-orange-400"}`} />
              <span className="text-xs text-slate-400 uppercase tracking-wider">Stress</span>
            </div>
            <span className={`font-bold font-mono ${stress > 70 ? "text-red-500 neon-red" : stress > 50 ? "text-orange-400" : "text-green-400"}`}>
              {stress}%
            </span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: stress > 70
                  ? "linear-gradient(90deg, #ff4444, #ff0000)"
                  : "linear-gradient(90deg, #ffa500, #ff6600)",
                boxShadow: stress > 70 ? "0 0 10px #ff0000" : "none",
              }}
              animate={{ width: `${stress}%` }}
              transition={{ type: "spring", stiffness: 100 }}
            />
          </div>
        </div>
      </div>

      {/* Warning messages */}
      <AnimatePresence>
        {(health < 30 || stress > 70 || money < 50) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-900/50 border border-red-500 rounded-lg p-2 text-center"
          >
            <span className="text-red-400 text-sm font-bold animate-pulse">
              {health < 30 ? "CRITICAL HEALTH!" : stress > 70 ? "BURNOUT WARNING!" : "BROKE!"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
