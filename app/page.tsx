import {
  Box,
  Container,
  Flex,
  Heading,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { Fade } from "react-awesome-reveal";
import SearchOptions from "./components/search";
import { mapSearchHistoryForHome } from "./components/search/searchHistoryDisplay";
import { getServerSession } from "@/lib/session";
import { getUserSearchHistory } from "@/supabase/utils/user";

export default async function Home() {
  const session = await getServerSession();
  const searchHistory = session ? await getUserSearchHistory(session.id) : [];
  const recentSearches = mapSearchHistoryForHome(searchHistory);

  return (
    <Box minH="calc(100vh - 73px)" display="flex" flexDirection="column">
      <Box
        as="main"
        flex="1"
        pt={{ base: "3rem", md: "4.5rem" }}
        pb={{ base: "3rem", md: "5rem" }}
        bg={{
          base: "radial-gradient(circle at 50% 0%, rgba(45, 140, 132, 0.08), transparent 34%), var(--js-bg-body)",
          _dark:
            "radial-gradient(circle at 50% 0%, rgba(45, 140, 132, 0.13), transparent 36%), var(--js-bg-body)",
        }}
      >
        <Fade duration={750} triggerOnce>
          <Container
            maxW="3xl"
            display="flex"
            flexDirection="column"
            alignItems="center"
          >
            <Stack
              gap="0.35rem"
              align="center"
              textAlign="center"
              mb={{ base: "1.25rem", md: "1.5rem" }}
            >
              <Heading
                as="h2"
                fontFamily="serif"
                fontSize={{ base: "2xl", md: "3xl" }}
                fontWeight="500"
                lineHeight="1.1"
                color="var(--js-text-primary)"
                m={0}
              >
                {session ? "Welcome back." : "Draw near to the Lord"}
              </Heading>
              <Text
                maxW="32rem"
                fontSize={{ base: "sm", md: "md" }}
                color="var(--js-text-secondary)"
              >
                {session
                  ? "Resume delighting in God's word."
                  : "A quiet, distraction-free way to read and search Scripture."}
              </Text>
            </Stack>
            <Box width="100%" maxW="42rem">
              <SearchOptions
                isSignedIn={!!session}
                recentSearches={recentSearches}
                variant="home"
              />
            </Box>
          </Container>
        </Fade>
      </Box>
      <Box
        as="footer"
        width="100%"
        borderTop="1px solid"
        borderColor="var(--js-border-muted)"
      >
        <Flex justify="center" py={3}>
          <Text
            fontSize="xs"
            pr={2}
            borderRightColor="var(--js-border-muted)"
            borderRight="1px solid"
            color="var(--js-text-secondary)"
          >
            Created by{" "}
            <Link asChild color="var(--js-accent-solid)">
              <NextLink
                href="https://jamesmart77.github.io/portfolio-v2"
                target="_blank"
                rel="noopener noreferrer"
              >
                James Martineau
              </NextLink>
            </Link>
          </Text>
          <Text fontSize="xs" ml={2} color="var(--js-text-secondary)">
            <Link asChild color="var(--js-accent-solid)">
              <NextLink href="/privacy">Privacy Policy</NextLink>
            </Link>
          </Text>
        </Flex>
      </Box>
    </Box>
  );
}
