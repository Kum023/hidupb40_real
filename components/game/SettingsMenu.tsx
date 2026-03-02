"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsModalContent } from "./SettingsModalContent";

interface SettingsMenuProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isPlaying: boolean;
  onStartMusic: () => void;
}

export function SettingsMenu({
  volume,
  onVolumeChange,
  isMuted,
  onToggleMute,
  isPlaying,
  onStartMusic,
}: SettingsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Settings Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="border-slate-600 text-slate-400 hover:text-white hover:border-cyan-500 hover:bg-cyan-500/10"
        title="Settings"
      >
        <Settings className="h-4 w-4" />
      </Button>

      <SettingsModalContent
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        volume={volume}
        onVolumeChange={onVolumeChange}
        isMuted={isMuted}
        onToggleMute={onToggleMute}
        isPlaying={isPlaying}
        onStartMusic={onStartMusic}
      />
    </>
  );
}
