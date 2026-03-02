"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Settings, Volume2, VolumeX, X, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export interface SettingsModalContentProps {
  isOpen: boolean;
  onClose: () => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isPlaying: boolean;
  onStartMusic: () => void;
  notPlayingText?: string;
}

export function SettingsModalContent({
  isOpen,
  onClose,
  volume,
  onVolumeChange,
  isMuted,
  onToggleMute,
  isPlaying,
  onStartMusic,
  notPlayingText = "Not Started",
}: SettingsModalContentProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl p-6 max-w-sm w-full border-2 border-cyan-500/30 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-cyan-400" />
                <h2 className="text-xl font-bold text-white">Settings</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Music Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Music className="w-4 h-4" />
                <span className="text-sm uppercase tracking-wider">Music</span>
              </div>

              {/* Start Music Button (if not playing) */}
              {!isPlaying && (
                <Button
                  onClick={onStartMusic}
                  className="w-full bg-cyan-600 hover:bg-cyan-700"
                >
                  <Music className="w-4 h-4 mr-2" />
                  Start Music
                </Button>
              )}

              {/* Volume Control */}
              <div className="bg-slate-800/50 rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-300">Volume</span>
                  <span className="text-sm font-mono text-cyan-400">
                    {Math.round(volume * 100)}%
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleMute}
                    className={`${
                      isMuted ? "text-red-400" : "text-slate-400"
                    } hover:text-white`}
                  >
                    {isMuted ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </Button>

                  <Slider
                    value={[volume * 100]}
                    onValueChange={(value) => onVolumeChange(value[0] / 100)}
                    max={100}
                    step={1}
                    className="flex-1"
                    disabled={isMuted}
                  />
                </div>
              </div>

              {/* Music Status */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Status:</span>
                <span className={isPlaying ? "text-emerald-400" : "text-slate-500"}>
                  {isPlaying ? (isMuted ? "Muted" : "Playing") : notPlayingText}
                </span>
              </div>
            </div>

            {/* Close Button */}
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full mt-6 border-slate-600"
            >
              Close
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
