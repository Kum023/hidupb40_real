"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Gift, Coins, Heart, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SpecialEvent {
  id: string;
  title: string;
  description: string;
  moneyChange: number;
  stressChange: number;
  healthChange: number;
  isPositive: boolean;
}

interface SpecialEventDialogProps {
  isOpen: boolean;
  event: SpecialEvent | null;
  onContinue: () => void;
}

export function SpecialEventDialog({ isOpen, event, onContinue }: SpecialEventDialogProps) {
  if (!event) return null;

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
            className={`bg-gradient-to-br ${
              event.isPositive
                ? "from-emerald-900 via-slate-900 to-emerald-950"
                : "from-red-900 via-slate-900 to-red-950"
            } rounded-xl p-6 max-w-md w-full border-2 ${
              event.isPositive ? "border-emerald-500/50" : "border-red-500/50"
            } shadow-2xl`}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-full ${
                event.isPositive ? "bg-emerald-500/20" : "bg-red-500/20"
              }`}>
                {event.isPositive ? (
                  <Gift className="w-8 h-8 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                )}
              </div>
              <div>
                <p className={`text-xs uppercase tracking-wider ${
                  event.isPositive ? "text-emerald-400" : "text-red-400"
                }`}>
                  {event.isPositive ? "Good News!" : "Random Event"}
                </p>
                <h2 className="text-xl font-bold text-white">{event.title}</h2>
              </div>
            </div>

            {/* Description */}
            <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
              <p className="text-slate-300">{event.description}</p>
            </div>

            {/* Effects */}
            <div className="space-y-2 mb-6">
              {event.moneyChange !== 0 && (
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  <span className={`font-mono font-bold ${
                    event.moneyChange > 0 ? "text-emerald-400" : "text-red-400"
                  }`}>
                    {event.moneyChange > 0 ? "+" : ""}RM{event.moneyChange}
                  </span>
                </div>
              )}
              {event.stressChange !== 0 && (
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-orange-400" />
                  <span className={`font-mono font-bold ${
                    event.stressChange < 0 ? "text-emerald-400" : "text-red-400"
                  }`}>
                    {event.stressChange > 0 ? "+" : ""}{event.stressChange}% Stress
                  </span>
                </div>
              )}
              {event.healthChange !== 0 && (
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-400" />
                  <span className={`font-mono font-bold ${
                    event.healthChange > 0 ? "text-emerald-400" : "text-red-400"
                  }`}>
                    {event.healthChange > 0 ? "+" : ""}{event.healthChange}% Health
                  </span>
                </div>
              )}
            </div>

            {/* Continue Button */}
            <Button
              onClick={onContinue}
              className={`w-full ${
                event.isPositive
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              Continue
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
