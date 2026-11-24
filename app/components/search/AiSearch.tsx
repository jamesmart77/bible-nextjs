import { useState, useMemo } from "react";
import { Input, InputGroup, Button, Separator, Alert, Icon, Box } from "@chakra-ui/react";
import ClearSearchButton from "./ClearSearchButton";
import { parseAssistedHtml } from "@/lib/assistedHtml";
import askGemini from "@/lib/gemini";
import { saveSearchQuery } from "@/lib/db";
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
      const response = await askGemini(query);
      return {
        hasError: !response.ok,
        res: response.ok ? response.html : response.message,
      };
    } catch (error) {
      console.error("Error querying AI:", error);
      return {
        hasError: true,
        res: "Assisted search is temporarily unavailable. Please try again.",
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
      try {
        await saveSearchQuery(query, "ai", res);
      } catch (error) {
        console.error("Unable to save assisted search history:", error);
      }
    }

    setGeminiRes(res);
    setIsLoading(false);
  };

  const parseRes = useMemo(() => {
    return parseAssistedHtml(geminiRes || "");
  }, [geminiRes]);

  if (!isSignedIn)
    return (
      <>
        <Alert.Root status="info" variant="subtle" mt={4}>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Log in above to use Smart Search</Alert.Title>
          </Alert.Content>
        </Alert.Root>
      </>
    );

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        aria-disabled={isLoading}
        aria-busy={isLoading}
      >
        <InputGroup
          data-search-field
          endElementProps={{ pointerEvents: "auto" }}
          endElement={query ? <ClearSearchButton disabled={isLoading} onClear={() => setQuery("")} /> : undefined}
        >
        <Input
          size="lg"
          placeholder="Ask a bible question"
          disabled={isLoading}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        </InputGroup>
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
          variant="solid"
          color={{
            base: "white",
            _dark: "gray.300",
          }}
          bg={{
            base: "gray.700",
            _dark: "teal.700",
          }}
        >
          Search
        </Button>
      </form>
      {geminiRes && !hasGeminiError && (
        <Fade triggerOnce direction="up">
          <Box mb={8} maxH="350px" overflowY="scroll">
            <Separator my={4} />
            {geminiRes && parseRes}
          </Box>
        </Fade>
      )}
    </div>
  );
}
