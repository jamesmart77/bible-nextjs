"use client";
import { Container, Heading, Text } from "@chakra-ui/react";
import { useSearchParams } from "next/navigation";

export default function ErrorContent() {
  const searchParams = useSearchParams();
  const errorMsg = searchParams.get("error");
  return (
    <main>
      <Container>
        <Heading as="h1" size="xl" mb={4}>
          Oops! Something went wrong.
        </Heading>
        <Text>An error occurred while processing your request.</Text>
        {errorMsg && (
          <Text mb={4}>
            Detail error message:{" "}
            {errorMsg}
          </Text>
        )}
        <Text>
          Please try again and if the problem persists, please contact James.
        </Text>
      </Container>
    </main>
  );
}
