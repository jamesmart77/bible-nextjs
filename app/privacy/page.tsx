import { Fade } from "react-awesome-reveal";
import { Box, Heading, Link, List, Text } from "@chakra-ui/react";
import NextLink from "next/link";

type ParamProps = {
  params: Promise<{
    book: string;
    passage: string[];
  }>;
};

export async function generateMetadata({ params }: ParamProps) {
  return {
    title: "Privacy Policy - JustScripture",
    description: "Read our privacy policy to learn how we handle your data.",
    siteName: "JustScripture",
    openGraph: {
      title: "Privacy Policy - JustScripture",
      description: "Read our privacy policy to learn how we handle your data.",
      images: [
        {
          url: "https://www.justscripture.app/logo.webp",
          width: 50,
          height: 50,
        },
      ],
    },
  };
}

export default async function Passage({ params }: ParamProps) {
  const today = new Date();
  const dateString = today.toISOString().split("T")[0];
  return (
    <main>
      <Fade duration={750} triggerOnce>
        <Box px={{ base: 4, md: 8 }} py={8} maxW="800px">
          <Heading as="h1" size="3xl">
            Privacy policy
          </Heading>
          <Heading as="h2" size="lg" mt={2} mb={2}>
            Effective Date: {dateString}
          </Heading>
          <Text>
            JustScripture provides an ESV Bible reading and search app available
            at{" "}
            <Link color="blue.700" asChild>
              <NextLink href="/">https://justscripture.app</NextLink>
            </Link>
            . This Privacy Policy explains how your information is collected,
            used, and protected when you use the app.
          </Text>
          <Heading as="h2" size="2xl" mt={8}>
            Information collected
          </Heading>
          <List.Root variant="marker" mt={4} mb={8} gap={4} pl={6}>
            <List.Item>
              <strong>Information from sign-in</strong>: We use your email
              address to create a user record in our database. If you sign in
              with Google, we do not store name or profile picture - those are
              only used for display purposes during your session.
            </List.Item>
            <List.Item>
              <strong>App usage data</strong>: We store your search history and
              associate it with your email address so you can revisit your past
              searches.
            </List.Item>
          </List.Root>
          <Heading as="h2" size="2xl" mt={8}>
            How your information is used
          </Heading>
          <Text>We use the information we collect to:</Text>
          <List.Root variant="marker" mt={4} mb={8} gap={4} pl={6}>
            <List.Item>
              Allow you to sign in and maintain your account
            </List.Item>
            <List.Item>Provide access to your search history</List.Item>
          </List.Root>
          <Text mt={-4}>
            Your personal information is not sold or shared with third parties,
            ever, for any reason.
          </Text>
          <Heading as="h2" size="2xl" mt={8}>
            Data storage and retention
          </Heading>
          <List.Root variant="marker" mt={4} mb={8} gap={4} pl={6}>
            <List.Item>Your data is stored securely in our database.</List.Item>
            <List.Item>
              We keep your information only as long as necessary to provide the
              service.
            </List.Item>
            <List.Item>
              You may request deletion of your account and all associated data
              at any time by contacting us.
            </List.Item>
          </List.Root>
          <Heading as="h2" size="2xl" mt={8} mb={2}>
            Security
          </Heading>
          <Text>
            We take reasonable measures to protect your personal information,
            including encryption in transit, restricted database access, and
            encryption of your data at storage. However, no online service can
            guarantee 100% security.
          </Text>
          <Heading as="h2" size="2xl" mt={8} mb={2}>
            Policy changes
          </Heading>
          <Text>
            This Privacy Policy may be updated from time to time. If significant
            changes are made, the "Effective Date" at the top of this page will
            be updated.
          </Text>
          <Heading as="h2" size="2xl" mt={8} mb={2}>
            Contact Us
          </Heading>
          <Text>
            If you have any questions or requests regarding this Privacy Policy,
            you can contact the creator and maintainer of JustScripture, James
            Martineau, at:
            <Link
              color="blue.700"
              href="mailto:jamesmart77@gmail.com"
              target="_blank"
            >
              jamesmart77@gmail.com
            </Link>
          </Text>
        </Box>
      </Fade>
    </main>
  );
}
