"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Button,
  CloseButton,
  Collapsible,
  Drawer,
  Flex,
  IconButton,
  Link,
  Portal,
  Text,
} from "@chakra-ui/react";
import { LuBookOpen, LuChevronDown, LuExternalLink } from "react-icons/lu";
import { getGuzikBlbStudyGuideUrl } from "@/lib/commentary/getGuzikBlbStudyGuideUrl";

const BLB_COMMENTARIES_URL = "https://www.blueletterbible.org/commentaries/";

type Props = {
  bookSlug: string;
  bookName: string;
  chapter: number;
};

export default function CommentaryDrawer({ bookSlug, bookName, chapter }: Props) {
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [iframeFailed, setIframeFailed] = useState(false);

  const commentaryUrl = useMemo(
    () => getGuzikBlbStudyGuideUrl(bookSlug, chapter),
    [bookSlug, chapter]
  );
  const currentIframeUrl = iframeUrl ?? commentaryUrl;
  const iframeTitle =
    currentIframeUrl === BLB_COMMENTARIES_URL
      ? "Blue Letter Bible commentaries"
      : `David Guzik commentary for ${bookName} ${chapter}`;

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(event) => {
        setOpen(event.open);
        if (event.open) {
          setDetailsOpen(false);
          setIframeUrl(null);
          setIframeFailed(false);
        }
      }}
      size={{ base: "full", md: "lg" }}
    >
      <Drawer.Trigger asChild>
        <IconButton
          aria-label="Open commentary"
          title="Commentary"
          rounded="full"
          variant="outline"
        >
          <LuBookOpen />
        </IconButton>
      </Drawer.Trigger>

      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Drawer.CloseTrigger>
            <Drawer.Header>
              <Flex
                align="center"
                gap={3}
                justify="space-between"
                pr={8}
                w="100%"
              >
                <Drawer.Title>Commentary</Drawer.Title>
                {commentaryUrl && (
                  <Link
                    alignItems="center"
                    display="inline-flex"
                    flexShrink={0}
                    fontSize="sm"
                    gap={1}
                    href={commentaryUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Open BLB <LuExternalLink />
                  </Link>
                )}
              </Flex>
            </Drawer.Header>

            <Drawer.Body
              display="flex"
              flexDirection="column"
              gap={3}
              minH={0}
              overflow="hidden"
            >
              {!commentaryUrl ? (
                <Text color="text.secondary">
                  Commentary is not available for this passage.
                </Text>
              ) : (
                <>
                  {!iframeFailed && currentIframeUrl && (
                    <Box
                      bg={{ base: "#F8F3EA", _dark: "#17131A" }}
                      borderColor={{ base: "#E6DED1", _dark: "#3A303F" }}
                      borderWidth="1px"
                      flex="1"
                      minH={0}
                      overflow="hidden"
                      rounded="lg"
                    >
                      <iframe
                        onError={() => {
                          setDetailsOpen(true);
                          setIframeFailed(true);
                        }}
                        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                        src={currentIframeUrl}
                        style={{
                          width: "100%",
                          height: "100%",
                          border: 0,
                        }}
                        title={iframeTitle}
                      />
                    </Box>
                  )}

                  <Collapsible.Root
                    open={detailsOpen}
                    onOpenChange={(event) => setDetailsOpen(event.open)}
                  >
                    <Collapsible.Trigger asChild>
                      <Button
                        alignSelf="flex-start"
                        size="sm"
                        variant="ghost"
                      >
                        David Guzik Study Guide
                        <Box
                          as="span"
                          transform={
                            detailsOpen ? "rotate(180deg)" : "rotate(0deg)"
                          }
                          transition="transform 0.15s ease"
                        >
                          <LuChevronDown />
                        </Box>
                      </Button>
                    </Collapsible.Trigger>
                    <Collapsible.Content>
                      <Box
                        bg={{ base: "#FFFDF8", _dark: "#211A24" }}
                        borderColor={{ base: "#E6DED1", _dark: "#3A303F" }}
                        borderWidth="1px"
                        mt={2}
                        p={4}
                        rounded="lg"
                      >
                        <Text fontSize="sm" fontWeight="medium">
                          {bookName} {chapter} on Blue Letter Bible
                        </Text>
                        <Text color="text.secondary" fontSize="sm" mt={1}>
                          If the guide does not load in this panel, use the
                          external link.
                        </Text>
                        <Flex
                          align="center"
                          gap={4}
                          justify="space-between"
                          mt={3}
                          wrap="wrap"
                        >
                          <Link
                            alignItems="center"
                            display="inline-flex"
                            fontSize="sm"
                            gap={1}
                            href={commentaryUrl}
                            lineHeight="1"
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            Open on Blue Letter Bible <LuExternalLink />
                          </Link>
                          <Link
                            alignItems="center"
                            display="inline-flex"
                            fontSize="sm"
                            gap={1}
                            href={BLB_COMMENTARIES_URL}
                            lineHeight="1"
                            onClick={(event) => {
                              event.preventDefault();
                              setIframeFailed(false);
                              setIframeUrl(BLB_COMMENTARIES_URL);
                              setDetailsOpen(false);
                            }}
                          >
                            Browse all BLB commentaries
                          </Link>
                        </Flex>
                      </Box>
                    </Collapsible.Content>
                  </Collapsible.Root>
                </>
              )}
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}
