"use client";
import { useEffect, useRef, useState } from "react";
import { Portal, ActionBar, IconButton } from "@chakra-ui/react";
import { FaHistory } from "react-icons/fa";
import { FaAngleLeft, FaAngleRight, FaRegCirclePlay } from "react-icons/fa6";

type Props = {
  navigateToChapter: (chapter: string | null) => Promise<void>;
  previousChapter: string | null;
  nextChapter: string | null;
};

export default function ActionsBar(props: Props) {
  const { navigateToChapter, previousChapter, nextChapter } = props;
  const [isPrevLoading, setIsPrevLoading] = useState(false);
  const [isNextLoading, setIsNextLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

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
            <IconButton
              disabled
              variant="outline"
              aria-label="View search history"
              title="View search history"
              rounded="full"
            >
              <FaHistory />
            </IconButton>
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
  );
}
