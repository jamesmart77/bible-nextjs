import { Box, Flex, Link, Text } from "@chakra-ui/react";
import Image from "next/image";
import NextLink from "next/link";
import { Fade } from "react-awesome-reveal";
import SearchOptions from "./components/search/SearchOptions";
import { auth0 } from "@/lib/auth0";

export default async function Home() {
  const session = await auth0.getSession();
  
  return (
    <Box>
      <Box as="main" minHeight={{ base: "95vh", md: "inherit" }} pt="4rem">
        <Fade duration={750} triggerOnce>
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
            <SearchOptions isSignedIn={!!session} />
          </Flex>
        </Fade>
      </Box>
      <Box
        as="footer"
        pos={{ base: "relative", md: "fixed" }}
        bottom={0}
        width="100%"
      >
        <Flex justify="center" py={2}>
          <Text
            fontSize="xs"
            pr={2}
            borderRightColor="gray.100"
            borderRight="1px solid"
          >
            Created by{" "}
            <Link asChild color="teal.800">
              <NextLink
                href="https://jamesmart77.github.io/portfolio-v2"
                target="_blank"
                rel="noopener noreferrer"
              >
                James Martineau
              </NextLink>
            </Link>
          </Text>
          <Text fontSize="xs" ml={2}>
            <Link asChild color="teal.800">
              <NextLink href="/privacy">Privacy policy</NextLink>
            </Link>
          </Text>
        </Flex>
      </Box>
    </Box>
  );
}
