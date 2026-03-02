"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Zap, Target, Calendar, Skull, ArrowRight, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface TutorialDialogProps {
  isOpen: boolean;
  onClose: () => void;
  personaName: string;
}

export function TutorialDialog({ isOpen, onClose, personaName }: TutorialDialogProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Hidup B40",
      icon: Target,
      color: "text-cyan-400",
      content: (
        <div className="space-y-3">
          <p>You are a <span className="text-cyan-400 font-bold">{personaName}</span> trying to survive for 4 weeks.</p>
          <p>Every week, you must complete <span className="text-yellow-400 font-bold">mandatory objectives</span> to continue.</p>
        </div>
      ),
    },
    {
      title: "Weekly Objectives",
      icon: Target,
      color: "text-yellow-400",
      content: (
        <div className="space-y-2">
          <p className="text-sm text-slate-400 mb-3">Complete these every week:</p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-yellow-400">•</span>
              <span>Go to Work <span className="text-slate-400">(5 times)</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-400">•</span>
              <span>Buy Groceries <span className="text-slate-400">(once)</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-400">•</span>
              <span>Fill Petrol <span className="text-slate-400">(once)</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-400">•</span>
              <span>Pay Debt <span className="text-slate-400">(Week 4 only)</span></span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Energy System",
      icon: Zap,
      color: "text-emerald-400",
      content: (
        <div className="space-y-3">
          <p>You have <span className="text-emerald-400 font-bold">11 Energy</span> per week.</p>
          <p>Each action costs <span className="text-yellow-400 font-bold">1 Energy</span>.</p>
          <p className="text-sm text-slate-400">Minimum 7 energy needed for objectives, leaving 4 for other activities.</p>
        </div>
      ),
    },
    {
      title: "Weekend Activities",
      icon: Calendar,
      color: "text-purple-400",
      content: (
        <div className="space-y-3">
          <p>After completing objectives, choose a <span className="text-purple-400 font-bold">weekend activity</span>.</p>
          <p>You can <span className="text-orange-400">skip</span> (free but +15% stress) or <span className="text-emerald-400">spend money</span> to relax.</p>
        </div>
      ),
    },
    {
      title: "Restaurant (No Energy)",
      icon: UtensilsCrossed,
      color: "text-orange-400",
      content: (
        <div className="space-y-3">
          <p>The <span className="text-orange-400 font-bold">Restaurant</span> is special:</p>
          <div className="bg-cyan-900/30 border border-cyan-500/30 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-300">Does NOT use energy!</span>
            </div>
            <p className="text-sm text-slate-300">Just costs money and affects your health/stress based on what you eat.</p>
          </div>
          <p className="text-sm text-slate-400">Visit anytime to manage stress - the menu shows calories and nutrition info!</p>
        </div>
      ),
    },
    {
      title: "IMPORTANT WARNING",
      icon: Skull,
      color: "text-red-400",
      content: (
        <div className="space-y-3">
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-bold">GAME OVER CONDITIONS</span>
            </div>
            <ul className="text-sm space-y-1 text-red-200">
              <li>• Run out of energy without completing objectives</li>
              <li>• Health drops to 0%</li>
              <li>• Stress reaches 100%</li>
            </ul>
          </div>
          <p className="text-red-400 font-bold text-center animate-pulse">
            IF YOU FAIL, YOU RESTART AND LOSE ALL PROGRESS!
          </p>
        </div>
      ),
    },
  ];

  const currentStep = steps[step];
  const Icon = currentStep.icon;
  const isLastStep = step === steps.length - 1;

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
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl p-6 max-w-md w-full border-2 border-cyan-500/50 shadow-2xl"
          >
            {/* Progress dots */}
            <div className="flex justify-center gap-2 mb-4">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === step ? "bg-cyan-400" : i < step ? "bg-cyan-700" : "bg-slate-600"
                  }`}
                />
              ))}
            </div>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-full bg-slate-800 ${currentStep.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <h2 className={`text-xl font-bold ${currentStep.color}`}>
                {currentStep.title}
              </h2>
            </div>

            {/* Content */}
            <div className="bg-slate-800/50 rounded-lg p-4 mb-6 min-h-[150px] text-slate-200">
              {currentStep.content}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              {step > 0 ? (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="border-slate-600"
                >
                  Back
                </Button>
              ) : (
                <div />
              )}

              {isLastStep ? (
                <Button
                  onClick={onClose}
                  className="bg-cyan-600 hover:bg-cyan-700 flex items-center gap-2"
                >
                  Start Game
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={() => setStep(step + 1)}
                  className="bg-cyan-600 hover:bg-cyan-700 flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
