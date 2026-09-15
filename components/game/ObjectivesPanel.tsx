"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Briefcase, ShoppingCart, Fuel, CreditCard } from "lucide-react";
import { useT } from "@/lib/translations";

interface WeeklyObjectives {
  workDaysCompleted: number;
  boughtGroceries: boolean;
  filledPetrol: boolean;
  paidDebt: boolean;
}

interface ObjectivesPanelProps {
  objectives: WeeklyObjectives;
  currentWeek: number;
  currentDay: number;
  energy: number;
  workedToday?: boolean;
}

export function ObjectivesPanel({ objectives, currentWeek, currentDay, energy, workedToday }: ObjectivesPanelProps) {
  const t = useT();
  const workComplete = objectives.workDaysCompleted >= 5;
  const debtRequired = currentWeek === 4;

  // Show today's work status for the work objective
  const todayWorkStatus = currentDay <= 5
    ? (workedToday ? ` ${t("todayDone")}` : ` ${t("todayPending")}`)
    : "";

  const objectivesList = [
    {
      id: "work",
      label: t("workLabel"),
      progress: `${objectives.workDaysCompleted}/5${todayWorkStatus}`,
      complete: workComplete,
      icon: Briefcase,
      required: true,
      todayPending: currentDay <= 5 && !workedToday && !workComplete,
    },
    {
      id: "groceries",
      label: t("buyGroceries"),
      complete: objectives.boughtGroceries,
      icon: ShoppingCart,
      required: true,
    },
    {
      id: "petrol",
      label: t("fillPetrol"),
      complete: objectives.filledPetrol,
      icon: Fuel,
      required: true,
    },
    {
      id: "debt",
      label: t("bankExtraPayment"),
      complete: objectives.paidDebt,
      icon: CreditCard,
      required: false,
      hidden: false,
    },
  ].filter((obj) => !obj.hidden);

  const requiredObjectives = objectivesList.filter((o) => o.required);
  const optionalObjectives = objectivesList.filter((o) => !o.required);
  const completedRequired = requiredObjectives.filter((o) => o.complete).length;
  const totalRequired = requiredObjectives.length;
  const allComplete = completedRequired === totalRequired;
  const lowEnergy = energy <= 3;

  return (
    <div className={`bg-slate-800/80 rounded-lg p-3 border ${
      allComplete ? "border-emerald-500/50" : lowEnergy && !allComplete ? "border-red-500/50 animate-pulse" : "border-cyan-500/30"
    }`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xs text-slate-400 uppercase tracking-wider">{t("weeklyObjectives")}</h3>
        <span className={`text-xs font-mono font-bold ${
          allComplete ? "text-emerald-400" : "text-cyan-400"
        }`}>
          {completedRequired}/{totalRequired}
        </span>
      </div>

      <div className="space-y-2">
        {/* Required objectives */}
        {requiredObjectives.map((objective) => {
          const Icon = objective.icon;
          const isTodayPending = 'todayPending' in objective && objective.todayPending;
          return (
            <motion.div
              key={objective.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-center gap-2 p-2 rounded-md ${
                objective.complete
                  ? "bg-emerald-900/30 border border-emerald-500/30"
                  : isTodayPending
                    ? "bg-amber-900/30 border border-amber-500/30"
                    : "bg-slate-700/50"
              }`}
            >
              {objective.complete ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <Circle className={`w-4 h-4 ${
                  isTodayPending ? "text-amber-400" : lowEnergy ? "text-red-400" : "text-slate-500"
                }`} />
              )}
              <Icon className={`w-4 h-4 ${
                objective.complete ? "text-emerald-400" : isTodayPending ? "text-amber-400" : "text-slate-400"
              }`} />
              <span className={`text-sm flex-1 ${
                objective.complete ? "text-emerald-300 line-through" : isTodayPending ? "text-amber-300" : "text-slate-300"
              }`}>
                {objective.label}
              </span>
              {objective.progress && (
                <span className={`text-xs font-mono ${
                  objective.complete ? "text-emerald-400" : isTodayPending ? "text-amber-400" : "text-slate-500"
                }`}>
                  {objective.progress}
                </span>
              )}
            </motion.div>
          );
        })}

        {/* Optional objectives (bank extra payment) */}
        {optionalObjectives.map((objective) => {
          const Icon = objective.icon;
          return (
            <motion.div
              key={objective.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-center gap-2 p-2 rounded-md border border-dashed ${
                objective.complete
                  ? "bg-purple-900/30 border-purple-500/40"
                  : "bg-slate-800/30 border-slate-600/40"
              }`}
            >
              {objective.complete ? (
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
              ) : (
                <Circle className="w-4 h-4 text-slate-600" />
              )}
              <Icon className={`w-4 h-4 ${objective.complete ? "text-purple-400" : "text-slate-500"}`} />
              <span className={`text-xs flex-1 ${
                objective.complete ? "text-purple-300" : "text-slate-500"
              }`}>
                {objective.label}
              </span>
              <span className="text-xs bg-purple-900/50 text-purple-400 px-1.5 py-0.5 rounded font-mono">
                {t("bonus")}
              </span>
            </motion.div>
          );
        })}
      </div>

      {lowEnergy && !allComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 p-2 bg-red-900/50 border border-red-500/50 rounded-md"
        >
          <span className="text-xs text-red-400 font-bold">
            {t("lowEnergyWarning")}
          </span>
        </motion.div>
      )}

      {allComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 p-2 bg-emerald-900/50 border border-emerald-500/50 rounded-md text-center"
        >
          <span className="text-xs text-emerald-400 font-bold">
            {t("allObjComplete")}
          </span>
        </motion.div>
      )}
    </div>
  );
}
