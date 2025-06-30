import { SearchHistory as SearchHistoryType } from "@/supabase/utils/user";
import { Flex, Icon, Heading } from "@chakra-ui/react";
import Link from "next/link";
import { RiBookmarkLine, RiExternalLinkLine, RiKeyLine } from "react-icons/ri";

export default function ScriptureHistoryItem({
  item,
}: {
  item: SearchHistoryType;
}) {
  const buildUrl = () => {
    if (item.queryType === "keyword") {
      return `/keyword/${encodeURIComponent(item.query)}?page=1`;
    }

    // default to passage handling
    // Handle formats: "John", "John 3", "John 3:16", "John 3:16-17"
    const passageRegex = /^([\w\s]+?)(?:\s+(\d+))?(?::(\d+)(?:-(\d+))?)?$/;
    const match = item.query.match(passageRegex);

    if (match) {
      const book = match[1].trim().replace(/\s+/g, "").toLowerCase();
      const chapter = match[2] || "1";
      const startVerse = match[3];
      const endVerse = match[4];

      let passageUrl = `/passages/${book}/${chapter}`;
      if (startVerse) {
        passageUrl += `/${startVerse}`;
        if (endVerse) {
          passageUrl += `-${endVerse}`;
        }
      }
      return passageUrl;
    }
  };

  const url = buildUrl();

  return (
    <>
      <Flex alignItems="center">
        <Icon mr="2">
          {item.queryType === "passage" ? <RiBookmarkLine /> : <RiKeyLine />}
        </Icon>
        <Heading fontSize="md" fontWeight="500">
          {item.query}
        </Heading>
      </Flex>
      <Icon asChild color="teal.700">
        <Link href={url || "#"}>
          <RiExternalLinkLine />
        </Link>
      </Icon>
    </>
  );
}
