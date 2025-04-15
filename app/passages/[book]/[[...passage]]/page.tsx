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

export async function generateMetadata({ params }: ParamProps) {
  const { book, passage } = await params;

  if (!passage) {
    return null;
  }

  const [chapter, verses] = passage;
  const [startVerse, endVerse] = verses?.split("-") || [];

  const chapterVerses = `${chapter}${startVerse ? `:${startVerse}` : ""}${endVerse ? `-${endVerse}` : ""}`;

  return {
    title: `${book} ${chapterVerses}`,
    description: `Read ${book} ${chapterVerses} in the ESV Bible`,
    siteName: "JustScripture",
    openGraph: {
      title: `${book} ${chapterVerses}`,
      description: `Read ${book} ${chapterVerses} in the ESV Bible`,
      images: [
        {
          url: 'https://justscripture.app/logo.png',
          width: 150,
          height: 150,
        },
      ]
    }
  };
}

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
