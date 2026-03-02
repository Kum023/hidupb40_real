"use client";

import { motion, AnimatePresence } from "framer-motion";
import { UtensilsCrossed, Heart, Brain, Flame, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  calories: number;
  nutrition: {
    protein: "Low" | "Medium" | "High";
    carbs: "Low" | "Medium" | "High";
    sodium: "Low" | "Medium" | "High";
  };
  healthChange: number;
  stressChange: number;
  description: string;
}

// Restaurant menus for different personas
export const RESTAURANT_MENUS: Record<string, MenuItem[]> = {
  freshGrad: [
    {
      id: "nasi_ayam_penyet",
      name: "Nasi Ayam Penyet",
      price: 12,
      calories: 650,
      nutrition: { protein: "High", carbs: "Medium", sodium: "Medium" },
      healthChange: 5,
      stressChange: -10,
      description: "Smashed fried chicken with sambal, a KL favorite",
    },
    {
      id: "maggi_goreng",
      name: "Maggi Goreng Special",
      price: 8,
      calories: 850,
      nutrition: { protein: "Low", carbs: "High", sodium: "High" },
      healthChange: -5,
      stressChange: -15,
      description: "Comfort food after a long day at work",
    },
    {
      id: "nasi_campur",
      name: "Nasi Campur",
      price: 10,
      calories: 700,
      nutrition: { protein: "Medium", carbs: "Medium", sodium: "Medium" },
      healthChange: 3,
      stressChange: -8,
      description: "Mixed rice with various side dishes",
    },
    {
      id: "roti_canai",
      name: "Roti Canai + Teh Tarik",
      price: 6,
      calories: 450,
      nutrition: { protein: "Low", carbs: "High", sodium: "Low" },
      healthChange: 0,
      stressChange: -12,
      description: "Classic Malaysian breakfast, anytime comfort",
    },
  ],
  singleParent: [
    {
      id: "nasi_kandar",
      name: "Nasi Kandar (for 2)",
      price: 18,
      calories: 800,
      nutrition: { protein: "High", carbs: "High", sodium: "High" },
      healthChange: 2,
      stressChange: -15,
      description: "Penang famous! Share with your child",
    },
    {
      id: "char_kuey_teow",
      name: "Char Kuey Teow",
      price: 10,
      calories: 750,
      nutrition: { protein: "Medium", carbs: "High", sodium: "High" },
      healthChange: -3,
      stressChange: -12,
      description: "Penang street food classic",
    },
    {
      id: "economy_rice",
      name: "Economy Rice (2 pax)",
      price: 14,
      calories: 650,
      nutrition: { protein: "Medium", carbs: "Medium", sodium: "Medium" },
      healthChange: 3,
      stressChange: -8,
      description: "Affordable meal for you and your kid",
    },
    {
      id: "mee_goreng_mamak",
      name: "Mee Goreng Mamak",
      price: 7,
      calories: 600,
      nutrition: { protein: "Low", carbs: "High", sodium: "Medium" },
      healthChange: -2,
      stressChange: -10,
      description: "Quick and satisfying meal",
    },
  ],
};

interface RestaurantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFood: (menuItem: MenuItem) => void;
  currentMoney: number;
  personaId: string;
  restaurantName: string;
}

export function RestaurantDialog({
  isOpen,
  onClose,
  onSelectFood,
  currentMoney,
  personaId,
  restaurantName,
}: RestaurantDialogProps) {
  const menu = RESTAURANT_MENUS[personaId] || RESTAURANT_MENUS.freshGrad;

  const getNutritionColor = (level: "Low" | "Medium" | "High", isGood: boolean) => {
    if (level === "High") return isGood ? "text-emerald-400" : "text-red-400";
    if (level === "Medium") return "text-amber-400";
    return isGood ? "text-red-400" : "text-emerald-400";
  };

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
            className="bg-gradient-to-br from-orange-950 via-slate-900 to-orange-950 rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto border-2 border-orange-500/30 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-orange-500/20">
                  <UtensilsCrossed className="w-8 h-8 text-orange-400" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-orange-400">
                    {restaurantName}
                  </p>
                  <h2 className="text-xl font-bold text-white">Restaurant Menu</h2>
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

            {/* No Energy Cost Notice */}
            <div className="bg-cyan-900/30 border border-cyan-500/30 rounded-lg p-3 mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              <p className="text-cyan-300 text-sm">
                <span className="font-bold">No energy cost!</span> Eating here only costs money and affects your health/stress.
              </p>
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {menu.map((item) => {
                const canAfford = currentMoney >= item.price;
                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: canAfford ? 1.02 : 1 }}
                    className={`relative rounded-xl border-2 p-4 cursor-pointer transition-all ${
                      canAfford
                        ? "border-orange-500/50 bg-slate-800/50 hover:border-orange-400"
                        : "border-slate-600/50 bg-slate-800/30 opacity-60 cursor-not-allowed"
                    }`}
                    onClick={() => canAfford && onSelectFood(item)}
                  >
                    {/* Name and Price */}
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-white">{item.name}</h3>
                      <span className="text-xl font-bold text-orange-400">RM{item.price}</span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-slate-400 mb-3">{item.description}</p>

                    {/* Calories */}
                    <div className="flex items-center gap-2 mb-3">
                      <Flame className="w-4 h-4 text-orange-400" />
                      <span className="text-sm text-slate-300">{item.calories} calories</span>
                    </div>

                    {/* Nutrition */}
                    <div className="flex gap-3 text-xs mb-3">
                      <span className={getNutritionColor(item.nutrition.protein, true)}>
                        Protein: {item.nutrition.protein}
                      </span>
                      <span className={getNutritionColor(item.nutrition.carbs, false)}>
                        Carbs: {item.nutrition.carbs}
                      </span>
                      <span className={getNutritionColor(item.nutrition.sodium, false)}>
                        Sodium: {item.nutrition.sodium}
                      </span>
                    </div>

                    {/* Effects */}
                    <div className="border-t border-slate-700 pt-3 flex gap-4">
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4 text-pink-400" />
                        <span className={`font-mono text-sm ${item.healthChange >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {item.healthChange >= 0 ? "+" : ""}{item.healthChange}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Brain className="w-4 h-4 text-purple-400" />
                        <span className={`font-mono text-sm ${item.stressChange <= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {item.stressChange >= 0 ? "+" : ""}{item.stressChange}%
                        </span>
                      </div>
                    </div>

                    {!canAfford && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                        <span className="text-red-400 font-bold">Not enough money</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Current Money Display */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">
                Your money: <span className="text-emerald-400 font-bold">RM{currentMoney}</span>
              </span>
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-slate-400 hover:text-white"
              >
                Leave without ordering
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
