"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Briefcase, Brain, Heart, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LeaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyLeave: () => void;
  onGoToWork: () => void;
}

export function LeaveDialog({ isOpen, onClose, onApplyLeave, onGoToWork }: LeaveDialogProps) {
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
            className="bg-gradient-to-br from-amber-900 via-slate-900 to-amber-950 rounded-xl p-6 max-w-md w-full border-2 border-amber-500/50 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-amber-500/20">
                <AlertTriangle className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-amber-400">
                  Work Required
                </p>
                <h2 className="text-xl font-bold text-white">You Haven&apos;t Worked Today!</h2>
              </div>
            </div>

            {/* Description */}
            <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
              <p className="text-slate-300">
                You need to go to work before ending the day. If you can&apos;t work today, you can apply for leave - but it will have consequences.
              </p>
            </div>

            {/* Leave Penalty Warning */}
            <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm font-semibold mb-3">Leave Penalty:</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-orange-400" />
                  <span className="text-red-400 font-mono text-sm">+15% Stress</span>
                  <span className="text-slate-500 text-xs">(guilt & anxiety)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-400" />
                  <span className="text-red-400 font-mono text-sm">-5% Health</span>
                  <span className="text-slate-500 text-xs">(stress affects body)</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-purple-400" />
                  <span className="text-red-400 font-mono text-sm">-5 Credit Score</span>
                  <span className="text-slate-500 text-xs">(seen as unreliable)</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={onGoToWork}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Go to Work
              </Button>
              <Button
                onClick={onApplyLeave}
                variant="outline"
                className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
              >
                Apply Leave (with penalty)
              </Button>
              <Button
                onClick={onClose}
                variant="ghost"
                className="w-full text-slate-400 hover:text-slate-300"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
