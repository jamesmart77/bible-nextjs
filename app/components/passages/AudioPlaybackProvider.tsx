"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { AudioTrack } from "@/lib/audio/PlaybackController";
import AudioControlPanel from "./AudioControlPanel";

const AudioPlaybackContext = createContext<{
  open: boolean;
  openAudio: (track: AudioTrack) => void;
} | null>(null);

export function useAudioPlayback() {
  const context = useContext(AudioPlaybackContext);
  if (!context) throw new Error("AudioPlaybackProvider is required");
  return context;
}

export default function AudioPlaybackProvider({ children }: { children: ReactNode }) {
  const [selection, setSelection] = useState<AudioTrack | null>(null);
  const closeAudio = useCallback(() => setSelection(null), []);
  return (
    <AudioPlaybackContext.Provider value={{ open: !!selection, openAudio: setSelection }}>
      {children}
      <AudioControlPanel selection={selection} onClose={closeAudio} />
    </AudioPlaybackContext.Provider>
  );
}
