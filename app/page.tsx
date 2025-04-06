import { Flex, Heading, Text } from "@chakra-ui/react";
import Image from "next/image";

export default function Home() {
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
        <Heading
          as="h1"
          fontWeight="bold"
          fontSize="2rem"
          width="100%"
          textAlign="center"
          mb="1rem"
        >
          JustScripture's new home
        </Heading>
        <Text>Coming soon!</Text>
      </Flex>
    </main>
  );
}
