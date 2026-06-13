"use client";

import { Flex, Button } from "@chakra-ui/react";
import { useState } from "react";
import AiSearch from "./AiSearch";
import PassageSearch from "./passage/PassageSearch";
import { RiBookmarkLine, RiGeminiLine } from "react-icons/ri";

export default function SearchOptions({ isSignedIn }: { isSignedIn: boolean }) {
  const [searchType, setSearchType] = useState<"passage" | "ai">("passage");

  const isPassageSearch = searchType === "passage";
  return (
    <>
      <Flex
        justifyContent="space-between"
        mb="2rem"
        aria-label="select search type"
      >
        <Button
          variant="ghost"
          width={isPassageSearch ? "50%" : "48%"}
          border={`${isPassageSearch ? "2px" : "1px"} solid`}
          borderColor={isPassageSearch ? "gray.400" : "gray.600"}
          bg={{
            base: isPassageSearch ? "gray.200" : "transparent",
            _dark: "transparent",
          }}
          colorPalette={{
            base: "gray",
            _dark: "white",
          }}
          onClick={() => setSearchType("passage")}
        >
          <RiBookmarkLine /> Scripture search
        </Button>
        <Button
          variant="ghost"
          width={!isPassageSearch ? "50%" : "48%"}
          border={`${!isPassageSearch ? "2px" : "1px"} solid`}
          borderColor={!isPassageSearch ? "gray.400" : "gray.600"}
          bg={{
            base: !isPassageSearch ? "gray.200" : "transparent",
            _dark: "transparent",
          }}
          colorPalette={{
            base: "gray",
            _dark: "white",
          }}
          onClick={() => setSearchType("ai")}
        >
          <RiGeminiLine /> Assisted search
        </Button>
      </Flex>
      {isPassageSearch ? (
        <PassageSearch />
      ) : (
        <AiSearch isSignedIn={isSignedIn} />
      )}
    </>
  );
}
