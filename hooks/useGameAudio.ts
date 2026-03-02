"use client";

import { useEffect, useCallback } from "react";
import { GameState } from "@/lib/types";
import { useAudio } from "@/components/providers/AudioProvider";

export function useGameAudio(gameState: GameState | null) {
  const audio = useAudio();

  const isInDanger = useCallback((state: GameState | null): boolean => {
    if (!state) return false;
    return state.health < 30 || state.stress > 70 || state.energyRemaining <= 2;
  }, []);

  useEffect(() => {
    if (gameState) {
      audio.setDangerMode(isInDanger(gameState));
    }
  }, [gameState, audio, isInDanger]);

  return audio;
}
