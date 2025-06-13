import { SearchHistory as SearchHistoryType } from "@/supabase/utils/user";
import {
  CloseButton,
  Drawer,
  ListItem,
  ListRoot,
  Portal,
  Tabs,
} from "@chakra-ui/react";
import { Dispatch, SetStateAction } from "react";
import {
  RiGeminiLine,
  RiBookmarkLine,
} from "react-icons/ri";
import PassageHistoryItem from "./PassageHistoryItem";
import SmartSearchHistoryItem from "./SmartSearchHistoryItem";

type Props = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  searchHistory: SearchHistoryType[];
};

export default function SearchHistory({ searchHistory, open, setOpen }: Props) {
  return (
    <Drawer.Root
      open={open}
      size={{ base: "full", sm: "md" }}
      onOpenChange={(e) => setOpen(e.open)}
    >
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Drawer.CloseTrigger>
            <Drawer.Header>
              <Drawer.Title>Search History</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>
              <Tabs.Root fitted defaultValue="passages" variant="plain">
                <Tabs.List bg="bg.muted" rounded="l3" p="1">
                  <Tabs.Trigger value="passages">
                    <RiBookmarkLine />
                    Passages
                  </Tabs.Trigger>
                  <Tabs.Trigger value="smartSearch">
                    <RiGeminiLine />
                    Smart search
                  </Tabs.Trigger>
                  <Tabs.Indicator rounded="l2" />
                </Tabs.List>
                <Tabs.Content value="passages">
                  <ListRoot listStyle="none" padding="0">
                    {searchHistory
                      .filter((item) => item.queryType === "passage")
                      .map((item) => (
                        <ListItem
                          key={item.id}
                          display="flex"
                          alignItems="center"
                          justifyContent="space-between"
                          py="0.5rem"
                          borderTop="1px solid"
                          borderColor="gray.200"
                        >
                          <PassageHistoryItem item={item} />
                        </ListItem>
                      ))}
                  </ListRoot>
                </Tabs.Content>
                <Tabs.Content value="smartSearch">
                  <SmartSearchHistoryItem searchHistory={searchHistory} />
                </Tabs.Content>
              </Tabs.Root>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}
