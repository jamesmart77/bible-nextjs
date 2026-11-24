import { Flex, Icon, Heading, Accordion } from "@chakra-ui/react";
import { RiGeminiLine } from "react-icons/ri";
import { parseAssistedHtml } from "@/lib/assistedHtml";
import { SearchHistory as SearchHistoryType } from "@/supabase/utils/user";
import { capitalizeFirstLetter } from "./formatSearchHistoryQuery";

export default function SmartHistory({
  searchHistory,
}: {
  searchHistory: SearchHistoryType[];
}) {
  return (
    <>
      <Accordion.Root collapsible multiple variant="plain">
        {searchHistory
          .filter((item) => item.queryType === "ai")
          .map((item) => (
            <Accordion.Item key={item.id} value={String(item.id)}>
              <Accordion.ItemTrigger cursor="pointer">
                <Icon fontSize="md">
                  <RiGeminiLine />
                </Icon>
                {capitalizeFirstLetter(item.query)}
                <Accordion.ItemIndicator />
              </Accordion.ItemTrigger>
              <Accordion.ItemContent>
                <Accordion.ItemBody>
                  {parseAssistedHtml(item.queryRes || "")}
                </Accordion.ItemBody>
              </Accordion.ItemContent>
            </Accordion.Item>
          ))}
      </Accordion.Root>
      {searchHistory.filter((item) => item.queryType === "ai").length === 0 && (
        <Flex justifyContent="center" alignItems="center" height="100%" p="4">
          <Heading fontSize="sm" fontWeight="500">
            You have not made an assisted search yet 😉
          </Heading>
        </Flex>
      )}
    </>
  );
}
