"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PERSONAS, PersonaId } from "@/lib/constants";
import { useMutation } from "convex/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "@/convex/_generated/api";

const PLAYER_NAME_KEY = "b40_player_name";
const GAME_ID_KEY = "b40_current_game_id";

export default function SetupPage() {
  const router = useRouter();
  const [selectedPersona, setSelectedPersona] = useState<PersonaId | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [showNameInput, setShowNameInput] = useState(true);
  const createGame = useMutation(api.games.createGame);

  // Check localStorage for saved name on mount
  useEffect(() => {
    const savedName = localStorage.getItem(PLAYER_NAME_KEY);
    if (savedName) {
      setPlayerName(savedName);
      setShowNameInput(false);
    }
  }, []);

  const handleSaveName = () => {
    if (playerName.trim().length < 2) return;
    localStorage.setItem(PLAYER_NAME_KEY, playerName.trim());
    setShowNameInput(false);
  };

  const handleChangeName = () => {
    setShowNameInput(true);
  };

  const handleStartGame = async () => {
    if (!selectedPersona || !playerName.trim()) return;

    setIsCreating(true);
    setError(null);
    try {
      const persona = PERSONAS[selectedPersona];
      const gameId = await createGame({
        playerName: playerName.trim(),
        personaId: selectedPersona,
        initialMoney: persona.initialMoney,
        initialDebt: persona.initialDebt,
        initialCreditScore: persona.initialCreditScore,
      });
      localStorage.setItem(GAME_ID_KEY, gameId);
      router.push("/game");
    } catch (err) {
      console.error("Failed to create game:", err);
      setIsCreating(false);
      const msg = err instanceof Error ? err.message : String(err);
      setError(
        msg.includes("Could not find public function")
          ? "Backend not synced. Run 'npx convex dev' in the project folder, then try again."
          : "Failed to start game. Try again."
      );
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Hidup B40</h1>
          <p className="text-slate-400">Experience financial decisions through lived experience</p>
        </motion.div>

        {/* Player Name Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          {showNameInput ? (
            <Card className="bg-slate-800/50 border-slate-700 max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="text-white text-lg">Enter Your Name</CardTitle>
                <CardDescription className="text-slate-400">
                  This will be shown on the leaderboard
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Your name"
                  value={playerName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlayerName(e.target.value)}
                  className="bg-slate-900 border-slate-600 text-white"
                  maxLength={20}
                  onKeyDown={(e: React.KeyboardEvent) => e.key === "Enter" && handleSaveName()}
                />
                <Button
                  onClick={handleSaveName}
                  disabled={playerName.trim().length < 2}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  Continue
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center">
              <p className="text-slate-400 mb-2">
                Playing as <span className="text-emerald-400 font-bold">{playerName}</span>
              </p>
              <button
                onClick={handleChangeName}
                className="text-xs text-slate-500 hover:text-slate-300 underline"
              >
                Change name
              </button>
            </div>
          )}
        </motion.div>

        {!showNameInput && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mb-6"
            >
              <h2 className="text-xl font-bold text-white">Choose Your Story</h2>
              <p className="text-slate-400 text-sm">Each path has its own challenges</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 mb-8 max-w-2xl mx-auto">
          {(Object.entries(PERSONAS) as [PersonaId, typeof PERSONAS[PersonaId]][]).map(
            ([id, persona], index) => (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    selectedPersona === id
                      ? "ring-2 ring-emerald-500 bg-slate-800"
                      : "bg-slate-800/50 hover:bg-slate-800"
                  }`}
                  onClick={() => setSelectedPersona(id)}
                >
                  <CardHeader>
                    <CardTitle className="text-white">{persona.name}</CardTitle>
                    <CardDescription className="text-slate-400">
                      {persona.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-slate-300 text-sm">{persona.description}</p>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Monthly Salary</span>
                        <span className="text-emerald-400">RM {persona.monthlySalary}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Starting Cash</span>
                        <span className="text-white">RM {persona.initialMoney}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Debt ({persona.debtType})</span>
                        <span className="text-red-400">RM {persona.initialDebt.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Credit Score</span>
                        <span className={
                          persona.initialCreditScore >= 650 ? "text-emerald-400" :
                          persona.initialCreditScore >= 600 ? "text-yellow-400" :
                          "text-red-400"
                        }>
                          {persona.initialCreditScore}
                        </span>
                      </div>
                    </div>

                    {selectedPersona === id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="pt-2 border-t border-slate-700"
                      >
                        <p className="text-slate-300 text-xs italic">
                          {persona.backstory}
                        </p>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          )}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center space-y-3"
            >
              {error && (
                <p className="text-sm text-amber-400 bg-amber-400/10 border border-amber-500/30 rounded-lg px-4 py-2 max-w-md mx-auto">
                  {error}
                </p>
              )}
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                disabled={!selectedPersona || isCreating}
                onClick={handleStartGame}
              >
                {isCreating ? "Starting..." : "Begin Your Journey"}
              </Button>
            </motion.div>
          </>
        )}
      </div>
    </main>
  );
}
