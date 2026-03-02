"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";

interface EnergyBarProps {
  energy: number;
  maxEnergy?: number;
}

export function EnergyBar({ energy, maxEnergy = 11 }: EnergyBarProps) {
  const getEnergyColor = (index: number, current: number) => {
    if (index >= current) return "bg-slate-700";

    const percentage = current / maxEnergy;
    if (percentage > 0.6) {
      return "bg-gradient-to-t from-emerald-600 to-emerald-400";
    } else if (percentage > 0.3) {
      return "bg-gradient-to-t from-yellow-600 to-yellow-400";
    } else {
      return "bg-gradient-to-t from-red-600 to-red-400";
    }
  };

  const getGlowClass = (current: number) => {
    const percentage = current / maxEnergy;
    if (percentage > 0.6) return "box-glow-green";
    if (percentage > 0.3) return "box-glow-yellow";
    return "box-glow-red";
  };

  return (
    <div className="flex items-center gap-2">
      <Zap className={`w-5 h-5 ${energy <= 3 ? "text-red-400 animate-pulse" : "text-yellow-400"}`} />
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
      <span className={`text-sm font-mono font-bold ${
        energy <= 3 ? "text-red-400" : energy <= 6 ? "text-yellow-400" : "text-emerald-400"
      }`}>
        {energy}/{maxEnergy}
      </span>
    </div>
  );
}
