import { Button, Flex, HStack, Text } from "@chakra-ui/react";
import { auth0 } from "../../lib/auth0";

export default async function Header() {
  const session = await auth0.getSession();

  return (
    <header>
      <Flex
        borderBottom="1px solid"
        borderBottomColor="gray.200"
        justifyContent={{ base: "center", md: "right" }}
        padding="1rem"
        gap="0.5rem"
      >
        {!session ? (
          <>
            <Button asChild variant="outline">
              <a href="/auth/login?screen_hint=signup">Sign up</a>
            </Button>
            <Button asChild variant="ghost">
              <a href="/auth/login">Log in</a>
            </Button>
          </>
        ) : (
          <HStack>
            <Text>Welcome, {session.user.name}!</Text>
            <Button asChild variant="ghost">
              <a href="/auth/logout">Log out</a>
            </Button>
          </HStack>
        )}
      </Flex>
    </header>
  );
}
