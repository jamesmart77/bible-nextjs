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
  Switch,
  Text,
} from "@chakra-ui/react";
import {
  FaBackwardStep,
  FaForwardStep,
  FaPause,
  FaPlay,
  FaVolumeHigh,
  FaXmark,
} from "react-icons/fa6";

const AUDIO_AUTOPLAY_KEY = "justscripture:audio-autoplay";
const AUDIO_CONTINUOUS_KEY = "justscripture:audio-continuous";

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isSpeedPickerOpen, setIsSpeedPickerOpen] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [continuousPlay, setContinuousPlay] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const sliderMax = Math.max(duration, 0);
  const sliderValue = Math.min(currentTime, sliderMax);

  useEffect(() => {
    setContinuousPlay(
      sessionStorage.getItem(AUDIO_CONTINUOUS_KEY) === "true"
    );
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.playbackRate = speed;
  }, [speed]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !open || !audioSrc) return;

    audio.load();
    setCurrentTime(0);
    setDuration(0);

    if (!autoPlayOnOpen && !shouldResumeAudioPlayback()) return;

    audio
      .play()
      .then(() => {
        setIsPlaying(true);
        sessionStorage.removeItem(AUDIO_AUTOPLAY_KEY);
      })
      .catch(() => {
        setIsPlaying(false);
        sessionStorage.removeItem(AUDIO_AUTOPLAY_KEY);
      });
  }, [audioSrc, autoPlayOnOpen, open]);

  useEffect(() => {
    if (open) return;

    audioRef.current?.pause();
    setIsPlaying(false);
  }, [open]);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
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

    setAudioAutoplayPreference(continuousPlay);
    setIsNavigating(true);
    await navigateToChapter(chapter);
  };

  const handleEnded = async () => {
    setIsPlaying(false);

    if (!continuousPlay || !nextChapter) return;

    await goToChapter(nextChapter);
  };

  const closePanel = () => {
    sessionStorage.removeItem(AUDIO_AUTOPLAY_KEY);
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
          <audio
            ref={audioRef}
            preload="metadata"
            src={audioSrc ?? undefined}
            onEnded={handleEnded}
            onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onTimeUpdate={(event) =>
              setCurrentTime(event.currentTarget.currentTime)
            }
          />

          <Flex align="center" justify="space-between" gap={3} mb={3}>
            <Flex align="center" gap={2} minW={0}>
              <Box color="accent.solid" aria-hidden>
                <FaVolumeHigh />
              </Box>
              <Box minW={0}>
                <Text fontSize="sm" fontWeight="semibold" lineClamp={1}>
                  {passageRef}
                </Text>
                <Text color="text.secondary" fontSize="xs">
                  ESV scripture audio
                </Text>
              </Box>
            </Flex>

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
              <Slider.Track bg="bg.muted" h="2">
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
            direction={{ base: "column", md: "row" }}
            gap={4}
            justify="space-between"
            mt={4}
          >
            <Flex align="center" gap={3}>
              <IconButton
                aria-label="Play previous chapter"
                disabled={!previousChapter || isNavigating}
                rounded="full"
                variant="outline"
                onClick={() => goToChapter(previousChapter)}
              >
                <FaBackwardStep />
              </IconButton>

              <IconButton
                aria-label={isPlaying ? "Pause passage audio" : "Play passage audio"}
                disabled={!audioSrc}
                rounded="full"
                size="lg"
                onClick={togglePlayback}
              >
                {isPlaying ? <FaPause /> : <FaPlay />}
              </IconButton>

              <IconButton
                aria-label="Play next chapter"
                disabled={!nextChapter || isNavigating}
                rounded="full"
                variant="outline"
                onClick={() => goToChapter(nextChapter)}
              >
                <FaForwardStep />
              </IconButton>
            </Flex>

            <Flex
              align="center"
              gap={{ base: 3, md: 5 }}
              justify="center"
              wrap="wrap"
            >
              <Flex align="center" gap={2}>
                <Text fontSize="sm">Speed</Text>
                <Popover.Root
                  open={isSpeedPickerOpen}
                  onOpenChange={(event) => setIsSpeedPickerOpen(event.open)}
                  positioning={{ placement: "top", gutter: 8 }}
                >
                  <Popover.Trigger asChild>
                    <Button
                      aria-label="Select playback speed"
                      size="sm"
                      variant="outline"
                      minW="5.75rem"
                    >
                      {speed}x
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
                            {playbackSpeed}x
                          </Button>
                        ))}
                      </Flex>
                    </Popover.Content>
                  </Popover.Positioner>
                </Popover.Root>
              </Flex>

              <Switch.Root
                checked={continuousPlay}
                onCheckedChange={(event) => {
                  setContinuousPlay(event.checked);
                  sessionStorage.setItem(
                    AUDIO_CONTINUOUS_KEY,
                    String(event.checked)
                  );
                }}
              >
                <Switch.HiddenInput />
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
                <Switch.Label fontSize="sm">Continuous play</Switch.Label>
              </Switch.Root>
            </Flex>
          </Flex>
        </Box>
      </Box>
    </Portal>
  );
}
