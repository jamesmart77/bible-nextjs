"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PlaybackController, type AudioTrack, type PlaybackMode, type PlaybackSnapshot } from "@/lib/audio/PlaybackController";
import {
  Box,
  Button,
  Flex,
  IconButton,
  Portal,
  Popover,
  Slider,
  SegmentGroup,
  Text,
} from "@chakra-ui/react";
import {
  FaBackwardStep,
  FaForwardStep,
  FaPause,
  FaPlay,
  FaChevronDown,
  FaXmark,
} from "react-icons/fa6";

const AUDIO_CONTINUOUS_KEY = "justscripture:audio-continuous";
const AUDIO_REPEAT_KEY = "justscripture:audio-repeat";

type Props = {
  selection: AudioTrack | null;
  onClose: () => void;
};

const playbackModes = [
  { value: "stop", label: "Stop" },
  { value: "repeat", label: "Repeat" },
  { value: "continuous", label: "Keep playing" },
] as const;

const playbackSpeeds = [0.75, 1, 1.25, 1.5, 1.75, 2];

const selectedControlStyles = {
  bg: { base: "accent.hover", _dark: "accent.solid" },
  color: "accent.contrast",
  fontWeight: "bold",
  boxShadow: "inset 0 0 0 1px currentColor",
  _hover: { bg: { base: "accent.hover", _dark: "accent.solid" } },
} as const;

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${remainingSeconds}`;
}

export default function AudioControlPanel({ selection, onClose }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const controllerRef = useRef<PlaybackController | null>(null);
  const [snapshot, setSnapshot] = useState<PlaybackSnapshot>({
    track: null, isPlaying: false, isNavigating: false, error: null,
  });
  const [isSpeedPickerOpen, setIsSpeedPickerOpen] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>("stop");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const { track, isPlaying, isNavigating, error } = snapshot;
  const open = !!selection;
  const audioSrc = track?.audioSrc;
  const passageRef = track?.passageRef;
  const previousChapter = track?.previousChapter ?? null;
  const nextChapter = track?.nextChapter ?? null;
  const sliderMax = Number.isFinite(duration) ? Math.max(duration, 0) : 0;
  const sliderValue = Math.min(currentTime, sliderMax);

  useEffect(() => {
    const controller = new PlaybackController(audioRef.current!, async (reference) => {
      const response = await fetch(`/api/audio/chapter?reference=${encodeURIComponent(reference)}`, {
        signal: AbortSignal.timeout(20000),
      });
      if (!response.ok) throw new Error("Chapter unavailable");
      return response.json();
    }, setSnapshot);
    controllerRef.current = controller;
    const mode = sessionStorage.getItem(AUDIO_REPEAT_KEY) === "true" ? "repeat"
      : sessionStorage.getItem(AUDIO_CONTINUOUS_KEY) === "true" ? "continuous" : "stop";
    setPlaybackMode(mode);
    controller.setMode(mode);
    // Old releases used this marker to restart playback after route remounts.
    sessionStorage.removeItem("justscripture:audio-autoplay");
    return () => controller.dispose();
  }, []);

  useEffect(() => {
    if (selection) controllerRef.current?.select(selection);
    else controllerRef.current?.close();
  }, [selection]);

  useEffect(() => {
    controllerRef.current?.setSpeed(speed);
  }, [speed]);

  const seekTo = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(seconds) || !Number.isFinite(audio.duration)) return;
    audio.currentTime = Math.max(0, Math.min(seconds, audio.duration));
    setCurrentTime(audio.currentTime);
  };

  const closePanel = () => {
    controllerRef.current?.close();
    onClose();
  };

  useEffect(() => {
    if (!("mediaSession" in navigator) || !open || !track) return;
    const session = navigator.mediaSession;
    if (typeof MediaMetadata !== "undefined") {
      session.metadata = new MediaMetadata({
        title: track.passageRef,
        artist: "ESV Bible",
        album: "JustScripture",
        artwork: [{ src: "/pwa-512.png", sizes: "512x512", type: "image/png" }],
      });
    }
    const handlers: Partial<Record<MediaSessionAction, MediaSessionActionHandler>> = {
      play: () => controllerRef.current?.play(),
      pause: () => controllerRef.current?.pause(),
      stop: () => { controllerRef.current?.close(); onClose(); },
      seekto: (details) => { if (details.seekTime !== undefined) seekTo(details.seekTime); },
      seekbackward: (details) => seekTo((audioRef.current?.currentTime ?? 0) - (details.seekOffset ?? 10)),
      seekforward: (details) => seekTo((audioRef.current?.currentTime ?? 0) + (details.seekOffset ?? 10)),
    };
    if (track.previousChapter) handlers.previoustrack = () => controllerRef.current?.goToChapter(track.previousChapter);
    if (track.nextChapter) handlers.nexttrack = () => controllerRef.current?.goToChapter(track.nextChapter);
    for (const [action, handler] of Object.entries(handlers)) {
      try { session.setActionHandler(action as MediaSessionAction, handler); } catch { /* Unsupported action. */ }
    }
    return () => {
      for (const action of Object.keys(handlers)) {
        try { session.setActionHandler(action as MediaSessionAction, null); } catch { /* Unsupported action. */ }
      }
      session.metadata = null;
      session.playbackState = "none";
    };
  }, [open, track, onClose]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = !open ? "none" : isPlaying ? "playing" : "paused";
    if (navigator.mediaSession.setPositionState) {
      try {
        navigator.mediaSession.setPositionState(open && duration > 0 && Number.isFinite(duration) ? {
          duration, playbackRate: speed, position: Math.min(currentTime, duration),
        } : undefined);
      } catch { /* Position reporting is optional. */ }
    }
  }, [open, isPlaying, duration, currentTime, speed, track]);

  const changePlaybackMode = (mode: PlaybackMode) => {
    setPlaybackMode(mode);
    controllerRef.current?.setMode(mode);
    sessionStorage.setItem(AUDIO_CONTINUOUS_KEY, String(mode === "continuous"));
    sessionStorage.setItem(AUDIO_REPEAT_KEY, String(mode === "repeat"));
  };
  const togglePlayback = () => {
    if (audioRef.current?.paused) controllerRef.current?.play();
    else controllerRef.current?.pause();
  };
  const goToChapter = (chapter: string | null) => controllerRef.current?.goToChapter(chapter);

  return (
    <>
      <audio
        ref={audioRef}
        preload="auto"
        onEmptied={() => { setCurrentTime(0); setDuration(0); }}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onDurationChange={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
      />
      <Portal>
        <Box
          aria-hidden={!open}
          inert={!open}
          bg={{ base: "#FFFDF8", _dark: "#211A24" }}
          borderTopWidth="1px"
          borderColor={{ base: "#E6DED1", _dark: "#3A303F" }}
          bottom="0"
          boxShadow={{
            base: "0 -16px 40px rgba(0, 0, 0, 0.16)",
            _dark: "0 -16px 48px rgba(0, 0, 0, 0.48)",
          }}
          color={{ base: "#29202B", _dark: "#F6F0E8" }}
          left="0"
          pointerEvents={open ? "auto" : "none"}
          position="fixed"
          right="0"
          transform={open ? "translateY(0)" : "translateY(calc(100% + 1rem))"}
          transition="transform 220ms ease"
          zIndex="modal"
        >
          <Box
            maxW="900px"
            mx="auto"
            px={{ base: 4, md: 6 }}
            py={{ base: 4, md: 5 }}
          >
            <Flex align="center" justify="space-between" gap={3} mb={3}>
              <Text fontSize="md" fontWeight="semibold" lineClamp={1} minW={0}>
                {track ? <Link href={track.passageUrl} title="Read the playing passage">{passageRef}</Link> : passageRef}
              </Text>

              <IconButton
                aria-label="Close audio controls"
                rounded="full"
                size="sm"
                variant="ghost"
                onClick={closePanel}
              >
                <FaXmark />
              </IconButton>
            </Flex>

            {error && <Text role="alert" fontSize="sm" color="fg.error" mb={3}>{error}</Text>}
            <Slider.Root
              aria-label={["Audio progress"]}
              disabled={!audioSrc || !sliderMax}
              max={sliderMax || 1}
              min={0}
              step={1}
              value={[sliderValue]}
              onValueChange={(event) => seekTo(event.value[0] ?? 0)}
            >
              <Slider.Control>
                <Slider.Track bg="bg.muted" h="1">
                  <Slider.Range bg="accent.solid" />
                </Slider.Track>
                <Slider.Thumb
                  aria-label={`Seek audio, currently ${formatTime(currentTime)}`}
                  boxSize="4"
                  index={0}
                >
                  <Slider.HiddenInput />
                </Slider.Thumb>
              </Slider.Control>
            </Slider.Root>

            <Flex color="text.secondary" fontSize="xs" justify="space-between">
              <Text>{formatTime(currentTime)}</Text>
              <Text>{formatTime(duration)}</Text>
            </Flex>

            <Flex
              align="center"
              direction="column"
              gap={4}
              mt={4}
            >
              <Flex align="center" gap={5}>
                <IconButton
                  aria-label="Play previous chapter"
                  disabled={!previousChapter || isNavigating}
                  rounded="full"
                  variant="ghost"
                  onClick={() => goToChapter(previousChapter)}
                >
                  <FaBackwardStep />
                </IconButton>

                <IconButton
                  aria-label={isPlaying ? "Pause passage audio" : "Play passage audio"}
                  disabled={!audioSrc}
                  rounded="full"
                  size="lg"
                  boxSize="14"
                  bg="accent.solid"
                  color="accent.contrast"
                  _hover={{ bg: "accent.hover" }}
                  onClick={togglePlayback}
                >
                  {isPlaying ? <FaPause /> : <FaPlay />}
                </IconButton>

                <IconButton
                  aria-label="Play next chapter"
                  disabled={!nextChapter || isNavigating}
                  rounded="full"
                  variant="ghost"
                  onClick={() => goToChapter(nextChapter)}
                >
                  <FaForwardStep />
                </IconButton>
              </Flex>

              <Flex
                align="center"
                direction={{ base: "column", md: "row" }}
                gap={{ base: 3, md: 5 }}
                justify="center"
                w="full"
              >
                <Flex align="center" gap={2}>
                  <Popover.Root
                    open={isSpeedPickerOpen}
                    onOpenChange={(event) => setIsSpeedPickerOpen(event.open)}
                    positioning={{ placement: "top", gutter: 8 }}
                  >
                    <Popover.Trigger asChild>
                      <Button
                        aria-label={`Select playback speed, currently ${speed} times`}
                        size="sm"
                        variant="outline"
                        minW="5.75rem"
                      >
                        {speed}×
                        <FaChevronDown aria-hidden />
                      </Button>
                    </Popover.Trigger>
                    <Popover.Positioner zIndex="popover">
                      <Popover.Content
                        bg={{ base: "#FFFDF8", _dark: "#211A24" }}
                        borderColor={{ base: "#E6DED1", _dark: "#3A303F" }}
                        boxShadow={{
                          base: "0 10px 28px rgba(0, 0, 0, 0.16)",
                          _dark: "0 12px 32px rgba(0, 0, 0, 0.48)",
                        }}
                        minW="5.75rem"
                        p="1"
                        w="auto"
                      >
                        <Popover.Arrow>
                          <Popover.ArrowTip />
                        </Popover.Arrow>
                        <Flex direction="column" gap="1">
                          {playbackSpeeds.map((playbackSpeed) => (
                            <Button
                              key={playbackSpeed}
                              aria-pressed={speed === playbackSpeed}
                              justifyContent="flex-start"
                              size="sm"
                              variant={
                                speed === playbackSpeed ? "solid" : "ghost"
                              }
                              color="text.secondary"
                              _pressed={selectedControlStyles}
                              onClick={() => {
                                setSpeed(playbackSpeed);
                                setIsSpeedPickerOpen(false);
                              }}
                            >
                              {playbackSpeed}×
                            </Button>
                          ))}
                        </Flex>
                      </Popover.Content>
                    </Popover.Positioner>
                  </Popover.Root>
                </Flex>

                <Flex
                  align={{ base: "stretch", md: "center" }}
                  direction={{ base: "column", md: "row" }}
                  gap={2}
                  w={{ base: "full", md: "auto" }}
                >
                  <Text fontSize="sm" color="text.secondary" whiteSpace="nowrap">
                    After this passage
                  </Text>
                  <SegmentGroup.Root
                    aria-label="After this passage"
                    value={playbackMode}
                    onValueChange={({ value }) => {
                      if (value === "stop" || value === "repeat" || value === "continuous") {
                        changePlaybackMode(value);
                      }
                    }}
                    bg="bg.muted"
                    borderWidth="1px"
                    borderColor="border.muted"
                    rounded="lg"
                    p="0"
                    w={{ base: "full", md: "auto" }}
                  >
                    {playbackModes.map(({ value, label }) => (
                      <SegmentGroup.Item
                        key={value}
                        value={value}
                        flex="1"
                        justifyContent="center"
                        minH="11"
                        px={{ base: 3, md: 4 }}
                        fontSize="sm"
                        whiteSpace="nowrap"
                        cursor="pointer"
                        rounded="md"
                        color="text.secondary"
                        transition="background-color 150ms ease, color 150ms ease"
                        _hover={{ bg: "accent.subtle" }}
                        _checked={selectedControlStyles}
                        _focusVisible={{ outline: "2px solid", outlineColor: "accent.focus", outlineOffset: "2px" }}
                      >
                        <SegmentGroup.ItemText>{label}</SegmentGroup.ItemText>
                        <SegmentGroup.ItemHiddenInput />
                      </SegmentGroup.Item>
                    ))}
                  </SegmentGroup.Root>
                </Flex>
              </Flex>
            </Flex>
          </Box>
        </Box>
      </Portal>
    </>
  );
}
