"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Portal,
  ActionBar,
  IconButton,
  Popover,
  Text,
  Button,
} from "@chakra-ui/react";
import { FaHistory } from "react-icons/fa";
import {
  FaAngleLeft,
  FaAngleRight,
  FaMagnifyingGlass,
  FaVolumeHigh,
} from "react-icons/fa6";
import { SearchHistory as SearchHistoryType } from "@/supabase/utils/user";
import SearchHistory from "./searchHistory/SearchHistory";
import PopupSearch from "../search/PopupSearch";
import { SessionData } from "@/lib/constants";
import { useAudioPlayback } from "../passages/AudioPlaybackProvider";
import CommentaryDrawer from "../passages/CommentaryDrawer";

type Props = {
  navigateToChapter: (chapter: string | null) => Promise<void>;
  previousChapter: string | null;
  nextChapter: string | null;
  userSession: SessionData | null;
  passageUrl: string;
  audioPassageRef: string;
  audioSrc: string | null;
  searchHistory: SearchHistoryType[];
  commentaryBookSlug: string;
  commentaryBookName: string;
  commentaryChapter: number;
};

export default function ActionsBar(props: Props) {
  const {
    navigateToChapter,
    previousChapter,
    nextChapter,
    userSession,
    passageUrl,
    audioPassageRef,
    audioSrc,
    searchHistory,
    commentaryBookSlug,
    commentaryBookName,
    commentaryChapter,
  } = props;

  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const { open: showAudioPanel, openAudio } = useAudioPlayback();
  const [isPrevLoading, setIsPrevLoading] = useState(false);
  const [isNextLoading, setIsNextLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [isPopOverOpen, setIsPopOverOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Track previous scroll position
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      if (showAudioPanel) return;

      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current) {
        // Scrolling down
        setIsOpen(false);
      } else if (currentScrollY < lastScrollY.current) {
        // Scrolling up
        setIsOpen(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [showAudioPanel]);

  useEffect(() => {
    if (!showAudioPanel) setIsOpen(true);
  }, [showAudioPanel]);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    setIsPrevLoading(false);
    setIsNextLoading(false);
    setIsOpen(true);
  }, [passageUrl]);

  const changeChapter = async (chapter: string | null, direction: "previous" | "next") => {
    if (!chapter) return;
    const setLoading = direction === "previous" ? setIsPrevLoading : setIsNextLoading;
    setLoading(true);
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    try {
      await navigateToChapter(chapter);
    } finally {
      setLoading(false);
    }
  };

  const openAudioPanel = () => {
    if (!audioSrc) return;
    openAudio({ passageRef: audioPassageRef, audioSrc, previousChapter, nextChapter, passageUrl });
  };

  return (
    <>
      <PopupSearch
        open={showSearchDialog}
        closePopup={setShowSearchDialog}
        isUserSignedIn={!!userSession}
      />
      <SearchHistory
        open={isHistoryOpen}
        setOpen={setIsHistoryOpen}
        searchHistory={searchHistory}
      />
      <ActionBar.Root
        open={isOpen && !showAudioPanel}
        autoFocus={false}
        closeOnEscape={false}
        closeOnInteractOutside={false}
      >
        <Portal>
          <ActionBar.Positioner style={{ zIndex: 1 }}>
            <ActionBar.Content className="passage-actions">
              <IconButton
                disabled={!previousChapter}
                aria-label="Previous chapter"
                title="Previous chapter"
                rounded="full"
                loading={isPrevLoading}
                onClick={() => {
                  void changeChapter(previousChapter, "previous");
                }}
              >
                <FaAngleLeft />
              </IconButton>
              <ActionBar.Separator />
              {userSession ? (
                <IconButton
                  disabled={searchHistory.length === 0}
                  variant="outline"
                  aria-label="View search history"
                  title="View search history"
                  rounded="full"
                  onClick={() => setIsHistoryOpen(true)}
                >
                  <FaHistory />
                </IconButton>
              ) : (
                <>
                  <Popover.Root
                    open={isPopOverOpen}
                    onOpenChange={(e) => setIsPopOverOpen(e.open)}
                  >
                    <Popover.Trigger asChild>
                      <IconButton
                        onClick={() => setIsPopOverOpen(true)}
                        variant="outline"
                        aria-label="Login to view search history"
                        title="Login to view search history"
                        rounded="full"
                      >
                        <FaHistory />
                      </IconButton>
                    </Popover.Trigger>
                    <Portal>
                      <Popover.Positioner>
                        <Popover.Content>
                          <Popover.Arrow />
                          <Popover.Body textAlign="center">
                            <Text fontSize="md">
                              Log in to view your search history.
                            </Text>
                            <Button asChild variant={"cta" as any} mt={2}>
                              <a href={`/auth/login?returnTo=${passageUrl}`}>
                                Log in
                              </a>
                            </Button>
                          </Popover.Body>
                        </Popover.Content>
                      </Popover.Positioner>
                    </Portal>
                  </Popover.Root>
                </>
              )}
              <ActionBar.Separator />
              <IconButton
                variant="outline"
                aria-label="Open passage audio controls"
                title="Open passage audio controls"
                rounded="full"
                disabled={!audioSrc}
                onClick={openAudioPanel}
              >
                <FaVolumeHigh />
              </IconButton>
              <ActionBar.Separator />
              <CommentaryDrawer
                bookSlug={commentaryBookSlug}
                bookName={commentaryBookName}
                chapter={commentaryChapter}
              />
              <ActionBar.Separator />
              <IconButton
                variant="outline"
                aria-label="Search scripture"
                title="Search scripture"
                rounded="full"
                onClick={() => setShowSearchDialog(true)}
              >
                <FaMagnifyingGlass />
              </IconButton>
              <ActionBar.Separator />
              <IconButton
                aria-label="Next chapter"
                title="Next chapter"
                rounded="full"
                disabled={!nextChapter}
                loading={isNextLoading}
                onClick={() => {
                  void changeChapter(nextChapter, "next");
                }}
              >
                <FaAngleRight />
              </IconButton>
            </ActionBar.Content>
          </ActionBar.Positioner>
        </Portal>
      </ActionBar.Root>
    </>
  );
}
