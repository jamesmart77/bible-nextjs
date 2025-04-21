import { Button, Flex, Heading, HStack, Text } from "@chakra-ui/react";
import { auth0 } from "../../lib/auth0";
import Link from "next/link";

export default async function Header() {
  const session = await auth0.getSession();

  return (
    <header>
      <Flex
        borderBottom="1px solid"
        borderBottomColor="gray.200"
        justifyContent="space-between"
        padding={{ base: "0.5rem", sm: "1rem" }}
        gap={{ base: "0.3rem", sm: "0.5rem" }}
      >
        <Link
          href="/"
          style={{
            textDecoration: "none",
            alignItems: "center",
            display: "flex",
          }}
        >
          <Heading
            as="h1"
            size="2xl"
            color="teal.700"
            style={{ textShadow: "2px 2px 5px rgba(0, 0, 0, 0.3)" }}
          >
            Just Scripture
          </Heading>
        </Link>
        <div>
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
        </div>
      </Flex>
    </header>
  );
}
