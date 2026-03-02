"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LocationId, PERSONA_MAPS, KL_MAP } from "@/lib/constants";
import { Scenario } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Coins, Heart, Brain, TrendingUp } from "lucide-react";

function getLocationName(locationId: string, personaId?: string): string {
  const mapConfig = personaId && PERSONA_MAPS[personaId] ? PERSONA_MAPS[personaId] : KL_MAP;
  const location = mapConfig.locations[locationId as LocationId];
  return location ? `${location.icon} ${location.name}` : locationId;
}

const emotionColors: Record<string, { bg: string; border: string; text: string }> = {
  neutral: { bg: "from-slate-600 to-slate-800", border: "border-slate-500", text: "text-slate-300" },
  happy: { bg: "from-emerald-600 to-emerald-800", border: "border-emerald-400", text: "text-emerald-300" },
  sad: { bg: "from-blue-600 to-blue-800", border: "border-blue-400", text: "text-blue-300" },
  stressed: { bg: "from-orange-600 to-orange-800", border: "border-orange-400", text: "text-orange-300" },
  angry: { bg: "from-red-600 to-red-800", border: "border-red-400", text: "text-red-300" },
  hopeful: { bg: "from-cyan-600 to-cyan-800", border: "border-cyan-400", text: "text-cyan-300" },
  desperate: { bg: "from-purple-600 to-purple-800", border: "border-purple-400", text: "text-purple-300" },
  relieved: { bg: "from-green-600 to-green-800", border: "border-green-400", text: "text-green-300" },
};

interface LocationDialogProps {
  open: boolean;
  onClose: () => void;
  scenario: Scenario | null;
  isLoading: boolean;
  onChoiceSelect: (choiceIndex: number) => void;
  isProcessing: boolean;
  personaId?: string;
}

export function LocationDialog({
  open,
  onClose,
  scenario,
  isLoading,
  onChoiceSelect,
  isProcessing,
  personaId,
}: LocationDialogProps) {
  const emotionStyle = scenario ? emotionColors[scenario.emotion] || emotionColors.neutral : emotionColors.neutral;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={`bg-gradient-to-br ${emotionStyle.bg} border-2 ${emotionStyle.border} text-white max-w-lg max-h-[90vh] flex flex-col overflow-hidden`}>
        {/* Scanline effect */}
        <div className="absolute inset-0 scanlines opacity-10 pointer-events-none" />

        {isLoading ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-mono">LOADING...</DialogTitle>
              <DialogDescription className="text-slate-400">
                Generating your fate
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <Loader2 className="h-12 w-12 text-cyan-400" />
              </motion.div>
              <motion.p
                className="text-cyan-300 mt-4 font-mono"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                PROCESSING...
              </motion.p>
            </div>
          </>
        ) : scenario ? (
          <>
            <DialogHeader className="shrink-0 relative">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
              >
                <DialogTitle className="text-2xl font-bold" style={{ textShadow: "0 0 10px currentColor" }}>
                  {getLocationName(scenario.location, personaId)}
                </DialogTitle>
              </motion.div>
              <DialogDescription className={`${emotionStyle.text} flex items-center gap-2`}>
                <motion.span
                  className="text-2xl"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  {getEmotionEmoji(scenario.emotion)}
                </motion.span>
                <span className="uppercase font-mono tracking-wider">{scenario.emotion}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 overflow-y-auto flex-1 min-h-0 relative px-1">
              {/* Narration box */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/30 rounded-lg p-4 border border-white/10"
              >
                <p className="text-slate-100 leading-relaxed break-words whitespace-pre-wrap">
                  {scenario.narration}
                </p>
              </motion.div>

              {/* NPC Dialogue */}
              {scenario.npcDialogue && (
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-r from-cyan-900/50 to-blue-900/50 rounded-lg p-4 border-l-4 border-cyan-400"
                  style={{ boxShadow: "0 0 20px rgba(0, 255, 255, 0.2)" }}
                >
                  <p className="text-sm text-cyan-300 mb-1 font-mono flex items-center gap-2">
                    <span className="text-lg">💬</span>
                    {scenario.npcDialogue.speaker}
                  </p>
                  <p className="text-white italic break-words whitespace-pre-wrap text-lg">
                    &ldquo;{scenario.npcDialogue.text}&rdquo;
                  </p>
                </motion.div>
              )}

              {/* Choices */}
              <div className="space-y-3 pt-4 pb-2">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-yellow-400 mb-3 font-mono text-center"
                >
                  ⚡ CHOOSE YOUR ACTION ⚡
                </motion.p>
                <AnimatePresence>
                  {scenario.choices.map((choice, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.15 }}
                      className="px-1"
                    >
                      <motion.button
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          isProcessing
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        } ${
                          choice.consequence.money > 0
                            ? "bg-emerald-900/30 border-emerald-500/50 hover:border-emerald-400 hover:bg-emerald-900/50"
                            : choice.consequence.money < 0
                              ? "bg-red-900/30 border-red-500/50 hover:border-red-400 hover:bg-red-900/50"
                              : "bg-slate-800/50 border-slate-500/50 hover:border-cyan-400 hover:bg-slate-700/50"
                        }`}
                        onClick={() => !isProcessing && onChoiceSelect(index)}
                        disabled={isProcessing}
                        whileHover={!isProcessing ? { 
                          boxShadow: "0 0 20px rgba(0, 255, 255, 0.3)",
                          scale: 1.01,
                        } : {}}
                        whileTap={!isProcessing ? { scale: 0.99 } : {}}
                        style={{ transformOrigin: "center" }}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl font-bold text-cyan-400 font-mono">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <p className="text-white font-medium mb-2">{choice.text}</p>
                            <div className="flex flex-wrap gap-2 text-xs">
                              {choice.consequence.money !== 0 && (
                                <span className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                                  choice.consequence.money > 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                                }`}>
                                  <Coins className="w-3 h-3" />
                                  {choice.consequence.money > 0 ? "+" : ""}RM{choice.consequence.money}
                                </span>
                              )}
                              {choice.consequence.health !== 0 && (
                                <span className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                                  choice.consequence.health > 0 ? "bg-pink-500/20 text-pink-400" : "bg-red-500/20 text-red-400"
                                }`}>
                                  <Heart className="w-3 h-3" />
                                  {choice.consequence.health > 0 ? "+" : ""}{choice.consequence.health}
                                </span>
                              )}
                              {choice.consequence.stress !== 0 && (
                                <span className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                                  choice.consequence.stress < 0 ? "bg-green-500/20 text-green-400" : "bg-orange-500/20 text-orange-400"
                                }`}>
                                  <Brain className="w-3 h-3" />
                                  {choice.consequence.stress > 0 ? "+" : ""}{choice.consequence.stress}
                                </span>
                              )}
                              {choice.consequence.credit !== 0 && (
                                <span className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                                  choice.consequence.credit > 0 ? "bg-purple-500/20 text-purple-400" : "bg-red-500/20 text-red-400"
                                }`}>
                                  <TrendingUp className="w-3 h-3" />
                                  {choice.consequence.credit > 0 ? "+" : ""}{choice.consequence.credit}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center py-4 bg-black/50 rounded-lg"
                >
                  <Loader2 className="h-5 w-5 animate-spin text-cyan-400 mr-2" />
                  <span className="text-cyan-300 text-sm font-mono">EXECUTING CHOICE...</span>
                </motion.div>
              )}
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl text-red-400">⚠️ ERROR</DialogTitle>
              <DialogDescription className="text-slate-400">
                Something went wrong
              </DialogDescription>
            </DialogHeader>
            <div className="py-8 text-center">
              <motion.p
                className="text-red-400 font-mono"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                SYSTEM MALFUNCTION
              </motion.p>
              <p className="text-slate-400 mt-2">Please try again</p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function getEmotionEmoji(emotion: string): string {
  const emotionEmojis: Record<string, string> = {
    neutral: "😐",
    happy: "😊",
    sad: "😢",
    stressed: "😰",
    angry: "😠",
    hopeful: "🤞",
    desperate: "😩",
    relieved: "😌",
  };
  return emotionEmojis[emotion] || "😐";
}
