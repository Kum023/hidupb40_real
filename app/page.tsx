"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Pre-computed particle data to avoid hydration mismatch
const particles = [
  { x: 5, emoji: "💸", duration: 12, delay: 0 },
  { x: 15, emoji: "💰", duration: 15, delay: 2 },
  { x: 25, emoji: "💳", duration: 11, delay: 4 },
  { x: 35, emoji: "🪙", duration: 18, delay: 1 },
  { x: 45, emoji: "📉", duration: 14, delay: 3 },
  { x: 55, emoji: "📈", duration: 16, delay: 5 },
  { x: 65, emoji: "💸", duration: 13, delay: 6 },
  { x: 75, emoji: "💰", duration: 17, delay: 2 },
  { x: 85, emoji: "💳", duration: 12, delay: 8 },
  { x: 95, emoji: "🪙", duration: 19, delay: 1 },
  { x: 10, emoji: "📉", duration: 14, delay: 7 },
  { x: 30, emoji: "📈", duration: 11, delay: 9 },
  { x: 50, emoji: "💸", duration: 15, delay: 3 },
  { x: 70, emoji: "💰", duration: 13, delay: 5 },
  { x: 90, emoji: "💳", duration: 16, delay: 4 },
];

export default function Home() {
  const router = useRouter();
  const [glitchText, setGlitchText] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setGlitchText(true);
      setTimeout(() => setGlitchText(false), 200);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8 overflow-hidden relative">
      {/* Animated background grid */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Floating money particles - only render after mount to avoid hydration issues */}
      {mounted && particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl pointer-events-none select-none"
          style={{ left: `${p.x}%` }}
          initial={{ y: -50, rotate: 0, opacity: 0.6 }}
          animate={{ y: "100vh", rotate: 360, opacity: [0.6, 0.3, 0.6] }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear",
          }}
        >
          {p.emoji}
        </motion.div>
      ))}

      {/* Vignette effect */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/50 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl relative z-10"
      >
        {/* Glitchy title */}
        <motion.h1
          className={`text-6xl md:text-7xl font-black mb-4 ${glitchText ? "animate-glitch" : ""}`}
          style={{
            textShadow: "0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 40px #00ffff",
          }}
        >
          <span className="gradient-text">HIDUP B40</span>
        </motion.h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mb-6"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-cyan-300 mb-4 font-mono"
        >
          SURVIVE. DECIDE. SUFFER THE CONSEQUENCES.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-slate-400 mb-8 max-w-md mx-auto"
        >
          Walk through a Malaysian neighborhood. Make financial decisions.
          Watch your credit score crumble or climb.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="space-y-4"
        >
          <p className="text-red-400 text-sm mb-6 font-mono animate-pulse">
            ⚠️ EVERY CHOICE HAS A PRICE. SOME YOU PAY NOW. SOME YOU PAY LATER.
          </p>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-bold px-12 py-7 text-xl rounded-xl border-2 border-white/20"
              style={{
                boxShadow: "0 0 20px #00ff88, 0 0 40px #00ff8844",
              }}
              onClick={() => router.push("/setup")}
            >
              🎮 START GAME
            </Button>
          </motion.div>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-16 grid grid-cols-3 gap-4"
        >
          {[
            { icon: "🏠", label: "7 LOCATIONS", color: "cyan" },
            { icon: "💀", label: "HARD CHOICES", color: "red" },
            { icon: "📊", label: "REAL CONSEQUENCES", color: "yellow" },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              className={`p-4 rounded-xl bg-slate-800/50 border border-${item.color}-500/30`}
              whileHover={{
                scale: 1.05,
                boxShadow: `0 0 20px ${item.color === "cyan" ? "#00ffff" : item.color === "red" ? "#ff4444" : "#ffff00"}44`,
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + index * 0.1 }}
            >
              <motion.div
                className="text-4xl mb-2"
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2, delay: index * 0.3 }}
              >
                {item.icon}
              </motion.div>
              <p className={`text-${item.color}-400 text-xs font-bold font-mono`}>{item.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-12 text-slate-500 text-sm font-mono"
        >
          A FINANCIAL LITERACY GAME FOR THE REAL WORLD
        </motion.p>

        {/* Credits */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="mt-6 text-slate-600 text-xs"
        >
          by{" "}
          <a
            href="https://github.com/Kum023"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-500 hover:text-cyan-400 underline"
          >
            Kumara
          </a>
        </motion.p>
      </motion.div>

      {/* Scanlines */}
      <div className="absolute inset-0 scanlines opacity-10 pointer-events-none" />
    </main>
  );
}
