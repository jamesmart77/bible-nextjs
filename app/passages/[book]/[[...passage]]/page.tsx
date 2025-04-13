import getBiblePassage from "@/lib/esvApi";
import { Container, Text } from "@chakra-ui/react";
import { redirect } from "next/navigation";
import parse from "html-react-parser";

type ParamProps = {
  params: Promise<{
    book: string;
    passage: string[];
  }>;
};

export default async function Passage({ params }: ParamProps) {
  const { book, passage } = await params;

  if (!passage) {
    return redirect(`/passages/${book}/1`);
  }

  const passageRes = await getBiblePassage(book, passage);
  const passageHtml = parse(passageRes, {trim: true});

  return (
    <Container mt="2rem">
      <Text>{passageHtml}</Text>
    </Container>
  );
}
