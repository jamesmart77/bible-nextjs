"use client";

import { Box, Flex, Button } from "@chakra-ui/react";
import { useState } from "react";
import AiSearch from "./AiSearch";
import PassageSearch from "./PassageSearch";
import { RiGeminiLine } from "react-icons/ri";

export default function SearchOptions() {
  const [searchType, setSearchType] = useState<"passage" | "ai">("passage");

  const isPassageSearch = searchType === "passage";
  return (
    <Box
      mt="3rem"
      p="2rem"
      borderTop="1px solid"
      borderColor="gray.300"
      minWidth={{ base: "90%", md: "70%", lg: "60%" }}
    >
      <Flex justifyContent="space-between" mb="2rem">
        <Button
          width={isPassageSearch ? "50%" : "48%"}
          variant={isPassageSearch ? "subtle" : "outline"}
          onClick={() => setSearchType("passage")}
        >
          Passage search
        </Button>
        <Button
          width={!isPassageSearch ? "50%" : "48%"}
          variant={!isPassageSearch ? "subtle" : "outline"}
          onClick={() => setSearchType("ai")}
        >
          Smart search <RiGeminiLine />
        </Button>
      </Flex>
      {isPassageSearch ? <PassageSearch /> : <AiSearch />}
    </Box>
  );
}
