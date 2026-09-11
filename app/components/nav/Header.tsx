import { Flex, Heading } from "@chakra-ui/react";
import NextLink from "next/link";
import { getServerSession } from "@/lib/session";
import AuthNav from "@/app/components/nav/AuthNav";
import SettingsMenu from "@/app/components/nav/SettingsMenu";

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
          prefetch={false}
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
          <SettingsMenu />
          <AuthNav initialIsSignedIn={!!session} />
        </Flex>
      </Flex>
    </header>
  );
}
