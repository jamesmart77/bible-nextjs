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
          <Heading as="h1" size={{ base: "2xl", sm: "3xl" }} color="teal.700">
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
            <Button asChild variant="ghost">
              <a href="/account">Account</a>
            </Button>
            // {/* <Text>Welcome, {session.user.name}!</Text> */}
            // {/* <Button asChild variant="ghost">
            //   <a href="/auth/logout">Log out</a>
            // </Button> */}
          )}
        </div>
      </Flex>
    </header>
  );
}
