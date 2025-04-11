"use client";
import { Box, Flex, Separator } from "@chakra-ui/react";
import Image from "next/image";
import AiSearch from "./components/search/AiSearch";
import askGemini from "@/lib/gemini";
import { useState } from "react";
import parse from "html-react-parser";
import Link from "next/link";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [geminiRes, setGeminiRes] = useState<string | undefined>("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    const res = await askGemini(query);
    setGeminiRes(res);
    setIsLoading(false);
    setQuery("");
  };

  const parseRes = () => {
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
  };

  return (
    <main>
      <Flex
        flexDirection="column"
        alignItems="center"
        height="60vh"
        justifyContent="center"
      >
        <Image
          src="/logo.png"
          alt="Just scripture logo"
          width={180}
          height={38}
          priority
        />
        <Box maxWidth={{ base: "96%", md: "80%", lg: "60%" }} mt={4}>
          <AiSearch
            isLoading={isLoading}
            handleSubmit={handleSubmit}
            query={query}
            setQuery={setQuery}
          />
          {geminiRes && (
            <>
              <Separator my={4} />
              {geminiRes && parseRes()}
            </>
          )}
        </Box>
      </Flex>
    </main>
  );
}
