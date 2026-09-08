"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, MapPin, BarChart3, Lightbulb,
  HelpCircle, CheckCircle2, Star, MessageSquare,
  TrendingUp, TrendingDown, AlertTriangle, Zap,
  Heart, Brain, Coins, CreditCard, Building2,
  ShoppingCart, Fuel, Landmark, Home, Coffee,
  ChevronRight,
} from "lucide-react";

// ─────────────────────────────────────────────
// Location guide data
// ─────────────────────────────────────────────
const LOCATION_GUIDE = [
  {
    id: "office",
    name: "Pejabat (Office)",
    icon: Building2,
    iconColour: "text-purple-400",
    bgColour: "bg-purple-900/20 border-purple-500/30",
    badge: "REQUIRED ×5",
    badgeColour: "bg-red-900/50 text-red-300",
    cost: "+7 stress per visit",
    reward: "Earns your weekly salary (paid at week end)",
    effects: ["Must visit Mon–Fri (5 days)", "Miss without leave → Apply Leave button: −5 credit, +15 stress"],
    tip: "Work drives all your income. You cannot skip it — but rest on weekends offsets the stress.",
  },
  {
    id: "shop",
    name: "Kedai / Mini Market",
    icon: ShoppingCart,
    iconColour: "text-emerald-400",
    bgColour: "bg-emerald-900/20 border-emerald-500/30",
    badge: "REQUIRED ×1",
    badgeColour: "bg-red-900/50 text-red-300",
    cost: "RM 30 (unhealthy) or RM 50 (healthy)",
    reward: "Healthy: +10 health, −10 stress | Unhealthy: −10 health, −15 stress",
    effects: ["Unhealthy saves RM 20 but costs health long-term", "Must buy groceries once every week"],
    tip: "4 weeks of unhealthy food = −40 health. The RM 20 saving isn't worth it.",
  },
  {
    id: "petrol",
    name: "Petronas (Petrol Station)",
    icon: Fuel,
    iconColour: "text-red-400",
    bgColour: "bg-red-900/20 border-red-500/30",
    badge: "REQUIRED ×1",
    badgeColour: "bg-red-900/50 text-red-300",
    cost: "RM 80",
    reward: "No stat change — pure survival cost",
    effects: ["Must fill petrol once every week", "Fixed cost you cannot negotiate"],
    tip: "This is your biggest fixed weekly cash expense. Always keep RM 80+ in reserve.",
  },
  {
    id: "bank",
    name: "Bank (Maybank / CIMB)",
    icon: Landmark,
    iconColour: "text-cyan-400",
    bgColour: "bg-cyan-900/20 border-cyan-500/30",
    badge: "BONUS",
    badgeColour: "bg-purple-900/50 text-purple-300",
    cost: "RM 200 (your choice)",
    reward: "+20 credit score",
    effects: ["Minimum debt instalment auto-deducted at week end regardless", "This is an EXTRA payment above minimum", "Can only do it once per week"],
    tip: "Do this every week = +60 credit over the game. That's the difference between 'Poor' and 'Fair' standing — which determines if you can get a car loan later.",
  },
  {
    id: "home",
    name: "Rumah (Home)",
    icon: Home,
    iconColour: "text-blue-400",
    bgColour: "bg-blue-900/20 border-blue-500/30",
    badge: "STORY",
    badgeColour: "bg-slate-600/50 text-slate-300",
    cost: "Free",
    reward: "Claude AI scenario — unexpected events at home",
    effects: ["Family calls, neighbour issues, WFH opportunities", "Outcomes vary based on your past decisions"],
    tip: "Story-only location. No objective, but scenarios here can change your money or stats significantly.",
  },
  {
    id: "restaurant",
    name: "Restoran / Mamak",
    icon: Coffee,
    iconColour: "text-yellow-400",
    bgColour: "bg-yellow-900/20 border-yellow-500/30",
    badge: "FREE ENERGY",
    badgeColour: "bg-emerald-900/50 text-emerald-300",
    cost: "RM 10–60 (depends on meal choice)",
    reward: "Health and stress effects from meal",
    effects: [
      "⚡ Does NOT cost energy — it's a free visit!",
      "Different meals = different health/stress effects",
      "Great for recovering health mid-week",
    ],
    tip: "Restaurant visits are energy-free. Use them whenever you need a health boost without spending an action.",
  },
  {
    id: "bus",
    name: "Bas Stop / LRT",
    icon: Zap,
    iconColour: "text-orange-400",
    bgColour: "bg-orange-900/20 border-orange-500/30",
    badge: "STORY",
    badgeColour: "bg-slate-600/50 text-slate-300",
    cost: "Varies",
    reward: "Claude AI scenario — commute decisions",
    effects: ["Public transport choices", "Can sometimes replace petrol cost for the day"],
    tip: "Random encounter location. Events here can be positive (meet someone helpful) or negative (theft, delay).",
  },
];

// ─────────────────────────────────────────────
// Stats guide data
// ─────────────────────────────────────────────
const STATS_GUIDE = [
  {
    id: "money",
    emoji: "💵",
    label: "Cash (Wang Tunai)",
    colour: "text-emerald-400",
    bgColour: "bg-emerald-900/20 border-emerald-500/30",
    description: "Money in your pocket right now — your immediate spending power.",
    up: ["Salary paid at week end (+RM 450–550)", "Positive scenario choices"],
    down: ["Groceries (−RM 30–50)", "Petrol (−RM 80)", "Weekend activities", "Extra bank payment (−RM 200)"],
    danger: "Below RM 100: stress rises. Below RM 50: you're BROKE — game gets very hard.",
    realLife: "Most B40 Malaysians have less than RM 500 in liquid savings. One emergency can wipe it out.",
  },
  {
    id: "debt",
    emoji: "💀",
    label: "Hutang (Debt)",
    colour: "text-red-400",
    bgColour: "bg-red-900/20 border-red-500/30",
    description: "Total loan balance — PTPTN for fresh grads, personal loan for others.",
    up: ["Weekly interest accrues on remaining balance", "Missing instalment = interest still adds"],
    down: ["Auto-debit instalment every week end", "Extra bank payment (−RM 200, your choice)"],
    danger: "Debt grows faster than you pay = debt spiral. Missing instalment = −20 credit score.",
    realLife: "PTPTN for a 3-year diploma = RM 20,000–35,000. At RM 600/month, it takes 3–5 years to clear.",
  },
  {
    id: "credit",
    emoji: "🎯",
    label: "Credit Score (Skor Kredit)",
    colour: "text-purple-400",
    bgColour: "bg-purple-900/20 border-purple-500/30",
    description: "How reliably you handle debt (300–850). Banks check this for every loan.",
    up: ["Auto-instalment paid on time (+5/week)", "Extra bank payment (+20)", "Some good scenario choices"],
    down: ["Missed instalment (−20)", "Applying for work leave (−5)", "Some bad choices"],
    danger: "Below 650: car/home loan harder. Below 550: most loans rejected. Below 500: blacklisted.",
    realLife: "In Malaysia, CCRIS and CTOS track this. One missed payment stays on record for 12 months — even after you pay it.",
  },
  {
    id: "health",
    emoji: "❤️",
    label: "Kesihatan (Health)",
    colour: "text-pink-400",
    bgColour: "bg-pink-900/20 border-pink-500/30",
    description: "Physical wellbeing (0–100). Drops to 0 = you collapse = game over.",
    up: ["Healthy groceries (+10)", "Some weekend activities", "Penang Hill / relaxing activities (+15)"],
    down: ["Unhealthy groceries (−10)", "Overwork and bad scenarios", "Ignoring rest"],
    danger: "Below 40: warning. Below 20: critical. At 0: health crisis = game over.",
    realLife: "A clinic visit costs RM 50–150. A hospital stay can cost thousands. Your health IS your financial security.",
  },
  {
    id: "stress",
    emoji: "🧠",
    label: "Tekanan (Stress)",
    colour: "text-orange-400",
    bgColour: "bg-orange-900/20 border-orange-500/30",
    description: "Mental load (0–100). Hits 100 = burnout = game over.",
    up: ["Work every day (+7 per day = +35/week)", "Skipping weekend rest (+15)", "Missing objectives", "Bad random events"],
    down: ["Healthy groceries (−10)", "Weekend activities (−10 to −35)", "Penang Hill: −30 for RM 30"],
    danger: "Above 70: screen shakes. Above 85: near burnout. At 100: you burn out = game over.",
    realLife: "Burnout is the #1 reason young Malaysians quit their first job. Mental health and financial health are the same thing.",
  },
  {
    id: "energy",
    emoji: "⚡",
    label: "Tenaga (Energy)",
    colour: "text-yellow-400",
    bgColour: "bg-yellow-900/20 border-yellow-500/30",
    description: "Your week's capacity (resets to 11 every Monday). Every location visit costs 1.",
    up: ["Resets to 11 every new week (Monday)"],
    down: ["Every location visit costs 1 energy — including mandatory ones"],
    danger: "Run out before completing work/groceries/petrol = game over (you failed your responsibilities).",
    realLife: "Energy represents limited time and capacity. You literally cannot do everything — you must prioritise.",
  },
];

// ─────────────────────────────────────────────
// Contextual tips generator
// ─────────────────────────────────────────────
interface GameContext {
  money: number;
  debt: number;
  creditScore: number;
  health: number;
  stress: number;
  currentWeek: number;
  weeklyObjectivesPaidDebt: boolean;
}

function getContextualTips(ctx: GameContext) {
  const tips: { icon: string; title: string; body: string; urgency: "high" | "medium" | "low" }[] = [];

  // Always-on: energy breakdown
  tips.push({
    icon: "⚡",
    title: "How energy works",
    body: "11 energy per week. 7 goes to mandatory tasks (5 work + 1 groceries + 1 petrol). You have ~4 free actions. Use them wisely — bank visits, Claude scenarios, restaurants.",
    urgency: "low",
  });

  // Bank visit reminder
  if (!ctx.weeklyObjectivesPaidDebt && ctx.debt > 0 && ctx.money >= 200) {
    tips.push({
      icon: "🏦",
      title: "Visit the bank this week!",
      body: `You can afford the RM 200 extra payment → +20 credit score. Over 4 weeks that's +60 credit — the difference between getting a car loan or not.`,
      urgency: "medium",
    });
  }

  // Low money
  if (ctx.money < 200) {
    tips.push({
      icon: "💸",
      title: "Cash running low",
      body: "You have less than RM 200. Prioritise mandatory objectives (work, groceries, petrol). Skip the bank extra payment this week — surviving comes first.",
      urgency: "high",
    });
  }

  // High stress
  if (ctx.stress > 65) {
    tips.push({
      icon: "🧠",
      title: "Burnout approaching",
      body: `Your stress is at ${ctx.stress}%. Work adds +35 stress this week alone. You MUST take an active weekend activity — not just rest/skip. Penang Hill (RM 30) gives −30 stress.`,
      urgency: ctx.stress > 80 ? "high" : "medium",
    });
  }

  // Low health
  if (ctx.health < 50) {
    tips.push({
      icon: "❤️",
      title: "Health declining",
      body: "Switch to healthy groceries (RM 50 instead of RM 30) for +10 health recovery per week. Restaurants are energy-free visits that can also help.",
      urgency: ctx.health < 30 ? "high" : "medium",
    });
  }

  // Low credit
  if (ctx.creditScore < 620) {
    tips.push({
      icon: "🎯",
      title: "Credit score is low",
      body: "Below 620 makes future loans expensive. Focus on: (1) never miss auto-instalment, (2) extra bank payment every week. Avoid applying for work leave.",
      urgency: "medium",
    });
  }

  // Week 3+ difficulty warning
  if (ctx.currentWeek >= 3) {
    tips.push({
      icon: "⚠️",
      title: "Full debt pressure is on",
      body: "From Week 3, full instalment kicks in + random events get harder. Focus on completing mandatory objectives first, then use free energy for Claude scenarios.",
      urgency: "medium",
    });
  }

  // Restaurant tip
  tips.push({
    icon: "🍽️",
    title: "Restaurant = free energy",
    body: "Restaurant visits don't cost energy! They're a free health/stress adjustment. Use them between mandatory visits to recover stats without burning an action.",
    urgency: "low",
  });

  return tips.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.urgency] - order[b.urgency];
  });
}

// ─────────────────────────────────────────────
// Week Progress Indicator
// ─────────────────────────────────────────────
function WeekProgressBar({ currentWeek }: { currentWeek: number }) {
  const weeks = [
    { label: "Week 1", sub: "Grace period", colour: "bg-emerald-500", debt: "33%" },
    { label: "Week 2", sub: "Ramping up", colour: "bg-yellow-500", debt: "67%" },
    { label: "Week 3", sub: "Full pressure", colour: "bg-orange-500", debt: "100%" },
    { label: "Week 4", sub: "Final crunch", colour: "bg-red-500", debt: "100%" },
  ];

  return (
    <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/50 mb-4">
      <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Difficulty Ramp</p>
      <div className="flex gap-1">
        {weeks.map((w, i) => (
          <div key={i} className="flex-1">
            <div
              className={`h-1.5 rounded-full mb-1 ${i + 1 <= currentWeek ? w.colour : "bg-slate-700"}`}
            />
            <p className={`text-xs font-bold ${i + 1 === currentWeek ? "text-white" : "text-slate-500"}`}>
              {w.label}
            </p>
            <p className={`text-xs ${i + 1 === currentWeek ? "text-cyan-400" : "text-slate-600"}`}>
              {w.sub}
            </p>
            <p className={`text-xs font-mono ${i + 1 === currentWeek ? "text-orange-400" : "text-slate-600"}`}>
              Debt: {w.debt}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
interface InfoSidebarProps {
  personaId: string;
  currentWeek: number;
  money: number;
  debt: number;
  creditScore: number;
  health: number;
  stress: number;
  weeklyObjectivesPaidDebt: boolean;
}

export function InfoSidebar({
  personaId,
  currentWeek,
  money,
  debt,
  creditScore,
  health,
  stress,
  weeklyObjectivesPaidDebt,
}: InfoSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"places" | "stats" | "tips">("places");

  const tips = getContextualTips({ money, debt, creditScore, health, stress, currentWeek, weeklyObjectivesPaidDebt });
  const urgentTipCount = tips.filter(t => t.urgency === "high").length;

  const tabs = [
    { id: "places" as const, label: "Places", icon: MapPin },
    { id: "stats" as const, label: "Stats", icon: BarChart3 },
    { id: "tips" as const, label: "Tips", icon: Lightbulb, badge: urgentTipCount },
  ];

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 flex items-center gap-2 px-3 py-2.5 md:px-4 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/40 border border-cyan-400/30 transition-colors"
      >
        <HelpCircle className="w-5 h-5 md:w-4 md:h-4" />
        <span className="hidden sm:inline text-sm font-bold">Game Guide</span>
        {urgentTipCount > 0 && (
          <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
            {urgentTipCount}
          </span>
        )}
      </motion.button>

      {/* Panel overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Sidebar panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 h-full w-[360px] max-w-[95vw] z-50 bg-slate-900/98 border-l border-cyan-500/20 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
                <div>
                  <h2 className="text-lg font-bold text-white">Game Guide</h2>
                  <p className="text-xs text-slate-400">Week {currentWeek} of 4</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-700/50">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium relative transition-colors ${
                        isActive
                          ? "text-cyan-400 bg-cyan-500/10"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/30"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                      {tab.badge && tab.badge > 0 && (
                        <span className="w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                          {tab.badge}
                        </span>
                      )}
                      {isActive && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Content — scrollable */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">

                {/* ── PLACES TAB ── */}
                {activeTab === "places" && (
                  <>
                    <WeekProgressBar currentWeek={currentWeek} />

                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-red-900/50 text-red-300 px-2 py-0.5 rounded font-mono">REQUIRED</span>
                      <span className="text-xs text-slate-500">= must complete every week</span>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded font-mono">BONUS</span>
                      <span className="text-xs text-slate-500">= optional, but rewarding</span>
                    </div>

                    {LOCATION_GUIDE.map(loc => {
                      const Icon = loc.icon;
                      return (
                        <div
                          key={loc.id}
                          className={`rounded-lg border p-3 ${loc.bgColour}`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className={`w-4 h-4 ${loc.iconColour}`} />
                            <span className="font-bold text-white text-sm">{loc.name}</span>
                            <span className={`ml-auto text-xs px-1.5 py-0.5 rounded font-mono ${loc.badgeColour}`}>
                              {loc.badge}
                            </span>
                          </div>

                          <div className="space-y-1 text-xs mb-2">
                            <div className="flex items-start gap-1.5 text-slate-400">
                              <TrendingDown className="w-3 h-3 mt-0.5 text-red-400 flex-shrink-0" />
                              <span>{loc.cost}</span>
                            </div>
                            <div className="flex items-start gap-1.5 text-slate-400">
                              <TrendingUp className="w-3 h-3 mt-0.5 text-emerald-400 flex-shrink-0" />
                              <span>{loc.reward}</span>
                            </div>
                          </div>

                          {loc.effects.map((e, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-xs text-slate-400 mb-1">
                              <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-slate-600" />
                              <span>{e}</span>
                            </div>
                          ))}

                          <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-start gap-1.5 text-xs text-cyan-300">
                            <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0 text-cyan-400" />
                            <span>{loc.tip}</span>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}

                {/* ── STATS TAB ── */}
                {activeTab === "stats" && (
                  <>
                    <p className="text-xs text-slate-400 mb-2">
                      Hover the ⚡ icon in the game to see the energy breakdown tooltip.
                    </p>
                    {STATS_GUIDE.map(stat => (
                      <div
                        key={stat.id}
                        className={`rounded-lg border p-3 ${stat.bgColour}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{stat.emoji}</span>
                          <span className={`font-bold text-sm ${stat.colour}`}>{stat.label}</span>
                        </div>

                        <p className="text-xs text-slate-300 mb-2">{stat.description}</p>

                        <div className="space-y-1 mb-2">
                          <p className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> Goes up when:
                          </p>
                          {stat.up.map((u, i) => (
                            <p key={i} className="text-xs text-slate-400 pl-4">{u}</p>
                          ))}
                        </div>

                        <div className="space-y-1 mb-2">
                          <p className="text-xs font-bold text-red-400 flex items-center gap-1">
                            <TrendingDown className="w-3 h-3" /> Goes down when:
                          </p>
                          {stat.down.map((d, i) => (
                            <p key={i} className="text-xs text-slate-400 pl-4">{d}</p>
                          ))}
                        </div>

                        <div className="mt-2 pt-2 border-t border-slate-700/50 space-y-1.5">
                          <div className="flex items-start gap-1.5 text-xs text-orange-300">
                            <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0 text-orange-400" />
                            <span>{stat.danger}</span>
                          </div>
                          <div className="flex items-start gap-1.5 text-xs text-cyan-300">
                            <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0 text-cyan-400" />
                            <span>{stat.realLife}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {/* ── TIPS TAB ── */}
                {activeTab === "tips" && (
                  <>
                    <p className="text-xs text-slate-400 mb-2">
                      These tips update based on your current game state.
                    </p>
                    {tips.map((tip, i) => (
                      <div
                        key={i}
                        className={`rounded-lg border p-3 ${
                          tip.urgency === "high"
                            ? "bg-red-900/20 border-red-500/40"
                            : tip.urgency === "medium"
                            ? "bg-amber-900/20 border-amber-500/30"
                            : "bg-slate-800/60 border-slate-700/40"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-base">{tip.icon}</span>
                          <span className={`font-bold text-sm ${
                            tip.urgency === "high"
                              ? "text-red-300"
                              : tip.urgency === "medium"
                              ? "text-amber-300"
                              : "text-cyan-300"
                          }`}>
                            {tip.title}
                          </span>
                          {tip.urgency === "high" && (
                            <span className="ml-auto text-xs bg-red-900/50 text-red-300 px-1.5 py-0.5 rounded font-mono">
                              URGENT
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{tip.body}</p>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-slate-700/50 text-center">
                <p className="text-xs text-slate-500">
                  Tap anywhere outside to close
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
