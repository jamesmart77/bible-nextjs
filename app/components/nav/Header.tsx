import { Flex, Heading, IconButton } from "@chakra-ui/react";
import NextLink from "next/link";
import { RiAccountCircleLine } from "react-icons/ri";
import { Link as ChakraLink } from "@chakra-ui/react";
import { getServerSession } from "@/lib/session";
import SignInModal from "@/app/components/nav/SignInModal";
import { ColorModeButton } from "@/app/theme/ColorMode";

export default async function Header() {
  const session = await getServerSession();

  return (
    <header>
      <Flex
        borderBottom="1px solid"
        borderBottomColor={{
          base: "gray.300",
          _dark: "gray.600",
        }}
        justifyContent="space-between"
        padding={{ base: "0.5rem", sm: "1rem" }}
        gap={{ base: "0.3rem", sm: "0.5rem" }}
      >
        <NextLink
          href="/"
          style={{
            textDecoration: "none",
            alignItems: "center",
            display: "flex",
          }}
        >
          <Heading
            as="h1"
            size={{ base: "2xl", sm: "3xl" }}
            color={{
              base: "teal.700",
              _dark: "gray.300",
            }}
          >
            JustScripture
          </Heading>
        </NextLink>
        <Flex alignItems="center" gap="0.5rem">
          <ColorModeButton />
          {!session ? (
            <SignInModal />
          ) : (
            <ChakraLink asChild title="Account">
              <NextLink href="/account">
                <IconButton
                  rounded="full"
                  aria-label="Navigate to account page"
                  variant="ghost"
                  size="md"
                >
                  <RiAccountCircleLine />
                </IconButton>
              </NextLink>
            </ChakraLink>
          )}
        </Flex>
      </Flex>
    </header>
  );
}
