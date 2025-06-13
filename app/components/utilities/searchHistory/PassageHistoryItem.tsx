import { SearchHistory as SearchHistoryType } from "@/supabase/utils/user";
import { Flex, Icon, Heading } from "@chakra-ui/react";
import Link from "next/link";
import { RiBookmarkLine, RiExternalLinkLine } from "react-icons/ri";

export default function PassageHistoryItem({ item }: { item: SearchHistoryType }) {
    // Handle formats: "John", "John 3", "John 3:16", "John 3:16-17"
    let url: string | null = null;
    const passageRegex = /^([\w\s]+?)(?:\s+(\d+))?(?::(\d+)(?:-(\d+))?)?$/;
    const match = item.query.match(passageRegex);

    if (match) {
      const book = match[1].trim().replace(/\s+/g, "-").toLowerCase();
      const chapter = match[2] || "1";
      const startVerse = match[3];
      const endVerse = match[4];

      url = `/passages/${book}/${chapter}`;
      if (startVerse) {
        url += `/${startVerse}`;
        if (endVerse) {
          url += `-${endVerse}`;
        }
      }
    }

    return (
      <>
        <Flex alignItems="center">
          <Icon mr="2">
            <RiBookmarkLine />
          </Icon>
          <Heading fontSize="md" fontWeight="500">
            {item.query}
          </Heading>
        </Flex>
        {item.queryType === "passage" && url && (
          <Icon asChild color="teal.700">
            <Link href={url}>
              <RiExternalLinkLine />
            </Link>
          </Icon>
        )}
      </>
    );
  };