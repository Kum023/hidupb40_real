"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudio } from "@/components/providers/AudioProvider";
import { SettingsModalContent } from "./SettingsModalContent";

export function GlobalSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const { volume, setVolume, isMuted, toggleMute, isPlaying, startMusic } = useAudio();

  return (
    <>
      {/* Floating Settings Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-4 right-4 z-40"
      >
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="h-12 w-12 rounded-full border-2 border-cyan-500/50 bg-slate-900/90 text-cyan-400 hover:text-white hover:border-cyan-400 hover:bg-slate-800 shadow-lg shadow-cyan-500/20"
          title="Settings"
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Settings className="h-5 w-5" />
          )}
        </Button>
      </motion.div>

      <SettingsModalContent
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        volume={volume}
        onVolumeChange={setVolume}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        isPlaying={isPlaying}
        onStartMusic={startMusic}
        notPlayingText="Click anywhere to start"
      />
    </>
  );
}
