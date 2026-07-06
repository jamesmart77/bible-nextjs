"use client";

import { useEffect, useRef, useState } from "react";
import { ActionBar, Button, Portal, Text } from "@chakra-ui/react";
import { FaHistory } from "react-icons/fa";
import { FaMagnifyingGlass } from "react-icons/fa6";
import type { SessionData } from "@/lib/constants";
import type { SearchHistory as SearchHistoryType } from "@/supabase/utils/user";
import PopupSearch from "../search/PopupSearch";
import SearchHistory from "../utilities/searchHistory/SearchHistory";

type Props = {
  userSession: SessionData | null;
  searchHistory: SearchHistoryType[];
};

export default function KeywordActionsBar({
  userSession,
  searchHistory,
}: Props) {
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const lastScrollY = useRef(0);
  const hasRecentSearches = !!userSession && searchHistory.length > 0;

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsOpen(currentScrollY < lastScrollY.current);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        open={isOpen}
        autoFocus={false}
        closeOnEscape={false}
        closeOnInteractOutside={false}
      >
        <Portal>
          <ActionBar.Positioner style={{ zIndex: 1 }}>
            <ActionBar.Content gap="0.5rem">
              <Button
                size="sm"
                rounded="full"
                minW={{ base: "2.5rem", sm: "auto" }}
                px={{ base: 0, sm: "1rem" }}
                variant="outline"
                aria-label="Search scripture"
                title="Search scripture"
                onClick={() => setShowSearchDialog(true)}
              >
                <FaMagnifyingGlass />
                <Text as="span" display={{ base: "none", sm: "inline" }}>
                  Search
                </Text>
              </Button>
              {hasRecentSearches && (
                <>
                  <ActionBar.Separator />
                  <Button
                    size="sm"
                    rounded="full"
                    minW={{ base: "2.5rem", sm: "auto" }}
                    px={{ base: 0, sm: "1rem" }}
                    variant="outline"
                    aria-label="View recent searches"
                    title="View recent searches"
                    onClick={() => setIsHistoryOpen(true)}
                  >
                    <FaHistory />
                    <Text as="span" display={{ base: "none", sm: "inline" }}>
                      Recent
                    </Text>
                  </Button>
                </>
              )}
            </ActionBar.Content>
          </ActionBar.Positioner>
        </Portal>
      </ActionBar.Root>
    </>
  );
}
