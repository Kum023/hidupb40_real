"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Leaf, Cookie, Heart, Brain, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GroceryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGroceries: (type: "groceries_healthy" | "groceries_unhealthy") => void;
  currentMoney: number;
}

export function GroceryDialog({ isOpen, onClose, onSelectGroceries, currentMoney }: GroceryDialogProps) {
  const canAffordHealthy = currentMoney >= 50;
  const canAffordUnhealthy = currentMoney >= 30;

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
            className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl p-6 max-w-2xl w-full border-2 border-emerald-500/30 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-emerald-500/20">
                  <ShoppingCart className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-emerald-400">
                    Weekly Groceries
                  </p>
                  <h2 className="text-xl font-bold text-white">Choose Your Groceries</h2>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Description */}
            <div className="bg-slate-800/50 rounded-lg p-3 mb-6">
              <p className="text-slate-300 text-sm">
                Pick your groceries for the week. What you eat affects your health and stress levels!
              </p>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Healthy Option */}
              <motion.div
                whileHover={{ scale: canAffordHealthy ? 1.02 : 1 }}
                className={`relative rounded-xl border-2 p-4 cursor-pointer transition-all ${
                  canAffordHealthy
                    ? "border-emerald-500/50 bg-emerald-900/20 hover:border-emerald-400"
                    : "border-slate-600/50 bg-slate-800/30 opacity-60 cursor-not-allowed"
                }`}
                onClick={() => canAffordHealthy && onSelectGroceries("groceries_healthy")}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Leaf className="w-6 h-6 text-emerald-400" />
                  <h3 className="text-lg font-bold text-white">Healthy Groceries</h3>
                </div>

                <div className="text-2xl font-bold text-emerald-400 mb-3">RM50</div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-slate-400 font-semibold">Ingredients:</p>
                  <ul className="text-sm text-slate-300 space-y-1">
                    <li>• Fresh vegetables (sayur, kangkung)</li>
                    <li>• Chicken, fish, eggs</li>
                    <li>• Rice, cooking oil</li>
                    <li>• Fruits for snacks</li>
                  </ul>
                </div>

                <div className="border-t border-slate-700 pt-3 space-y-2">
                  <p className="text-xs text-slate-400 font-semibold">Effects:</p>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-400" />
                    <span className="text-emerald-400 font-mono text-sm">+10% Health</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <span className="text-emerald-400 font-mono text-sm">-10% Stress</span>
                  </div>
                </div>

                {!canAffordHealthy && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                    <span className="text-red-400 font-bold">Not enough money</span>
                  </div>
                )}
              </motion.div>

              {/* Unhealthy Option */}
              <motion.div
                whileHover={{ scale: canAffordUnhealthy ? 1.02 : 1 }}
                className={`relative rounded-xl border-2 p-4 cursor-pointer transition-all ${
                  canAffordUnhealthy
                    ? "border-amber-500/50 bg-amber-900/20 hover:border-amber-400"
                    : "border-slate-600/50 bg-slate-800/30 opacity-60 cursor-not-allowed"
                }`}
                onClick={() => canAffordUnhealthy && onSelectGroceries("groceries_unhealthy")}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Cookie className="w-6 h-6 text-amber-400" />
                  <h3 className="text-lg font-bold text-white">Budget Groceries</h3>
                </div>

                <div className="text-2xl font-bold text-amber-400 mb-3">RM30</div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-slate-400 font-semibold">Ingredients:</p>
                  <ul className="text-sm text-slate-300 space-y-1">
                    <li>• Instant noodles (Maggi)</li>
                    <li>• Canned food, processed meat</li>
                    <li>• White bread, margarine</li>
                    <li>• Sugary drinks</li>
                  </ul>
                </div>

                <div className="border-t border-slate-700 pt-3 space-y-2">
                  <p className="text-xs text-slate-400 font-semibold">Effects:</p>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-400" />
                    <span className="text-red-400 font-mono text-sm">-10% Health</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <span className="text-emerald-400 font-mono text-sm">-15% Stress</span>
                    <span className="text-xs text-slate-500">(comfort food)</span>
                  </div>
                </div>

                {!canAffordUnhealthy && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                    <span className="text-red-400 font-bold">Not enough money</span>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Current Money Display */}
            <div className="text-center text-slate-400 text-sm">
              Your money: <span className="text-emerald-400 font-bold">RM{currentMoney}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
