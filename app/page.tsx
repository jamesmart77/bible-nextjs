import { Box, Flex, Text } from "@chakra-ui/react";
import Image from "next/image";
import { Fade } from "react-awesome-reveal";
import SearchOptions from "./components/search/SearchOptions";

export default function Home() {
  return (
    <main style={{ height: "100vh" }}>
      <Fade duration={750} triggerOnce style={{ height: "100vh" }}>
        <Flex
          flexDirection="column"
          alignItems="center"
          justifyContent={{ base: "start", sm: "center" }}
          height={{ base: "inherit", sm: "70vh" }}
        >
          <Box mt={{ base: "2rem", sm: "3rem" }}>
            <Image
              src="/logo.webp"
              alt="Just scripture logo"
              width={125}
              height={125}
              priority
              style={{
                objectFit: "none",
              }}
            />
          </Box>
          <SearchOptions />
        </Flex>
      </Fade>
    </main>
  );
}
