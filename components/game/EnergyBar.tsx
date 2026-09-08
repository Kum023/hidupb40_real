"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { useState } from "react";

interface EnergyBarProps {
  energy: number;
  maxEnergy?: number;
}

export function EnergyBar({ energy, maxEnergy = 11 }: EnergyBarProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const getEnergyColor = (index: number, current: number) => {
    if (index >= current) return "bg-slate-700";
    const percentage = current / maxEnergy;
    if (percentage > 0.6) return "bg-gradient-to-t from-emerald-600 to-emerald-400";
    if (percentage > 0.3) return "bg-gradient-to-t from-yellow-600 to-yellow-400";
    return "bg-gradient-to-t from-red-600 to-red-400";
  };

  const getGlowClass = (current: number) => {
    const percentage = current / maxEnergy;
    if (percentage > 0.6) return "box-glow-green";
    if (percentage > 0.3) return "box-glow-yellow";
    return "box-glow-red";
  };

  return (
    <div className="relative flex items-center gap-2">
      {/* Tooltip */}
      {showTooltip && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-0 top-8 z-50 w-56 bg-slate-800 border border-cyan-500/40 rounded-lg p-3 text-xs shadow-xl"
        >
          <p className="text-cyan-400 font-bold mb-1">⚡ Energy = Your Week</p>
          <div className="space-y-1 text-slate-300">
            <div className="flex justify-between">
              <span>Work (5 days)</span>
              <span className="text-red-400 font-mono">−5</span>
            </div>
            <div className="flex justify-between">
              <span>Groceries</span>
              <span className="text-red-400 font-mono">−1</span>
            </div>
            <div className="flex justify-between">
              <span>Petrol</span>
              <span className="text-red-400 font-mono">−1</span>
            </div>
            <div className="border-t border-slate-600 pt-1 flex justify-between font-bold">
              <span>Free actions left</span>
              <span className="text-emerald-400 font-mono">≈4</span>
            </div>
          </div>
          <p className="text-slate-500 mt-1.5">Salary &amp; rent handled automatically at week end</p>
          {/* Arrow */}
          <div className="absolute -top-1.5 right-8 w-3 h-3 bg-slate-800 border-l border-t border-cyan-500/40 rotate-45" />
        </motion.div>
      )}

      <Zap
        className={`w-5 h-5 cursor-help ${energy <= 3 ? "text-red-400 animate-pulse" : "text-yellow-400"}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      />
      <div className="flex gap-0.5">
        {[...Array(maxEnergy)].map((_, i) => (
          <motion.div
            key={i}
            className={`w-2 h-5 rounded-sm ${getEnergyColor(i, energy)} ${
              i < energy ? getGlowClass(energy) : ""
            }`}
            animate={i < energy ? { opacity: [0.8, 1, 0.8] } : {}}
            transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.1 }}
          />
        ))}
      </div>
      <span
        className={`text-sm font-mono font-bold cursor-help ${
          energy <= 3 ? "text-red-400" : energy <= 6 ? "text-yellow-400" : "text-emerald-400"
        }`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {energy}/{maxEnergy}
      </span>
    </div>
  );
}
