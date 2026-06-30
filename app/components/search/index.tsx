"use client";

import type { IconType } from "react-icons";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import parse from "html-react-parser";
import {
  Alert,
  Box,
  Button,
  Flex,
  Icon,
  Input,
  InputGroup,
  Separator,
  Stack,
  Text,
} from "@chakra-ui/react";
import { FiBookOpen, FiSearch } from "react-icons/fi";
import { LuWandSparkles } from "react-icons/lu";
import { Fade } from "react-awesome-reveal";
import askGemini from "@/lib/gemini";
import { saveSearchQuery } from "@/lib/db";
import { handlePassageSearch } from "@/app/utils/passageParser";
import AutocompleteInput from "./passage/Autocomplete";
import {
  getDisplayLabel,
  type RecentSearch,
  type SearchType,
} from "./searchHistoryDisplay";

type Props = {
  isSignedIn: boolean;
  recentSearches?: RecentSearch[];
  variant?: "home" | "compact";
};

const searchModes: { label: string; value: SearchType; icon: IconType }[] = [
  { label: "Passage", value: "passage", icon: FiBookOpen },
  { label: "Keyword", value: "keyword", icon: FiSearch },
  { label: "Assisted", value: "assisted", icon: LuWandSparkles },
];

const searchTypeIcon: Record<SearchType, IconType> = {
  passage: FiBookOpen,
  keyword: FiSearch,
  assisted: LuWandSparkles,
};

const searchTypePlaceholder: Record<Exclude<SearchType, "passage">, string> = {
  keyword: "Search a keyword (e.g. faith, love, redemption)",
  assisted: "Ask a Bible question (e.g. Where does Scripture talk about forgiveness?)",
};

const quickPassages = ["Genesis 1", "Psalm 23", "John 1", "Romans 8"];

function buildSearchUrl(type: SearchType, query: string) {
  const trimmedQuery = query
    .trim()
    .replace(/([A-Za-z])/, (match) => match.toUpperCase());

  if (type === "passage") {
    return handlePassageSearch(trimmedQuery);
  }

  if (type === "keyword") {
    return `/keyword/${encodeURIComponent(trimmedQuery)}?page=1`;
  }

  return undefined;
}

function recentSearchUrl(search: RecentSearch) {
  if (search.type === "assisted") return undefined;

  return buildSearchUrl(search.type, search.label);
}

export default function SearchOptions({
  isSignedIn,
  recentSearches = [],
  variant = "compact",
}: Props) {
  const router = useRouter();
  const [searchType, setSearchType] = useState<SearchType>("passage");
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasAssistedError, setHasAssistedError] = useState(false);
  const [assistedResult, setAssistedResult] = useState<string | undefined>("");

  const hasRecentSearches = isSignedIn && recentSearches.length > 0;

  const parsedAssistedResult = useMemo(() => {
    return parse(assistedResult || "", {
      replace: (domNode) => {
        if (
          domNode.type === "tag" &&
          domNode.name === "a" &&
          domNode.attribs?.href
        ) {
          return (
            <NextLink
              href={domNode.attribs.href}
              style={{ textDecoration: "underline" }}
            >
              {(domNode.children[0] as any).data}
            </NextLink>
          );
        }
      },
    });
  }, [assistedResult]);

  async function queryAssistedSearch(formattedQuery: string) {
    if (!isSignedIn) {
      return {
        hasError: true,
        result: "Log in to use Assisted search.",
      };
    }

    try {
      return {
        hasError: false,
        result: await askGemini(formattedQuery),
      };
    } catch (error) {
      console.error("Error querying AI:", error);
      return {
        hasError: true,
        result: (error as Error).message,
      };
    }
  }

  async function handleAssistedSearch() {
    const formattedQuery =
      inputValue.charAt(0).toUpperCase() + inputValue.slice(1);
    const { hasError, result } = await queryAssistedSearch(formattedQuery);

    setAssistedResult(result);

    if (hasError) {
      setHasAssistedError(true);
      return;
    }

    const saveResult = await saveSearchQuery(inputValue, "ai", result);
    if (saveResult?.status === 200) {
      router.refresh();
    }
  }

  async function handleNavigatingSearch(
    type: Exclude<SearchType, "assisted">,
  ) {
    const url = buildSearchUrl(type, inputValue);

    if (!url) {
      setIsLoading(false);
      return;
    }

    await saveSearchQuery(inputValue.trim(), type);
    router.push(url);
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!inputValue.trim()) return;

    setIsLoading(true);
    setHasAssistedError(false);

    if (searchType === "assisted") {
      await handleAssistedSearch();
      setIsLoading(false);
      return;
    }

    await handleNavigatingSearch(searchType);
  };

  const handleRecentSearchClick = (search: RecentSearch) => {
    setSearchType(search.type);
    setInputValue(search.label);
  };

  return (
    <Stack gap={variant === "home" ? "1.25rem" : "1rem"}>
      <Box
        bg="var(--js-bg-surface)"
        border="1px solid"
        borderColor="var(--js-border-muted)"
        borderRadius="2xl"
        boxShadow={{
          base: "0 18px 55px rgba(41, 32, 43, 0.08)",
          _dark: "0 18px 55px rgba(0, 0, 0, 0.26)",
        }}
        p={{ base: "1rem", sm: "1.25rem" }}
      >
        <form
          onSubmit={handleSubmit}
          aria-busy={isLoading}
          aria-disabled={isLoading}
        >
          <Flex
            as="div"
            role="tablist"
            aria-label="Select search type"
            bg="var(--js-bg-muted)"
            border="1px solid"
            borderColor="var(--js-border-muted)"
            borderRadius="xl"
            p="0.25rem"
            gap="0.25rem"
            mb="1rem"
          >
            {searchModes.map((mode) => {
              const isActive = searchType === mode.value;

              return (
                <Button
                  key={mode.value}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  variant="ghost"
                  flex="1"
                  size={{ base: "sm", sm: "md" }}
                  borderRadius="lg"
                  color={
                    isActive
                      ? "var(--js-accent-solid)"
                      : "var(--js-text-secondary)"
                  }
                  bg={isActive ? "var(--js-accent-subtle)" : "transparent"}
                  border="1px solid"
                  borderColor={
                    isActive ? "var(--js-accent-border)" : "transparent"
                  }
                  _hover={{
                    bg: isActive
                      ? "var(--js-accent-subtle)"
                      : "var(--js-bg-surface)",
                    color: "var(--js-accent-solid)",
                  }}
                  _focusVisible={{
                    outline: "2px solid",
                    outlineColor: "var(--js-accent-solid)",
                    outlineOffset: "2px",
                  }}
                  onClick={() => setSearchType(mode.value)}
                >
                  <Icon as={mode.icon} boxSize="1rem" />
                  {mode.label}
                </Button>
              );
            })}
          </Flex>

          {searchType === "passage" ? (
            <AutocompleteInput
              inputValue={inputValue}
              setInputValue={setInputValue}
              submitOnEnter={handleSubmit}
              searchType="passage"
              setSearchType={(value) => setSearchType(value)}
              placeholder="Search a Bible passage (e.g. John 3:16)"
              showSearchTypeSettings={false}
            />
          ) : (
            <InputGroup
              startElement={
                <Icon
                  as={searchTypeIcon[searchType]}
                  color="var(--js-accent-solid)"
                  boxSize="1.05rem"
                />
              }
            >
              <Input
                size="lg"
                borderRadius="xl"
                borderColor="var(--js-border-muted)"
                bg="var(--js-bg-input)"
                color="var(--js-text-primary)"
                value={inputValue}
                disabled={isLoading}
                placeholder={searchTypePlaceholder[searchType]}
                _focusVisible={{
                  borderColor: "var(--js-accent-solid)",
                  boxShadow: "0 0 0 1px var(--js-accent-solid)",
                }}
                onChange={(event) => setInputValue(event.target.value)}
              />
            </InputGroup>
          )}

          {hasAssistedError && (
            <Alert.Root status="info" variant="subtle" mt="1rem">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>{assistedResult}</Alert.Title>
              </Alert.Content>
            </Alert.Root>
          )}

          <Flex justify="center">
            <Button
              mt="1rem"
              type="submit"
              minW={{ base: "100%", sm: "11rem" }}
              loading={isLoading}
              loadingText="Searching..."
              variant="solid"
              bg="var(--js-accent-solid)"
              color="var(--js-accent-contrast)"
              borderRadius="xl"
              _hover={{ bg: "var(--js-accent-hover)" }}
              _focusVisible={{
                outline: "2px solid",
                outlineColor: "var(--js-accent-solid)",
                outlineOffset: "2px",
              }}
            >
              Search
            </Button>
          </Flex>
        </form>

        {assistedResult && !hasAssistedError && (
          <Fade triggerOnce direction="up">
            <Box
              mt="1.25rem"
              maxH="350px"
              overflowY="auto"
              color="var(--js-text-primary)"
            >
              <Separator mb="1rem" borderColor="var(--js-border-muted)" />
              {parsedAssistedResult}
            </Box>
          </Fade>
        )}
      </Box>

      {variant === "home" && (
        <Stack gap="0.65rem" align="center">
          {hasRecentSearches && (
            <Text
              fontSize="xs"
              textTransform="uppercase"
              letterSpacing="0.08em"
              color="var(--js-text-secondary)"
            >
              Recent searches
            </Text>
          )}
          <Flex justify="center" wrap="wrap" gap="0.5rem">
            {hasRecentSearches
              ? recentSearches.map((search) => {
                  const SearchIcon = searchTypeIcon[search.type];
                  const url = recentSearchUrl(search);
                  const chip = (
                    <>
                      <Icon as={SearchIcon} boxSize="0.9rem" />
                      {getDisplayLabel(search)}
                    </>
                  );

                  if (url) {
                    return (
                      <Button
                        key={search.id}
                        asChild
                        size="sm"
                        variant="outline"
                        borderRadius="full"
                        borderColor="var(--js-border-muted)"
                        color="var(--js-text-secondary)"
                        bg="var(--js-chip-bg)"
                        _hover={{
                          borderColor: "var(--js-accent-border)",
                          color: "var(--js-accent-solid)",
                        }}
                      >
                        <NextLink href={url}>{chip}</NextLink>
                      </Button>
                    );
                  }

                  return (
                    <Button
                      key={search.id}
                      type="button"
                      size="sm"
                      variant="outline"
                      borderRadius="full"
                      borderColor="var(--js-border-muted)"
                      color="var(--js-text-secondary)"
                      bg="var(--js-chip-bg)"
                      _hover={{
                        borderColor: "var(--js-accent-border)",
                        color: "var(--js-accent-solid)",
                      }}
                      onClick={() => handleRecentSearchClick(search)}
                    >
                      {chip}
                    </Button>
                  );
                })
              : quickPassages.map((passage) => (
                  <Button
                    key={passage}
                    asChild
                    size="sm"
                    variant="outline"
                    borderRadius="full"
                    borderColor="var(--js-border-muted)"
                    color="var(--js-text-secondary)"
                    bg="var(--js-chip-bg)"
                    _hover={{
                      borderColor: "var(--js-accent-border)",
                      color: "var(--js-accent-solid)",
                    }}
                  >
                    <NextLink href={buildSearchUrl("passage", passage) || "/"}>
                      {passage}
                    </NextLink>
                  </Button>
                ))}
          </Flex>
        </Stack>
      )}
    </Stack>
  );
}
