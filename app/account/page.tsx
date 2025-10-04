import { auth0 } from "@/lib/auth0";
import { Box, Button, Container, Heading, Icon, Link, Text } from "@chakra-ui/react";
import Image from "next/image";
import NextLink from "next/link";
import { Fade } from "react-awesome-reveal";
import { FaSignOutAlt } from "react-icons/fa";

export default async function ProfileServer() {
  const session = await auth0.getSession();
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
          <Box
            borderRadius="50%"
            position="relative"
            width="125px"
            height="125px"
            overflow="hidden"
            mb="1rem"
          >
            <Image
              priority
              fill
              style={{ objectFit: "cover", borderRadius: "50%" }}
              src={session.user.picture || ""}
              alt={session.user.name || ""}
            />
          </Box>
          <Heading as="h3" fontSize="md">
            {session.user.name}
          </Heading>
          <Text>{session.user.email}</Text>
          <Link asChild my={4}>
            <NextLink href="/privacy">Privacy policy</NextLink>
          </Link>
          <Button asChild variant="outline" mt="2rem">
            <a href="/auth/logout">
              <Icon size="md">
                <FaSignOutAlt />
              </Icon>
              Log out
            </a>
          </Button>
        </Container>
      </Fade>
    )
  );
}
