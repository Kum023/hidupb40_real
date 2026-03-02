"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sun, Coffee, Coins, Brain, Heart, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WeekendActivity {
  id: string;
  name: string;
  description: string;
  locationId?: string;
  moneyCost: number;
  stressChange: number;
  healthChange?: number;
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
  onSelectActivity: (activity: WeekendActivity) => void;
}

export function WeekendDialog({
  isOpen,
  personaId,
  activities,
  skipActivity,
  currentMoney,
  currentWeek,
  onSelectActivity,
}: WeekendDialogProps) {
  const isFinalWeek = currentWeek === 4;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-br from-cyan-900 via-slate-900 to-purple-950 rounded-xl p-6 max-w-lg w-full border-2 border-cyan-500/50 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-cyan-500/20">
                <Sun className="w-8 h-8 text-yellow-400" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-cyan-400">
                  Week {currentWeek} Complete!
                </p>
                <h2 className="text-xl font-bold text-white">Weekend Time</h2>
              </div>
            </div>

            <p className="text-slate-300 mb-4">
              You&apos;ve completed your weekly objectives! How would you like to spend your weekend?
            </p>

            {isFinalWeek && (
              <div className="bg-purple-900/50 border border-purple-500/50 rounded-lg p-3 mb-4">
                <p className="text-purple-300 text-sm">
                  This is your final week! Your choice will determine your ending.
                </p>
              </div>
            )}

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
                  <span>Warning: Skipping weekends increases stress!</span>
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
                        <span className="text-xs text-red-400">Cannot afford</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 mb-2">{activity.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className={`flex items-center gap-1 ${
                        canAfford ? "text-yellow-400" : "text-red-400"
                      }`}>
                        <Coins className="w-4 h-4" /> -RM{activity.moneyCost}
                      </span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Brain className="w-4 h-4" /> {activity.stressChange}% Stress
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
              Choose wisely - your mental health matters!
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
