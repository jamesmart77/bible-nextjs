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
        borderBottomColor="var(--js-border-muted)"
        justifyContent="space-between"
        alignItems="center"
        padding={{ base: "0.65rem 0.85rem", sm: "0.85rem 1.25rem" }}
        gap={{ base: "0.3rem", sm: "0.5rem" }}
        bg="var(--js-nav-bg)"
        backdropFilter="blur(14px)"
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
            fontFamily="serif"
            fontSize={{ base: "xl", sm: "2xl" }}
            fontWeight="600"
            color="var(--js-text-primary)"
            m={0}
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
                  color="var(--js-text-primary)"
                  _hover={{ bg: "var(--js-bg-muted)" }}
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
