import { Container, Heading, Text } from "@chakra-ui/react";
import { redirect } from "next/navigation";

type ParamProps = {
  params: Promise<{
    book: string;
    slug: string[];
  }>;
};

export default async function Passage({ params }: ParamProps) {
  const { book, slug } = await params;

  if (!slug) {
    return redirect(`/passages/${book}/1`);
  }

  const chapter = slug && slug[0];
  const verses = (slug[1] && slug[1].split("-")) || [];
  const startVerse = verses[0];
  const endVerse = verses[1];

  return (
    <Container mt="2rem">
      <Heading as="h2">URL Parameters</Heading>
      <Text>
        <strong>Book:</strong> {book}
      </Text>
      <Text>
        <strong>Chapter:</strong>
        {chapter}
      </Text>
      {startVerse && (
        <Text>
          <strong>Start Verse:</strong> {startVerse}
        </Text>
      )}
      {endVerse && (
        <Text>
          <strong>End Verse:</strong> {endVerse}
        </Text>
      )}
    </Container>
  );
}
