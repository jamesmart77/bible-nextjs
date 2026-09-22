"use client";

import { useEffect, useRef, useState } from "react";
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

const AUDIO_AUTOPLAY_KEY = "justscripture:audio-autoplay";
const AUDIO_CONTINUOUS_KEY = "justscripture:audio-continuous";
const AUDIO_REPEAT_KEY = "justscripture:audio-repeat";

type Props = {
  open: boolean;
  passageRef: string;
  audioSrc: string | null;
  previousChapter: string | null;
  nextChapter: string | null;
  autoPlayOnOpen: boolean;
  navigateToChapter: (chapter: string | null) => Promise<void>;
  onClose: () => void;
};

const playbackModes = [
  { value: "stop", label: "Stop" },
  { value: "repeat", label: "Repeat" },
  { value: "continuous", label: "Keep playing" },
] as const;
type PlaybackMode = (typeof playbackModes)[number]["value"];

const playbackSpeeds = [0.75, 1, 1.25, 1.5, 1.75, 2];

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${remainingSeconds}`;
}

export function setAudioAutoplayPreference(continuous: boolean) {
  sessionStorage.setItem(AUDIO_AUTOPLAY_KEY, "true");
  sessionStorage.setItem(AUDIO_CONTINUOUS_KEY, String(continuous));
}

export function shouldResumeAudioPlayback() {
  return sessionStorage.getItem(AUDIO_AUTOPLAY_KEY) === "true";
}

function clearAudioAutoplayPreference() {
  sessionStorage.removeItem(AUDIO_AUTOPLAY_KEY);
}

export default function AudioControlPanel({
  open,
  passageRef,
  audioSrc,
  previousChapter,
  nextChapter,
  autoPlayOnOpen,
  navigateToChapter,
  onClose,
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const continuousPlayRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isSpeedPickerOpen, setIsSpeedPickerOpen] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>("stop");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const sliderMax = Math.max(duration, 0);
  const sliderValue = Math.min(currentTime, sliderMax);

  useEffect(() => {
    const storedRepeat = sessionStorage.getItem(AUDIO_REPEAT_KEY) === "true";
    const storedContinuousPlay =
      !storedRepeat && sessionStorage.getItem(AUDIO_CONTINUOUS_KEY) === "true";

    continuousPlayRef.current = storedContinuousPlay;
    setPlaybackMode(storedRepeat ? "repeat" : storedContinuousPlay ? "continuous" : "stop");
    sessionStorage.setItem(AUDIO_CONTINUOUS_KEY, String(storedContinuousPlay));
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.playbackRate = speed;
  }, [audioSrc, open, speed]);

  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);

    if (!open) {
      audioRef.current?.pause();
    }
  }, [audioSrc, open]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !open || !audioSrc) return;

    if (!autoPlayOnOpen && !shouldResumeAudioPlayback()) return;

    audio
      .play()
      .then(() => {
        // Keep the resume marker for the entire continuous-play session. This
        // lets playback survive a component remount (including book changes).
        if (!continuousPlayRef.current) {
          clearAudioAutoplayPreference();
        }
      })
      .catch((error) => {
        console.error("Unable to autoplay passage audio:", error);
        setIsPlaying(false);
        clearAudioAutoplayPreference();
      });
  }, [audioSrc, autoPlayOnOpen, open]);

  const changePlaybackMode = (mode: PlaybackMode) => {
    const continuous = mode === "continuous";
    setPlaybackMode(mode);
    continuousPlayRef.current = continuous;
    sessionStorage.setItem(AUDIO_CONTINUOUS_KEY, String(continuous));
    sessionStorage.setItem(AUDIO_REPEAT_KEY, String(mode === "repeat"));

    if (continuous && audioRef.current && !audioRef.current.paused) {
      setAudioAutoplayPreference(true);
    } else {
      clearAudioAutoplayPreference();
    }
  };

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;

    if (!audio.paused) {
      clearAudioAutoplayPreference();
      audio.pause();
      return;
    }

    try {
      if (continuousPlayRef.current) {
        setAudioAutoplayPreference(true);
      }

      await audio.play();
    } catch (error) {
      console.error("Unable to play passage audio:", error);
      setIsPlaying(false);
    }
  };

  const seekTo = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(seconds)) return;

    audio.currentTime = seconds;
    setCurrentTime(seconds);
  };

  const goToChapter = async (chapter: string | null) => {
    if (!chapter) return;

    setAudioAutoplayPreference(continuousPlayRef.current);
    setIsNavigating(true);
    await navigateToChapter(chapter);
  };

  const handleEnded = async () => {
    setIsPlaying(false);

    if (!continuousPlayRef.current || !nextChapter) {
      clearAudioAutoplayPreference();
      return;
    }

    await goToChapter(nextChapter);
  };

  const closePanel = () => {
    clearAudioAutoplayPreference();
    audioRef.current?.pause();
    setIsPlaying(false);
    onClose();
  };

  return (
    <Portal>
      <Box
        aria-hidden={!open}
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
          {open && audioSrc && (
            <audio
              ref={audioRef}
              preload="auto"
              src={audioSrc}
              loop={playbackMode === "repeat"}
              onEnded={handleEnded}
              onLoadedMetadata={(event) =>
                setDuration(event.currentTarget.duration)
              }
              onPause={() => setIsPlaying(false)}
              onPlaying={() => setIsPlaying(true)}
              onTimeUpdate={(event) =>
                setCurrentTime(event.currentTarget.currentTime)
              }
            />
          )}

          <Flex align="center" justify="space-between" gap={3} mb={3}>
            <Text fontSize="md" fontWeight="semibold" lineClamp={1} minW={0}>
              {passageRef}
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
                  bg="transparent"
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
                      _checked={{ bg: "accent.subtle", color: "text.primary", fontWeight: "semibold" }}
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
  );
}
