"use client";

import { Box, Flex, Button } from "@chakra-ui/react";
import { useState } from "react";
import AiSearch from "./AiSearch";
import PassageSearch from "./passage/PassageSearch";
import { RiBookmarkLine, RiGeminiLine } from "react-icons/ri";

export default function SearchOptions() {
  const [searchType, setSearchType] = useState<"passage" | "ai">("passage");

  const isPassageSearch = searchType === "passage";
  return (
    <Box
      p="2rem"
      minWidth={{ base: "90%", md: "70%", lg: "60%" }}
    >
      <Flex justifyContent="space-between" mb="2rem" aria-label="select search type">
        <Button
          color="gray.800"
          width={isPassageSearch ? "50%" : "48%"}
          variant={isPassageSearch ? "solid" : "outline"}
          backgroundColor={isPassageSearch ? "gray.300" : "inherit"}
          onClick={() => setSearchType("passage")}
          _hover={{
            backgroundColor: !isPassageSearch ? "gray.100" : "gray.300"
          }}
        >
          <RiBookmarkLine /> Scripture search
        </Button>
        <Button
          color="gray.800"
          width={!isPassageSearch ? "50%" : "48%"}
          variant={!isPassageSearch ? "solid" : "outline"}
          backgroundColor={!isPassageSearch ? "gray.300" : "inherit"}
          onClick={() => setSearchType("ai")}
          _hover={{
            backgroundColor: isPassageSearch ? "gray.100" : "gray.300"
          }}
        >
          <RiGeminiLine /> Smart search 
        </Button>
      </Flex>
      {isPassageSearch ? <PassageSearch /> : <AiSearch />}
    </Box>
  );
}
