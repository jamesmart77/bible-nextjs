import { SearchHistory as SearchHistoryType } from "@/supabase/utils/user";
import {
  Accordion,
  CloseButton,
  Drawer,
  Flex,
  Heading,
  Icon,
  ListItem,
  ListRoot,
  Portal,
} from "@chakra-ui/react";
import Link from "next/link";
import { Dispatch, SetStateAction } from "react";
import {
  RiGeminiLine,
  RiExternalLinkLine,
  RiBookmarkLine,
} from "react-icons/ri";
import parse from "html-react-parser";

type Props = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  searchHistory: SearchHistoryType[];
};

export default function SearchHistory({ searchHistory, open, setOpen }: Props) {
  const PassageHistory = ({ item }: { item: SearchHistoryType }) => {
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
          <Icon asChild>
            <Link href={url}>
              <RiExternalLinkLine />
            </Link>
          </Icon>
        )}
      </>
    );
  };

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
              <ListRoot listStyle="none" padding="0">
                {searchHistory.map((item) => (
                  <ListItem
                    key={item.id}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    py="0.5rem"
                    borderTop="1px solid"
                    borderColor="gray.200"
                  >
                    {item.queryType === "passage" ? (
                      <PassageHistory item={item} />
                    ) : (
                      <Accordion.Root collapsible variant="plain">
                        <Accordion.Item value="smartSearch">
                          <Accordion.ItemTrigger>
                            <Icon fontSize="md">
                              <RiGeminiLine />
                            </Icon>
                            {item.query}
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
                      </Accordion.Root>
                    )}
                  </ListItem>
                ))}
              </ListRoot>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}
