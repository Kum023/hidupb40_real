"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from "react";

interface AudioContextType {
  volume: number;
  setVolume: (volume: number) => void;
  isMuted: boolean;
  toggleMute: () => void;
  isPlaying: boolean;
  startMusic: () => void;
  setDangerMode: (danger: boolean) => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within AudioProvider");
  }
  return context;
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const normalAudioRef = useRef<HTMLAudioElement | null>(null);
  const dangerAudioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef(false);
  const [volume, setVolumeState] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDanger, setIsDanger] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<"normal" | "danger">("normal");

  // Initialize audio elements
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Create audio elements
    normalAudioRef.current = new Audio("/normal.mp3");
    dangerAudioRef.current = new Audio("/danger.mp3");

    // Set loop
    normalAudioRef.current.loop = true;
    dangerAudioRef.current.loop = true;

    // Load saved settings from localStorage
    const savedVolume = localStorage.getItem("gameVolume");
    const savedMuted = localStorage.getItem("gameMuted");

    if (savedVolume) {
      const vol = parseFloat(savedVolume);
      setVolumeState(vol);
      normalAudioRef.current.volume = vol;
      dangerAudioRef.current.volume = vol;
    } else {
      normalAudioRef.current.volume = 0.5;
      dangerAudioRef.current.volume = 0.5;
    }

    if (savedMuted === "true") {
      setIsMuted(true);
      normalAudioRef.current.muted = true;
      dangerAudioRef.current.muted = true;
    }

    // Try to autoplay, if blocked wait for user interaction
    const tryAutoplay = () => {
      if (normalAudioRef.current && !isPlayingRef.current) {
        normalAudioRef.current.play().then(() => {
          isPlayingRef.current = true;
          setIsPlaying(true);
          setCurrentTrack("normal");
        }).catch(() => {
          // Autoplay blocked, wait for user interaction
        });
      }
    };

    // Try autoplay immediately
    tryAutoplay();

    // Also try on first user interaction
    const handleFirstInteraction = () => {
      if (!isPlayingRef.current && normalAudioRef.current) {
        normalAudioRef.current.play().then(() => {
          isPlayingRef.current = true;
          setIsPlaying(true);
          setCurrentTrack("normal");
        }).catch(() => {});
      }
      // Remove listeners after first interaction
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);
    };

    document.addEventListener("click", handleFirstInteraction);
    document.addEventListener("keydown", handleFirstInteraction);
    document.addEventListener("touchstart", handleFirstInteraction);

    // Cleanup
    return () => {
      normalAudioRef.current?.pause();
      dangerAudioRef.current?.pause();
      normalAudioRef.current = null;
      dangerAudioRef.current = null;
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);
    };
  }, []);

  // Switch tracks based on danger state
  useEffect(() => {
    if (!isPlaying) return;

    const newTrack = isDanger ? "danger" : "normal";

    if (newTrack !== currentTrack) {
      setCurrentTrack(newTrack);

      // Crossfade between tracks
      if (newTrack === "danger") {
        normalAudioRef.current?.pause();
        if (dangerAudioRef.current) {
          dangerAudioRef.current.currentTime = 0;
          dangerAudioRef.current.play().catch(() => {});
        }
      } else {
        dangerAudioRef.current?.pause();
        if (normalAudioRef.current) {
          normalAudioRef.current.currentTime = 0;
          normalAudioRef.current.play().catch(() => {});
        }
      }
    }
  }, [isDanger, isPlaying, currentTrack]);

  // Start music (needs user interaction)
  const startMusic = useCallback(() => {
    if (isPlayingRef.current) return;

    const audioToPlay = isDanger
      ? dangerAudioRef.current
      : normalAudioRef.current;

    if (audioToPlay) {
      audioToPlay.play().then(() => {
        isPlayingRef.current = true;
        setIsPlaying(true);
        setCurrentTrack(isDanger ? "danger" : "normal");
      }).catch((error) => {
        console.error("Failed to play audio:", error);
      });
    }
  }, [isDanger]);

  // Update volume
  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(newVolume);
    localStorage.setItem("gameVolume", String(newVolume));

    if (normalAudioRef.current) {
      normalAudioRef.current.volume = newVolume;
    }
    if (dangerAudioRef.current) {
      dangerAudioRef.current.volume = newVolume;
    }
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    localStorage.setItem("gameMuted", String(newMuted));

    if (normalAudioRef.current) {
      normalAudioRef.current.muted = newMuted;
    }
    if (dangerAudioRef.current) {
      dangerAudioRef.current.muted = newMuted;
    }
  }, [isMuted]);

  // Set danger mode
  const setDangerMode = useCallback((danger: boolean) => {
    setIsDanger(danger);
  }, []);

  return (
    <AudioContext.Provider
      value={{
        volume,
        setVolume,
        isMuted,
        toggleMute,
        isPlaying,
        startMusic,
        setDangerMode,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}
