"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import Copyright from "@/app/components/passages/Copyright";
import {
  countCachedVerses,
  ESV_OFFLINE_VERSE_LIMIT,
  getCachedPassage,
  listCachedPassages,
  type CachedPassage,
} from "@/lib/offline/passageCache";

function isPassagePath(pathname: string) {
  return pathname.startsWith("/passages/");
}

export default function OfflineLibrary() {
  const [passages, setPassages] = useState<CachedPassage[]>([]);
  const [selectedPassage, setSelectedPassage] =
    useState<CachedPassage | null>(null);
  const [requestedPassageMissing, setRequestedPassageMissing] = useState(false);
  const [requestedPassagePath, setRequestedPassagePath] = useState<
    string | null
  >(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");

  const refreshLibrary = useCallback(async () => {
    const cachedPassages = await listCachedPassages();
    setPassages(cachedPassages);
    return cachedPassages;
  }, []);

  useEffect(() => {
    const pathname = window.location.pathname;
    const updateConnectionState = () => setIsOnline(navigator.onLine);

    updateConnectionState();
    window.addEventListener("online", updateConnectionState);
    window.addEventListener("offline", updateConnectionState);

    void refreshLibrary()
      .then(async () => {
        if (isPassagePath(pathname)) {
          setRequestedPassagePath(pathname);
          const requestedPassage = await getCachedPassage(pathname);
          setSelectedPassage(requestedPassage ?? null);
          setRequestedPassageMissing(!requestedPassage);
        }
      })
      .catch((error) => {
        console.warn("Unable to open the offline passage library:", error);
      })
      .finally(() => setIsLoading(false));

    return () => {
      window.removeEventListener("online", updateConnectionState);
      window.removeEventListener("offline", updateConnectionState);
    };
  }, [refreshLibrary]);

  const totalVerseCount = useMemo(
    () => countCachedVerses(passages),
    [passages],
  );
  const visiblePassages = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return passages;

    return passages.filter(
      (passage) =>
        passage.reference.toLowerCase().includes(normalizedQuery) ||
        passage.verses.some((verse) =>
          verse.text.toLowerCase().includes(normalizedQuery),
        ),
    );
  }, [passages, query]);

  const selectPassage = async (passage: CachedPassage) => {
    try {
      await getCachedPassage(passage.url);
    } catch (error) {
      console.warn("Unable to update the cached passage:", error);
    }

    window.location.assign(passage.url);
  };

  return (
    <Box as="main" minH="calc(100vh - 73px)" py={{ base: 8, md: 12 }}>
      <Container maxW="3xl">
        <Stack gap={8}>
          <Stack gap={2}>
            <Text
              color={isOnline ? "var(--js-accent-solid)" : "orange.600"}
              fontSize="sm"
              fontWeight="semibold"
              aria-live="polite"
            >
              {isOnline ? "Back online" : "You’re offline"}
            </Text>
            {!requestedPassagePath && (
              <>
                <Heading
                  as="h1"
                  fontFamily="serif"
                  fontSize={{ base: "3xl", md: "4xl" }}
                >
                  Offline Scripture library
                </Heading>
                <Text color="var(--js-text-secondary)">
                  Passages you read online are saved on this device, up to the
                  ESV limit of {ESV_OFFLINE_VERSE_LIMIT} verses.
                </Text>
              </>
            )}
            {isOnline && (
              <Box>
                <Button onClick={() => window.location.reload()} size="sm">
                  Try loading this page again
                </Button>
              </Box>
            )}
          </Stack>

          {isLoading ? (
            <Text color="var(--js-text-secondary)">Opening saved passages…</Text>
          ) : requestedPassagePath ? (
            <>
              {requestedPassageMissing ? (
                <Box
                  border="1px solid"
                  borderColor="orange.300"
                  borderRadius="lg"
                  p={4}
                >
                  <Heading as="h1" fontSize="xl" mb={2}>
                    Passage not available offline
                  </Heading>
                  <Text mb={4}>
                    This passage has not been saved on this device.
                  </Text>
                  <Button onClick={() => window.location.assign("/offline")}>
                    Browse saved passages
                  </Button>
                </Box>
              ) : selectedPassage ? (
                <Box as="article">
                  <Flex align="center" justify="space-between" gap={4} mb={5}>
                    <Heading as="h1" fontFamily="serif" fontSize="3xl">
                      {selectedPassage.reference}
                    </Heading>
                    <Button
                      onClick={() => window.location.assign("/offline")}
                      size="sm"
                      variant="outline"
                    >
                      Saved passages
                    </Button>
                  </Flex>
                  <Stack gap={3}>
                    {selectedPassage.verses.map((verse) => (
                      <Text
                        key={verse.key}
                        fontFamily="serif"
                        fontSize="lg"
                        lineHeight="1.8"
                      >
                        <Box
                          as="sup"
                          color="var(--js-accent-solid)"
                          fontFamily="body"
                          fontSize="xs"
                          fontWeight="bold"
                          mr={1}
                        >
                          {verse.verseNum}
                        </Box>
                        {verse.text}
                      </Text>
                    ))}
                  </Stack>
                  <Copyright />
                </Box>
              ) : null}
            </>
          ) : passages.length === 0 ? (
            <Box
              border="1px solid"
              borderColor="var(--js-border-muted)"
              borderRadius="lg"
              p={6}
            >
              <Heading as="h2" fontSize="lg" mb={2}>
                No passages saved yet
              </Heading>
              <Text color="var(--js-text-secondary)">
                Visit a passage while online. It will be available here the next
                time your connection drops.
              </Text>
            </Box>
          ) : (
            <>
              <Box>
                <Flex align="baseline" justify="space-between" gap={4} mb={3}>
                  <Heading as="h2" fontSize="lg">
                    Saved passages
                  </Heading>
                  <Text color="var(--js-text-secondary)" fontSize="sm">
                    {totalVerseCount} / {ESV_OFFLINE_VERSE_LIMIT} verses
                  </Text>
                </Flex>
                <Input
                  aria-label="Search saved passages"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search saved references or verse text"
                  value={query}
                  mb={3}
                />
                {visiblePassages.length > 0 ? (
                  <Flex gap={2} wrap="wrap">
                    {visiblePassages.map((passage) => (
                      <Button
                      key={passage.url}
                      onClick={() => void selectPassage(passage)}
                      size="sm"
                      variant="outline"
                      >
                        {passage.reference}
                      </Button>
                    ))}
                  </Flex>
                ) : (
                  <Text color="var(--js-text-secondary)" fontSize="sm">
                    No saved passages match that search.
                  </Text>
                )}
              </Box>

            </>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
