"use client";
import { useEffect, useRef, useState } from "react";
import {
  Portal,
  ActionBar,
  IconButton,
  Popover,
  Text,
  Button,
} from "@chakra-ui/react";
import { FaHistory } from "react-icons/fa";
import { FaAngleLeft, FaAngleRight, FaRegCirclePlay } from "react-icons/fa6";
import { SessionData } from "@auth0/nextjs-auth0/types";
import { SearchHistory as SearchHistoryType } from "@/supabase/utils/user";
import SearchHistory from "./SearchHistory";

type Props = {
  navigateToChapter: (chapter: string | null) => Promise<void>;
  previousChapter: string | null;
  nextChapter: string | null;
  userSession: SessionData | null;
  passageUrl: string;
  searchHistory: SearchHistoryType[];
};

export default function ActionsBar(props: Props) {
  const {
    navigateToChapter,
    previousChapter,
    nextChapter,
    userSession,
    passageUrl,
    searchHistory,
  } = props;

  const [isPrevLoading, setIsPrevLoading] = useState(false);
  const [isNextLoading, setIsNextLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [isPopOverOpen, setIsPopOverOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Track previous scroll position
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
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
  }, []);

  return (
    <>
      <SearchHistory
        open={isHistoryOpen}
        setOpen={setIsHistoryOpen}
        searchHistory={searchHistory}
      />
      <ActionBar.Root
        open={isOpen}
        autoFocus={false}
        closeOnEscape={false}
        closeOnInteractOutside={false}
      >
        <Portal>
          <ActionBar.Positioner style={{ zIndex: 1 }}>
            <ActionBar.Content>
              <IconButton
                disabled={!previousChapter}
                aria-label="Previous chapter"
                title="Previous chapter"
                rounded="full"
                loading={isPrevLoading}
                onClick={() => {
                  setIsPrevLoading(true);
                  navigateToChapter(previousChapter);
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
                            <Button asChild variant="surface" mt={2}>
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
                disabled
                variant="outline"
                aria-label="Play passage audio"
                title="Play passage audio"
                rounded="full"
              >
                <FaRegCirclePlay />
              </IconButton>
              <ActionBar.Separator />
              <IconButton
                aria-label="Next chapter"
                title="Next chapter"
                rounded="full"
                disabled={!nextChapter}
                loading={isNextLoading}
                onClick={() => {
                  setIsNextLoading(true);
                  navigateToChapter(nextChapter);
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
