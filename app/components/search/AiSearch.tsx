import { useState, useMemo } from "react";
import { Input, Button, Separator } from "@chakra-ui/react";
import Link from "next/link";
import parse from "html-react-parser";
import askGemini from "@/lib/gemini";

export default function AiSearch() {
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [geminiRes, setGeminiRes] = useState<string | undefined>("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    const res = await askGemini(query);
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
            <Link
              href={domNode.attribs.href}
              style={{ textDecoration: "underline" }}
            >
              {(domNode.children[0] as any).data}
            </Link>
          );
        }
      },
    });
  }, [geminiRes]);

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        aria-disabled={isLoading}
        aria-busy={isLoading}
      >
        <Input
          placeholder="Ask a bible question"
          disabled={isLoading}
          size="lg"
          value={query}
          onChange={(e) => setQuery(e.target.value)} // Update state on input change
        />
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
      {geminiRes && (
        <>
          <Separator my={4} />
          {geminiRes && parseRes}
        </>
      )}
    </div>
  );
}
