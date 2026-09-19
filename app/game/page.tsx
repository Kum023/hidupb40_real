"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { GameMap } from "@/components/game/GameMap";
import { StatsBar } from "@/components/game/StatsBar";
import { LocationDialog } from "@/components/game/LocationDialog";
import { SpecialEventDialog } from "@/components/game/SpecialEventDialog";
import { WeekendDialog } from "@/components/game/WeekendDialog";
import { GameOverDialog } from "@/components/game/GameOverDialog";
import { TutorialDialog } from "@/components/game/TutorialDialog";
import { LeaveDialog } from "@/components/game/LeaveDialog";
import { GroceryDialog } from "@/components/game/GroceryDialog";
import { RestaurantDialog, MenuItem, RESTAURANT_MENUS } from "@/components/game/RestaurantDialog";
import { InfoSidebar } from "@/components/game/InfoSidebar";
import { Button } from "@/components/ui/button";
import { useAudio } from "@/components/providers/AudioProvider";
import { Id } from "@/convex/_generated/dataModel";
import { LocationId, PERSONA_MAPS, KL_MAP, SPECIAL_EVENTS, WEEKEND_ACTIVITIES, PERSONAS, WEEKLY_FINANCES } from "@/lib/constants";
import { Scenario, SpecialEvent, WeekendActivity } from "@/lib/types";
import { motion } from "framer-motion";
import { Loader2, RotateCcw, Calendar, CreditCard } from "lucide-react";
import { useT } from "@/lib/translations";
import { useLanguage } from "@/lib/LanguageContext";

const GAME_ID_KEY = "b40_current_game_id";

export default function GamePage() {
  const router = useRouter();
  const t = useT();
  const { lang } = useLanguage();

  // Get gameId from localStorage to prevent character switching bug
  const [gameId, setGameId] = useState<Id<"games"> | null>(null);
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);

  useEffect(() => {
    const storedGameId = localStorage.getItem(GAME_ID_KEY);
    if (storedGameId) {
      setGameId(storedGameId as Id<"games">);
    }
    setHasCheckedStorage(true);
  }, []);

  const game = useQuery(api.games.getGame, gameId ? { gameId } : "skip");
  const recentDecisions = useQuery(
    api.games.getRecentDecisions,
    game ? { gameId: game._id, limit: 5 } : "skip"
  );
  const weekComplete = useQuery(
    api.games.checkWeekComplete,
    game ? { gameId: game._id } : "skip"
  );

  const moveToLocation = useMutation(api.games.moveToLocation);
  const updateGameState = useMutation(api.games.updateGameState);
  const recordDecision = useMutation(api.games.recordDecision);
  const completeObjective = useMutation(api.games.completeObjective);
  const triggerRandomEvent = useMutation(api.games.triggerRandomEvent);
  const selectWeekendActivity = useMutation(api.games.selectWeekendActivity);
  const advanceDay = useMutation(api.games.advanceDay);
  const resetGame = useMutation(api.games.resetGame);
  const eatAtRestaurant = useMutation(api.games.eatAtRestaurant);
  const generateScenario = useAction(api.ai.generateScenario);
  const updateLiveScore = useMutation(api.leaderboard.updateLiveScore);
  const syncWeeklyProgress = useAction(api.tidbSync.syncWeeklyProgress);
  const syncCompletedGame = useAction(api.tidbSync.syncCompletedGame);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // New game flow states
  const [showSpecialEvent, setShowSpecialEvent] = useState(false);
  const [currentSpecialEvent, setCurrentSpecialEvent] = useState<SpecialEvent | null>(null);
  const [showWeekendDialog, setShowWeekendDialog] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [pendingEventCheck, setPendingEventCheck] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showGroceryDialog, setShowGroceryDialog] = useState(false);
  const [showRestaurantDialog, setShowRestaurantDialog] = useState(false);
  const [currentRestaurantName, setCurrentRestaurantName] = useState("");

  // Audio management - set danger mode based on game state
  const { setDangerMode } = useAudio();

  // Update danger mode when game state changes
  useEffect(() => {
    if (game) {
      const energy = game.energyRemaining ?? 11;
      const isInDanger = game.health < 30 || game.stress > 70 || energy <= 2;
      setDangerMode(isInDanger);
    }
  }, [game, setDangerMode]);

  // Track if we've already checked tutorial for this game session
  const tutorialCheckedRef = useRef<string | null>(null);

  // Show tutorial on first play (week 1, day 1) - only check once per game
  // Fixed: Use specific dependencies to prevent repeated triggers
  useEffect(() => {
    if (!game) return;
    if (tutorialCheckedRef.current === game._id) return;

    if (game.currentWeek === 1 && game.currentDay === 1) {
      tutorialCheckedRef.current = game._id;
      const tutorialShown = localStorage.getItem(`tutorial_${game._id}`);
      if (!tutorialShown) {
        setShowTutorial(true);
      }
    }
  }, [game?._id, game?.currentWeek, game?.currentDay]);

  const handleCloseTutorial = useCallback(() => {
    if (game) {
      localStorage.setItem(`tutorial_${game._id}`, "true");
    }
    setShowTutorial(false);
  }, [game]);

  // Redirect if no game or no gameId in localStorage (only after checking storage)
  useEffect(() => {
    if (!hasCheckedStorage) return; // Wait until we've checked localStorage

    if (game === null || !gameId) {
      // Clear any stale gameId if game not found
      if (game === null && gameId) {
        localStorage.removeItem(GAME_ID_KEY);
      }
      router.push("/setup");
    }
  }, [game, gameId, router, hasCheckedStorage]);

  // Check for game over and sync to TiDB
  useEffect(() => {
    if (game?.isGameOver && !showGameOver) {
      setShowGameOver(true);

      // Sync weekly progress first (in case game over happened mid-week)
      syncWeeklyProgress({
        gameId: game._id,
        weekCompleted: game.currentWeek,
        weekendActivity: "game_over",
      })
        .then((result) => {
          if (result.success) {
            console.log(`Week ${game.currentWeek} synced to TiDB (game over)`);
          }
        })
        .catch((err) => {
          console.warn("TiDB weekly sync error:", err);
        });

      // Sync completed game to TiDB (fire and forget)
      syncCompletedGame({ gameId: game._id })
        .then((result) => {
          if (result.success) {
            console.log("Completed game synced to TiDB");
          } else {
            console.warn("Failed to sync completed game:", result.error);
          }
        })
        .catch((err) => {
          console.warn("TiDB completed game sync error:", err);
        });
    }
  }, [game?._id, game?.isGameOver, game?.currentWeek, showGameOver, syncCompletedGame, syncWeeklyProgress]);

  // REMOVED: Auto-weekend trigger - user must click "Next Day" or "Weekend Time" button
  // Weekend dialog is now only shown via handleNextDay or the Weekend Time button

  // Get random event for current persona
  const getRandomEvent = useCallback((): SpecialEvent | null => {
    if (!game) return null;

    const persona = game.personaId as keyof typeof SPECIAL_EVENTS;
    const events = SPECIAL_EVENTS[persona];
    if (!events) return null;

    // Progressive difficulty: event pool shifts by week.
    // Week 1 = positive only (grace period, gentle learning curve).
    // Week 2 = positive + neutral (reality starts).
    // Week 3-4 = negative events 2× weighted (real life pressure).
    let pool: SpecialEvent[];
    if (game.currentWeek === 1) {
      pool = [...events.positive] as SpecialEvent[];
    } else if (game.currentWeek === 2) {
      pool = [...events.positive, ...(events.neutral ?? [])] as SpecialEvent[];
    } else {
      // Weeks 3-4: negative events appear twice as often
      pool = [
        ...events.negative,
        ...events.negative,
        ...events.positive,
        ...(events.neutral ?? []),
      ] as SpecialEvent[];
    }

    if (pool.length === 0) pool = [...events.negative, ...events.positive] as SpecialEvent[];
    return pool[Math.floor(Math.random() * pool.length)];
  }, [game]);

  // Check for random event trigger after action
  const checkForRandomEvent = useCallback(() => {
    if (!game) return;

    const eventDay = game.weeklyEventDay ?? Math.floor(Math.random() * 5) + 1;
    const eventTriggered = game.weeklyEventTriggered ?? false;

    // Only trigger on the designated event day and if not already triggered
    if (
      game.currentDay === eventDay &&
      !eventTriggered &&
      !showSpecialEvent
    ) {
      const event = getRandomEvent();
      if (event) {
        setCurrentSpecialEvent(event);
        setShowSpecialEvent(true);
      }
    }
  }, [game, showSpecialEvent, getRandomEvent]);

  // Handle random event continue
  const handleEventContinue = useCallback(async () => {
    if (!game || !currentSpecialEvent) return;

    try {
      await triggerRandomEvent({
        gameId: game._id,
        eventId: currentSpecialEvent.id,
        moneyChange: currentSpecialEvent.moneyChange,
        stressChange: currentSpecialEvent.stressChange,
        healthChange: currentSpecialEvent.healthChange,
      });

      setShowSpecialEvent(false);
      setCurrentSpecialEvent(null);
    } catch (error) {
      console.error("Failed to process event:", error);
    }
  }, [game, currentSpecialEvent, triggerRandomEvent]);

  // Handle weekend activity selection
  const handleWeekendActivity = useCallback(
    async (activity: WeekendActivity) => {
      if (!game) return;

      const weekCompleted = game.currentWeek; // Capture the week being completed

      try {
        const result = await selectWeekendActivity({
          gameId: game._id,
          activityId: activity.id,
          moneyCost: activity.moneyCost,
          stressChange: activity.stressChange,
          healthChange: activity.healthChange,
        });

        setShowWeekendDialog(false);

        // Sync weekly progress to TiDB (fire and forget - don't block UI)
        syncWeeklyProgress({
          gameId: game._id,
          weekCompleted: weekCompleted,
          weekendActivity: activity.id,
        }).then((syncResult) => {
          if (syncResult.success) {
            console.log(`Week ${weekCompleted} synced to TiDB successfully`);
          } else {
            console.warn(`Week ${weekCompleted} TiDB sync failed:`, syncResult.error);
          }
        }).catch((err) => {
          console.warn("TiDB sync error (non-blocking):", err);
        });

        if (result.isGameOver) {
          setShowGameOver(true);
        }
      } catch (error) {
        console.error("Failed to process weekend activity:", error);
      }
    },
    [game, selectWeekendActivity, syncWeeklyProgress]
  );

  // Check if location is a restaurant
  const isRestaurantLocation = useCallback((locationId: string) => {
    return locationId === "fancy_restaurant" || locationId === "restaurant";
  }, []);

  const handleLocationClick = useCallback(
    async (locationId: LocationId) => {
      const energy = game?.energyRemaining ?? 11;
      if (!game || isGenerating) return;

      // Get location info to check objective type
      const mapData = PERSONA_MAPS[game.personaId] || KL_MAP;
      const locationInfo = mapData.locations[locationId];

      // Check if this is a weekend-only location on a weekday (except restaurants which are now daily)
      if (locationInfo?.isWeekendOnly && game.currentDay <= 5) {
        return; // Can't visit weekend locations on weekdays
      }

      // Handle restaurant clicks - no energy cost, show menu dialog
      if (isRestaurantLocation(locationId)) {
        setCurrentRestaurantName(locationInfo?.name || "Restaurant");
        setShowRestaurantDialog(true);
        return;
      }

      // Check energy for non-restaurant locations
      if (energy <= 0) return;

      // Handle shop/grocery location - show choice dialog instead of auto-complete
      const objectives = game.weeklyObjectives ?? { boughtGroceries: false };
      if (locationId === "shop" && !objectives.boughtGroceries) {
        // Always costs energy to interact (move or stay)
        try {
          const moveResult = await moveToLocation({ gameId: game._id, location: locationId });
          if (moveResult.isGameOver) {
            setShowGameOver(true);
            return;
          }
        } catch (error) {
          console.error("Failed to interact with shop:", error);
          return;
        }
        // Show grocery dialog
        setShowGroceryDialog(true);
        return;
      }

      // If clicking current location, still costs energy for interaction
      if (locationId === game.currentLocation) {
        // Deduct energy for interacting with location (even if already there)
        try {
          const moveResult = await moveToLocation({ gameId: game._id, location: locationId });
          if (moveResult.isGameOver) {
            setShowGameOver(true);
            return;
          }
        } catch (error) {
          console.error("Failed to interact with location:", error);
          return;
        }

        // Still check if this location completes an objective (e.g., work at office)
        const weeklyObjectives = game.weeklyObjectives ?? { workDaysCompleted: 0, boughtGroceries: false, filledPetrol: false, paidDebt: false };
        const canCompleteWork = locationInfo?.objectiveType === "work" && !game.workedToday && weeklyObjectives.workDaysCompleted < 5;
        const canCompleteOther = locationInfo?.objectiveType && locationInfo.objectiveType !== "groceries" && (locationInfo.objectiveType !== "work" || canCompleteWork);
        if (canCompleteOther && locationInfo.objectiveType) {
          try {
            const result = await completeObjective({
              gameId: game._id,
              objectiveType: locationInfo.objectiveType,
            });
            if (result.isGameOver) {
              setShowGameOver(true);
              return;
            }
          } catch (error) {
            if (error instanceof Error && error.message.includes("Not enough money")) {
              alert("Not enough money to pay debt! You need more cash first.");
              return;
            }
          }
        }

        setDialogOpen(true);
        setIsGenerating(true);

        try {
          const scenario = await generateScenario({
            personaId: game.personaId,
            location: locationId,
            money: game.money,
            debt: game.debt,
            creditScore: game.creditScore,
            health: game.health,
            stress: game.stress,
            week: game.currentWeek,
            day: game.currentDay,
            recentDecisions:
              recentDecisions?.map((d) => ({
                choiceText: d.choiceText,
                location: d.location,
                week: d.week,
              })) || [],
            language: lang,
          });
          setCurrentScenario(scenario as Scenario);
        } catch (error) {
          console.error("Failed to generate scenario:", error);
        } finally {
          setIsGenerating(false);
        }
        return;
      }

      // Move to new location (costs 1 energy)
      try {
        await moveToLocation({ gameId: game._id, location: locationId });

        // Check if this location completes an objective (skip groceries - handled by dialog)
        const weeklyObjectivesForMove = game.weeklyObjectives ?? { workDaysCompleted: 0, boughtGroceries: false, filledPetrol: false, paidDebt: false };
        const canCompleteWorkMove = locationInfo?.objectiveType === "work" && !game.workedToday && weeklyObjectivesForMove.workDaysCompleted < 5;
        const canCompleteOtherMove = locationInfo?.objectiveType && locationInfo.objectiveType !== "groceries" && (locationInfo.objectiveType !== "work" || canCompleteWorkMove);
        if (canCompleteOtherMove && locationInfo.objectiveType) {
          try {
            const result = await completeObjective({
              gameId: game._id,
              objectiveType: locationInfo.objectiveType,
            });
            if (result.isGameOver) {
              setShowGameOver(true);
              return;
            }
          } catch (error) {
            if (error instanceof Error && error.message.includes("Not enough money")) {
              alert("Not enough money to pay debt! You need more cash first.");
            }
          }
        }

        // Generate scenario for new location
        setDialogOpen(true);
        setIsGenerating(true);

        const scenario = await generateScenario({
          personaId: game.personaId,
          location: locationId,
          money: game.money,
          debt: game.debt,
          creditScore: game.creditScore,
          health: game.health,
          stress: game.stress,
          week: game.currentWeek,
          day: game.currentDay,
          recentDecisions:
            recentDecisions?.map((d) => ({
              choiceText: d.choiceText,
              location: d.location,
              week: d.week,
            })) || [],
          language: lang,
        });
        setCurrentScenario(scenario as Scenario);

        // Mark that we need to check for event after dialog closes
        setPendingEventCheck(true);
      } catch (error) {
        console.error("Failed to move or generate scenario:", error);
      } finally {
        setIsGenerating(false);
      }
    },
    [game, recentDecisions, isGenerating, moveToLocation, completeObjective, generateScenario, isRestaurantLocation]
  );

  const handleChoiceSelect = useCallback(
    async (choiceIndex: number) => {
      if (!game || !currentScenario || isProcessing) return;

      const choice = currentScenario.choices[choiceIndex];
      if (!choice) return;

      setIsProcessing(true);

      try {
        // Record the decision (provide defaults for potentially undefined values)
        const moneyChange = choice.consequence.money ?? 0;
        const creditChange = choice.consequence.credit ?? 0;
        const healthChange = choice.consequence.health ?? 0;
        const stressChange = choice.consequence.stress ?? 0;

        await recordDecision({
          gameId: game._id,
          location: currentScenario.location,
          scenarioId: currentScenario.id,
          choiceIndex,
          choiceText: choice.text,
          moneyChange,
          creditChange,
          healthChange,
          stressChange,
          hiddenConsequence: choice.hiddenConsequence,
        });

        // Update game state
        const result = await updateGameState({
          gameId: game._id,
          moneyChange,
          creditChange,
          healthChange,
          stressChange,
        });

        // Update live leaderboard score
        if (game.playerName) {
          const newMoney = game.money + moneyChange;
          await updateLiveScore({
            gameId: game._id,
            playerName: game.playerName,
            personaId: game.personaId,
            score: Math.max(0, newMoney),
            weeksCompleted: game.currentWeek,
          });
        }

        // Close dialog
        setDialogOpen(false);
        setCurrentScenario(null);

        // Check if game over
        if (result.isGameOver) {
          setShowGameOver(true);
        } else if (pendingEventCheck) {
          // Check for random event after dialog closes
          setPendingEventCheck(false);
          setTimeout(() => checkForRandomEvent(), 500);
        }
      } catch (error) {
        console.error("Failed to process choice:", error);
      } finally {
        setIsProcessing(false);
      }
    },
    [game, currentScenario, isProcessing, pendingEventCheck, recordDecision, updateGameState, updateLiveScore, checkForRandomEvent]
  );

  // Handle Next Day button click
  const handleNextDay = useCallback(async () => {
    if (!game) return;

    try {
      const result = await advanceDay({ gameId: game._id });

      if (!result.canAdvance) {
        // Show leave dialog - work not done
        setShowLeaveDialog(true);
        return;
      }

      if (result.shouldShowWeekendDialog) {
        setShowWeekendDialog(true);
      }

      if (result.isGameOver) {
        setShowGameOver(true);
      }
    } catch (error) {
      console.error("Failed to advance day:", error);
    }
  }, [game, advanceDay]);

  // Handle applying leave (skip work with penalty)
  const handleApplyLeave = useCallback(async () => {
    if (!game) return;

    try {
      const result = await advanceDay({ gameId: game._id, applyLeave: true });
      setShowLeaveDialog(false);

      if (result.shouldShowWeekendDialog) {
        setShowWeekendDialog(true);
      }

      if (result.isGameOver) {
        setShowGameOver(true);
      }
    } catch (error) {
      console.error("Failed to apply leave:", error);
    }
  }, [game, advanceDay]);

  // Handle go to work from leave dialog
  const handleGoToWork = useCallback(() => {
    setShowLeaveDialog(false);
    // User will manually navigate to office
  }, []);

  // Handle grocery selection
  const handleGroceryChoice = useCallback(async (type: "groceries_healthy" | "groceries_unhealthy") => {
    if (!game) return;

    try {
      await completeObjective({
        gameId: game._id,
        objectiveType: type,
      });
      setShowGroceryDialog(false);
    } catch (error) {
      if (error instanceof Error && error.message.includes("Not enough money")) {
        alert("Not enough money for groceries!");
      } else if (error instanceof Error && error.message.includes("Already bought")) {
        alert("You've already bought groceries this week!");
        setShowGroceryDialog(false);
      }
    }
  }, [game, completeObjective]);

  // Handle restaurant food selection (no energy cost!)
  const handleRestaurantChoice = useCallback(async (menuItem: MenuItem) => {
    if (!game) return;

    try {
      const result = await eatAtRestaurant({
        gameId: game._id,
        moneyCost: menuItem.price,
        healthChange: menuItem.healthChange,
        stressChange: menuItem.stressChange,
      });
      setShowRestaurantDialog(false);

      if (result.isGameOver) {
        setShowGameOver(true);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("Not enough money")) {
        alert("Not enough money to eat here!");
      }
    }
  }, [game, eatAtRestaurant]);

  // Handle paying debt at the bank
  const handlePayDebt = useCallback(async () => {
    if (!game) return;

    try {
      await completeObjective({
        gameId: game._id,
        objectiveType: "debt",
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Not enough money")) {
        alert("Not enough money to pay debt! You need more cash first.");
      } else if (error instanceof Error && error.message.includes("Already paid")) {
        alert("You've already paid your debt this week!");
      }
    }
  }, [game, completeObjective]);

  const handleResetGame = useCallback(async () => {
    if (!game) return;
    if (!confirm(t("resetConfirm"))) return;

    try {
      await resetGame({ gameId: game._id });
      router.push("/setup");
    } catch (error) {
      console.error("Failed to reset game:", error);
    }
  }, [game, resetGame, router]);

  const handleGameOverRestart = useCallback(async () => {
    if (!game) return;
    try {
      setDangerMode(false); // Reset danger music before navigating away
      await resetGame({ gameId: game._id });
      setShowGameOver(false);
      router.push("/setup");
    } catch (error) {
      console.error("Failed to reset game:", error);
    }
  }, [game, resetGame, router, setDangerMode]);

  const handleMainMenu = useCallback(() => {
    router.push("/");
  }, [router]);

  // Show loading while checking localStorage or loading game
  if (!hasCheckedStorage || game === undefined) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!game) {
    return null;
  }

  // Provide defaults for optional fields (for backwards compatibility with old games)
  // New games have energyRemaining (11), old games should also use 11 as they need new mechanics
  const energyRemaining = game.energyRemaining ?? 11;
  const weeklyObjectives = game.weeklyObjectives ?? {
    workDaysCompleted: 0,
    boughtGroceries: false,
    filledPetrol: false,
    paidDebt: false,
  };
  const weeklyEventDay = game.weeklyEventDay ?? Math.floor(Math.random() * 5) + 1;
  const weeklyEventTriggered = game.weeklyEventTriggered ?? false;

  // Get weekend activities for current persona
  const personaActivities =
    WEEKEND_ACTIVITIES[game.personaId as keyof typeof WEEKEND_ACTIVITIES] ||
    WEEKEND_ACTIVITIES.freshGrad;
  const weekendActivities = Array.isArray(personaActivities) ? personaActivities : [];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <StatsBar
            money={game.money}
            debt={game.debt}
            creditScore={game.creditScore}
            health={game.health}
            stress={game.stress}
            day={game.currentDay}
            week={game.currentWeek}
            energyRemaining={energyRemaining}
            weeklyObjectives={weeklyObjectives}
            workedToday={game.workedToday}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <GameMap
            currentLocation={game.currentLocation as LocationId}
            onLocationClick={handleLocationClick}
            disabled={energyRemaining <= 0 || isGenerating}
            personaId={game.personaId}
            currentDay={game.currentDay}
            weeklyObjectives={weeklyObjectives}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center"
        >
          <div className="text-slate-400 text-sm">
            {t("current")}: {(PERSONA_MAPS[game.personaId] || KL_MAP).locations[game.currentLocation as LocationId]?.name || "Unknown"}
          </div>

          <div className="flex gap-2 items-center">
            {/* Work status indicator */}
            {game.currentDay <= 5 && (
              <div className={`text-xs px-2 py-1 rounded ${
                game.workedToday
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-amber-500/20 text-amber-400"
              }`}>
                {game.workedToday ? t("workedToday") : t("notWorkedYet")}
              </div>
            )}

            {/* Pay Debt (Bank Extra Payment) — available any week at the bank */}
            {game.currentLocation === "bank" &&
             !weeklyObjectives.paidDebt &&
             game.debt > 0 && (
              <Button
                onClick={handlePayDebt}
                className="bg-purple-600 hover:bg-purple-700"
                disabled={isGenerating || isProcessing}
                title="Pay RM 200 extra above your minimum instalment to boost your credit score by +20"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {t("extraPaymentBtn")}
              </Button>
            )}

            {/* Next Day Button - shows work requirement status */}
            {game.currentDay <= 5 && (
              <Button
                onClick={handleNextDay}
                className={game.workedToday ? "bg-blue-600 hover:bg-blue-700" : "bg-amber-600 hover:bg-amber-700"}
                disabled={isGenerating || isProcessing}
                title={game.workedToday ? "Proceed to the next day" : "You need to work first! Click to apply leave or go to office."}
              >
                <Calendar className="w-4 h-4 mr-2" />
                {game.workedToday ? t("nextDay") : t("endDayWorkReq")}
              </Button>
            )}

            {energyRemaining <= 0 && game.currentDay === 5 && weekComplete?.complete && (
              <Button
                onClick={() => setShowWeekendDialog(true)}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                {t("weekendTime")}
              </Button>
            )}
            {energyRemaining <= 0 && !weekComplete?.complete && (
              <div className="text-red-400 text-sm mr-2 flex items-center">
                {t("energyDepleted")}
              </div>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={handleResetGame}
              className="border-slate-600 text-slate-400 hover:text-white hover:border-red-500 hover:bg-red-500/10"
              title="Reset Game"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Location Dialog */}
        <LocationDialog
          open={dialogOpen}
          onClose={() => {
            if (!isProcessing) {
              setDialogOpen(false);
              setCurrentScenario(null);
              if (pendingEventCheck) {
                setPendingEventCheck(false);
                setTimeout(() => checkForRandomEvent(), 500);
              }
            }
          }}
          scenario={currentScenario}
          isLoading={isGenerating}
          onChoiceSelect={handleChoiceSelect}
          isProcessing={isProcessing}
          personaId={game.personaId}
        />

        {/* Special Event Dialog */}
        <SpecialEventDialog
          isOpen={showSpecialEvent}
          event={currentSpecialEvent}
          onContinue={handleEventContinue}
        />

        {/* Weekend Dialog */}
        <WeekendDialog
          isOpen={showWeekendDialog}
          personaId={game.personaId}
          activities={weekendActivities as WeekendActivity[]}
          skipActivity={WEEKEND_ACTIVITIES.skip}
          currentMoney={game.money}
          currentWeek={game.currentWeek}
          paydaySummary={(() => {
            const fin = WEEKLY_FINANCES[game.personaId as keyof typeof WEEKLY_FINANCES];
            if (!fin) return undefined;
            return {
              weeklySalary: fin.weeklySalary,
              weeklyRent: fin.weeklyRent,
              weeklyDebtMin: fin.weeklyDebtMin,
              debtLabel: fin.debtLabel,
              hasDebt: game.debt > 0,
              currentDebt: Math.max(0, game.debt - fin.weeklyDebtMin), // projected after auto-debit
            };
          })()}
          onSelectActivity={handleWeekendActivity}
        />

        {/* Game Over Dialog */}
        <GameOverDialog
          isOpen={showGameOver}
          endingType={game.endingType || "game_over"}
          failureReason={game.failureReason || "Game Over"}
          stats={{
            money: game.money,
            debt: game.debt,
            health: game.health,
            stress: game.stress,
            creditScore: game.creditScore,
            weeksCompleted: game.currentWeek,
          }}
          onRestart={handleGameOverRestart}
          onMainMenu={handleMainMenu}
        />

        {/* Tutorial Dialog */}
        <TutorialDialog
          isOpen={showTutorial}
          onClose={handleCloseTutorial}
          personaName={PERSONAS[game.personaId as keyof typeof PERSONAS]?.name || "Player"}
        />

        {/* Leave Dialog */}
        <LeaveDialog
          isOpen={showLeaveDialog}
          onClose={() => setShowLeaveDialog(false)}
          onApplyLeave={handleApplyLeave}
          onGoToWork={handleGoToWork}
        />

        {/* Grocery Dialog */}
        <GroceryDialog
          isOpen={showGroceryDialog}
          onClose={() => setShowGroceryDialog(false)}
          onSelectGroceries={handleGroceryChoice}
          currentMoney={game.money}
        />

        {/* Restaurant Dialog */}
        <RestaurantDialog
          isOpen={showRestaurantDialog}
          onClose={() => setShowRestaurantDialog(false)}
          onSelectFood={handleRestaurantChoice}
          currentMoney={game.money}
          personaId={game.personaId}
          restaurantName={currentRestaurantName}
        />

        {/* Info Sidebar — floating "Game Guide" button + slide-in panel */}
        <InfoSidebar
          personaId={game.personaId}
          currentWeek={game.currentWeek}
          money={game.money}
          debt={game.debt}
          creditScore={game.creditScore}
          health={game.health}
          stress={game.stress}
          weeklyObjectivesPaidDebt={weeklyObjectives.paidDebt}
        />
      </div>
    </main>

  );
}
