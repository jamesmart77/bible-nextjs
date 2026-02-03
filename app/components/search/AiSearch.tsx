import { useState, useMemo } from "react";
import {
  Input,
  Button,
  Separator,
  Alert,
  Link as ChakraLink,
  Icon,
  Box,
} from "@chakra-ui/react";
import NextLink from "next/link";
import parse from "html-react-parser";
import askGemini from "@/lib/gemini";
import { saveSearchQuery } from "@/lib/db";
import { RiAccountCircle2Line } from "react-icons/ri";
import { Fade } from "react-awesome-reveal";

export default function AiSearch({ isSignedIn }: { isSignedIn: boolean }) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasGeminiError, setHasGeminiError] = useState(false);
  const [query, setQuery] = useState("");
  const [geminiRes, setGeminiRes] = useState<string | undefined>("");

  async function queryAI(query: string) {
    if (!isSignedIn) {
      return {
        hasError: true,
        res: "You must be signed in to use Smart Search.",
      };
    }

    try {
      const res = await askGemini(query);
      return {
        hasError: false,
        res,
      };
    } catch (error) {
      console.error("Error querying AI:", error);
      return {
        hasError: true,
        res: (error as Error).message,
      };
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setHasGeminiError(false);

    const formattedQuery = query.charAt(0).toUpperCase() + query.slice(1);
    const { hasError, res } = await queryAI(formattedQuery);
    if (hasError) {
      setHasGeminiError(true);
    } else {
      await saveSearchQuery(query, "ai", res);
    }

    setGeminiRes(res);
    setIsLoading(false);
  };

  const parseRes = useMemo(() => {
    return parse(geminiRes || "", {
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
  }, [geminiRes]);

  if (!isSignedIn)
    return (
      <Alert.Root status="info" variant="subtle" mt={4}>
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Log in to use Smart Search</Alert.Title>
        </Alert.Content>
        <ChakraLink asChild alignSelf="center" fontWeight="medium">
          <NextLink href="/auth/login">
            <Icon ml="0.25rem">
              <RiAccountCircle2Line />
            </Icon>
            Log In
          </NextLink>
        </ChakraLink>
      </Alert.Root>
    );

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        aria-disabled={isLoading}
        aria-busy={isLoading}
      >
        <Input
          size="lg"
          placeholder="Ask a bible question"
          disabled={isLoading}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {hasGeminiError && (
          <Alert.Root status="error" mt={4}>
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title fontWeight="bold">Smart Search Error</Alert.Title>
              <Alert.Description>
                {geminiRes}. Refresh the page and try again.
              </Alert.Description>
            </Alert.Content>
          </Alert.Root>
        )}
        <Button
          mt="0.5rem"
          type="submit"
          width="100%"
          loading={isLoading}
          loadingText="Searching..."
        >
          Search
        </Button>
      </form>
      {geminiRes && !hasGeminiError && (
        <Fade triggerOnce direction="up">
          <Box mb={8}>
            <Separator my={4} />
            {geminiRes && parseRes}
          </Box>
        </Fade>
      )}
    </div>
  );
}
