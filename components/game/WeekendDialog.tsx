"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sun, Coffee, Coins, Brain, Heart, AlertTriangle, TrendingDown, TrendingUp, Banknote } from "lucide-react";
import { useT } from "@/lib/translations";

interface WeekendActivity {
  id: string;
  name: string;
  description: string;
  locationId?: string;
  moneyCost: number;
  stressChange: number;
  healthChange?: number;
}

interface PaydaySummary {
  weeklySalary: number;
  weeklyRent: number;
  weeklyDebtMin: number;
  debtLabel: string;
  hasDebt: boolean;
  currentDebt: number;
}

interface WeekendDialogProps {
  isOpen: boolean;
  personaId: string;
  activities: WeekendActivity[];
  skipActivity: {
    id: string;
    name: string;
    description: string;
    moneyCost: number;
    stressChange: number;
    healthChange: number;
  };
  currentMoney: number;
  currentWeek: number;
  paydaySummary?: PaydaySummary;
  onSelectActivity: (activity: WeekendActivity) => void;
}

export function WeekendDialog({
  isOpen,
  personaId,
  activities,
  skipActivity,
  currentMoney,
  currentWeek,
  paydaySummary,
  onSelectActivity,
}: WeekendDialogProps) {
  const t = useT();
  const isFinalWeek = currentWeek === 4;

  const netAfterAutoDebits = paydaySummary
    ? paydaySummary.weeklySalary - paydaySummary.weeklyRent - (paydaySummary.hasDebt ? paydaySummary.weeklyDebtMin : 0)
    : null;

  // Week-to-week difficulty transition warnings
  const weekTransitionWarning = (() => {
    if (!paydaySummary || !paydaySummary.hasDebt) return null;
    const full = paydaySummary.weeklyDebtMin;
    const weekScales: Record<number, number> = { 1: 0.33, 2: 0.67, 3: 1.0, 4: 1.0 };
    const thisWeekMin  = Math.round(full * (weekScales[currentWeek]  ?? 1.0));
    const nextWeekMin  = Math.round(full * (weekScales[currentWeek + 1] ?? 1.0));
    if (currentWeek === 1) return {
      colour: "border-yellow-500/50 bg-yellow-900/30",
      icon: "📈",
      text: `Your ${paydaySummary.debtLabel} instalment increases from RM ${thisWeekMin} → RM ${nextWeekMin}/week starting Week 2. Budget accordingly!`,
    };
    if (currentWeek === 2) return {
      colour: "border-red-500/50 bg-red-900/30",
      icon: "⚠️",
      text: `FULL instalment kicks in from Week 3 — RM ${nextWeekMin}/week. Random events also get harder. Boost your savings now!`,
    };
    if (currentWeek === 3) return {
      colour: "border-purple-500/50 bg-purple-900/30",
      icon: "🏁",
      text: `Final week! Maximum financial pressure. Your decisions this weekend lock in your ending.`,
    };
    return null;
  })();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-br from-cyan-900 via-slate-900 to-purple-950 rounded-xl p-6 max-w-lg w-full border-2 border-cyan-500/50 shadow-2xl my-4"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-cyan-500/20">
                <Sun className="w-8 h-8 text-yellow-400" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-cyan-400">
                  {t("weekComplete", { w: String(currentWeek) })}
                </p>
                <h2 className="text-xl font-bold text-white">{t("weekendPayday")}</h2>
              </div>
            </div>

            {/* ── Payday Summary ── */}
            {paydaySummary && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800/80 rounded-xl p-4 border border-emerald-500/30 mb-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Banknote className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    {t("paySlip")}
                  </span>
                </div>

                <div className="space-y-1.5 text-sm font-mono">
                  {/* Salary */}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">{t("salary")}</span>
                    <span className="text-emerald-400 font-bold">+RM {paydaySummary.weeklySalary}</span>
                  </div>

                  {/* Rent */}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">{t("rentAuto")}</span>
                    <span className="text-red-400">−RM {paydaySummary.weeklyRent}</span>
                  </div>

                  {/* Debt installment */}
                  {paydaySummary.hasDebt && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">{paydaySummary.debtLabel} {t("autoDebit")}</span>
                      <span className="text-orange-400">−RM {paydaySummary.weeklyDebtMin}</span>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="border-t border-slate-600 pt-1.5 mt-1.5 flex justify-between items-center">
                    <span className="text-white font-bold">{t("takeHome")}</span>
                    <span className={`font-bold text-base ${(netAfterAutoDebits ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {(netAfterAutoDebits ?? 0) >= 0 ? "+" : ""}RM {netAfterAutoDebits}
                    </span>
                  </div>
                </div>

                {/* Week transition warning */}
                {weekTransitionWarning && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-3 p-2.5 rounded-lg border text-xs flex items-start gap-2 ${weekTransitionWarning.colour}`}
                  >
                    <span className="text-base flex-shrink-0">{weekTransitionWarning.icon}</span>
                    <span className="text-slate-200">{weekTransitionWarning.text}</span>
                  </motion.div>
                )}

                {/* Debt context */}
                {paydaySummary.hasDebt && paydaySummary.currentDebt > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-700 flex items-center justify-between text-xs">
                    <span className="text-slate-500">{t("remainingDebt")}</span>
                    <span className="text-red-400 font-mono">RM {paydaySummary.currentDebt.toLocaleString()}</span>
                  </div>
                )}

                {/* Warning if can't afford instalment */}
                {paydaySummary.hasDebt && (netAfterAutoDebits ?? 0) < paydaySummary.weeklyDebtMin && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
                    <AlertTriangle className="w-3 h-3" />
                    <span>{t("riskCredit")}</span>
                  </div>
                )}
              </motion.div>
            )}

            {isFinalWeek && (
              <div className="bg-purple-900/50 border border-purple-500/50 rounded-lg p-3 mb-4">
                <p className="text-purple-300 text-sm">
                  {t("finalWeekMsg")}
                </p>
              </div>
            )}

            <p className="text-slate-300 mb-4 text-sm">
              {t("weekendQuestion")}
            </p>

            {/* Activity Options */}
            <div className="space-y-3 mb-4">
              {/* Skip Option */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-slate-800/80 rounded-lg p-4 border border-orange-500/30 cursor-pointer hover:border-orange-500/60 transition-colors"
                onClick={() => onSelectActivity(skipActivity as WeekendActivity)}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Coffee className="w-5 h-5 text-orange-400" />
                  <span className="font-bold text-white">{skipActivity.name}</span>
                </div>
                <p className="text-sm text-slate-400 mb-2">{skipActivity.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Coins className="w-4 h-4" /> RM0
                  </span>
                  <span className="text-red-400 flex items-center gap-1">
                    <Brain className="w-4 h-4" /> +{skipActivity.stressChange}% Stress
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-xs text-orange-400">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{t("skipRestWarning")}</span>
                </div>
              </motion.div>

              {/* Activity Options */}
              {activities.map((activity) => {
                const canAfford = currentMoney >= activity.moneyCost;
                return (
                  <motion.div
                    key={activity.id}
                    whileHover={canAfford ? { scale: 1.02 } : {}}
                    className={`bg-slate-800/80 rounded-lg p-4 border ${
                      canAfford
                        ? "border-cyan-500/30 cursor-pointer hover:border-cyan-500/60"
                        : "border-slate-600/30 opacity-50"
                    } transition-colors`}
                    onClick={() => canAfford && onSelectActivity(activity)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white">{activity.name}</span>
                      {!canAfford && (
                        <span className="text-xs text-red-400">{t("cantAfford")}</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 mb-2">{activity.description}</p>
                    <div className="flex items-center gap-4 text-sm flex-wrap">
                      <span className={`flex items-center gap-1 ${
                        canAfford ? "text-yellow-400" : "text-red-400"
                      }`}>
                        <Coins className="w-4 h-4" /> −RM{activity.moneyCost}
                      </span>
                      <span className={`flex items-center gap-1 ${activity.stressChange < 0 ? "text-emerald-400" : "text-red-400"}`}>
                        <Brain className="w-4 h-4" />
                        {activity.stressChange > 0 ? "+" : ""}{activity.stressChange}% Stress
                      </span>
                      {activity.healthChange && activity.healthChange > 0 && (
                        <span className="text-pink-400 flex items-center gap-1">
                          <Heart className="w-4 h-4" /> +{activity.healthChange}% Health
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <p className="text-xs text-slate-500 text-center">
              {t("mentalHealthNote")}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
