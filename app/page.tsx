import { Box, Flex, Text } from "@chakra-ui/react";
import Image from "next/image";
import SearchOptions from "./components/search/SearchOptions";

export default function Home() {
  return (
    <main>
      <Flex
        flexDirection="column"
        alignItems="center"
        justifyContent={{ base: "start", lg: "center" }}
        height={{base: 'inherit', lg: "60vh"}}
      >
        <Box mt={{base: "0", lg: "3rem"}}>
          <Image
            src="/logo.png"
            alt="Just scripture logo"
            width={125}
            height={125}
            priority
            style={{
              objectFit: "none",
            }}
          />
        </Box>
        <Box p="0.5rem" textAlign="center">
          <Text mt="0.5rem" fontSize="0.9rem" style={{ fontStyle: "italic" }}>
            The law of the LORD is perfect, reviving the soul. (Psalm 19:7)
          </Text>
        </Box>
        <SearchOptions />
      </Flex>
    </main>
  );
}
