"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Skull, RotateCcw, Home, Coins, Heart, Brain, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GameOverDialogProps {
  isOpen: boolean;
  endingType: string;
  failureReason: string;
  stats: {
    money: number;
    debt: number;
    health: number;
    stress: number;
    creditScore: number;
    weeksCompleted: number;
  };
  onRestart: () => void;
  onMainMenu: () => void;
}

export function GameOverDialog({
  isOpen,
  endingType,
  failureReason,
  stats,
  onRestart,
  onMainMenu,
}: GameOverDialogProps) {
  const getEndingInfo = () => {
    switch (endingType) {
      case "health_crisis":
        return {
          title: "Health Crisis",
          icon: Heart,
          color: "text-red-400",
          bgColor: "from-red-900 via-slate-900 to-red-950",
          borderColor: "border-red-500/50",
        };
      case "burnout":
        return {
          title: "Burnout",
          icon: Brain,
          color: "text-orange-400",
          bgColor: "from-orange-900 via-slate-900 to-orange-950",
          borderColor: "border-orange-500/50",
        };
      case "objectives_failed":
      case "energy_depleted":
        return {
          title: "Objectives Failed",
          icon: Skull,
          color: "text-red-400",
          bgColor: "from-red-900 via-slate-900 to-red-950",
          borderColor: "border-red-500/50",
        };
      case "success":
        return {
          title: "Success!",
          icon: TrendingUp,
          color: "text-emerald-400",
          bgColor: "from-emerald-900 via-slate-900 to-emerald-950",
          borderColor: "border-emerald-500/50",
        };
      case "struggle":
        return {
          title: "Survived",
          icon: Coins,
          color: "text-yellow-400",
          bgColor: "from-yellow-900 via-slate-900 to-yellow-950",
          borderColor: "border-yellow-500/50",
        };
      default:
        return {
          title: "Game Over",
          icon: Skull,
          color: "text-slate-400",
          bgColor: "from-slate-800 via-slate-900 to-slate-950",
          borderColor: "border-slate-500/50",
        };
    }
  };

  const endingInfo = getEndingInfo();
  const Icon = endingInfo.icon;
  const isSuccess = endingType === "success" || endingType === "struggle";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className={`bg-gradient-to-br ${endingInfo.bgColor} rounded-xl p-6 max-w-md w-full border-2 ${endingInfo.borderColor} shadow-2xl`}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className={`inline-flex p-4 rounded-full ${
                  isSuccess ? "bg-emerald-500/20" : "bg-red-500/20"
                } mb-4`}
              >
                <Icon className={`w-12 h-12 ${endingInfo.color}`} />
              </motion.div>
              <h2 className={`text-3xl font-bold ${endingInfo.color} mb-2`}>
                {endingInfo.title}
              </h2>
              <p className="text-slate-300">{failureReason}</p>
            </div>

            {/* Stats Summary */}
            <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
              <h3 className="text-sm text-slate-400 uppercase tracking-wider mb-3">
                Final Stats
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-slate-300">Cash:</span>
                  <span className={`font-mono font-bold ${
                    stats.money > 0 ? "text-emerald-400" : "text-red-400"
                  }`}>
                    RM{stats.money}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Skull className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-slate-300">Debt:</span>
                  <span className="font-mono font-bold text-red-400">
                    RM{stats.debt}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-400" />
                  <span className="text-sm text-slate-300">Health:</span>
                  <span className={`font-mono font-bold ${
                    stats.health > 50 ? "text-pink-400" : "text-red-400"
                  }`}>
                    {stats.health}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-slate-300">Stress:</span>
                  <span className={`font-mono font-bold ${
                    stats.stress < 50 ? "text-emerald-400" : "text-red-400"
                  }`}>
                    {stats.stress}%
                  </span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-slate-300">Credit Score:</span>
                  <span className={`font-mono font-bold ${
                    stats.creditScore > 650 ? "text-emerald-400" : stats.creditScore > 550 ? "text-yellow-400" : "text-red-400"
                  }`}>
                    {stats.creditScore}
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-700">
                <span className="text-sm text-slate-400">
                  Weeks Completed: <span className="text-white font-bold">{stats.weeksCompleted}/4</span>
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Button
                onClick={onRestart}
                className="w-full bg-cyan-600 hover:bg-cyan-700 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Try Again
              </Button>
              <Button
                onClick={onMainMenu}
                variant="outline"
                className="w-full border-slate-600 hover:bg-slate-800 flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Main Menu
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
