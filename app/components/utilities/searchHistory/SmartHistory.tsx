import { Flex, Icon, Heading, Accordion } from "@chakra-ui/react";
import { RiGeminiLine } from "react-icons/ri";
import Link from "next/link";
import parse from "html-react-parser";
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
                  {parse(item.queryRes || "", {
                    replace: (domNode) => {
                      if (
                        domNode.type === "tag" &&
                        domNode.name === "a" &&
                        domNode.attribs?.href
                      ) {
                        return (
                          <Link
                            href={domNode.attribs.href}
                            style={{ textDecoration: "underline" }}
                          >
                            {(domNode.children[0] as any).data}
                          </Link>
                        );
                      }
                    },
                  })}
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
