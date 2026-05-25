"use server";

import { Box, Button, Container, Heading, Link, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { Fade } from "react-awesome-reveal";
import { FaSignOutAlt } from "react-icons/fa";
import { getServerSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { COOKIE_NAME } from "@/lib/constants";
import { cookies } from "next/headers";

async function handleLogout() {
  "use server";
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/");
}

export default async function ProfileServer() {
  const session = await getServerSession();
  return (
    session && (
      <Fade duration={750} triggerOnce>
        <Container
          mt="2rem"
          display="flex"
          justifyContent="center"
          flexDir="column"
          alignItems="center"
        >
          <Heading as="h2" fontSize="3xl" mb="2rem">
            Account details
          </Heading>
          <Heading as="h3" fontSize="md" mb="2rem">
            {session.email}
          </Heading>
          <Text mb="1rem">Signed in with a simple email session.</Text>
          <Link asChild my={4}>
            <NextLink href="/privacy">Privacy policy</NextLink>
          </Link>
          <form action={handleLogout}>
            <Button asChild variant="outline" mt="2rem" type="submit">
              <button>
                <FaSignOutAlt style={{ marginRight: "0.5rem" }} />
                Log out
              </button>
            </Button>
          </form>
        </Container>
      </Fade>
    )
  );
}
