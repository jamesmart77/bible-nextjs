import { getBiblePassage, navigateToChapter } from "@/lib/esvApi";
import { Container, Text, Link as ChakraLink } from "@chakra-ui/react";
import { redirect } from "next/navigation";
import parse from "html-react-parser";
import Link from "next/link";
import ActionsBar from "@/app/components/utilities/ActionsBar";

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

  const chapterVerses = `${chapter}${startVerse ? `:${startVerse}` : ""}${
    endVerse ? `-${endVerse}` : ""
  }`;

  const capitalizedBook = book.charAt(0).toUpperCase() + book.slice(1);

  return {
    title: `${capitalizedBook} ${chapterVerses}`,
    description: `Read ${capitalizedBook} ${chapterVerses} in the ESV Bible`,
    siteName: "JustScripture",
    openGraph: {
      title: `${capitalizedBook} ${chapterVerses}`,
      description: `Read ${capitalizedBook} ${chapterVerses} in the ESV Bible`,
      images: [
        {
          url: "https://justscripture.app/logo.png",
          width: 50,
          height: 50,
        },
      ],
    },
  };
}

export default async function Passage({ params }: ParamProps) {
  const { book, passage } = await params;

  if (!passage) {
    return redirect(`/passages/${book}/1`);
  }

  const [chapter, verses] = passage;
  const { passageText, previousChapter, nextChapter } = await getBiblePassage(
    book,
    passage
  );
  const passageHtml = parse(passageText, { trim: true });

  return (
    <main>
      <Container mt="2rem">
        <Text as="section">{passageHtml}</Text>
        {verses && (
          <ChakraLink asChild fontSize="sm" mt="1rem" variant="underline">
            <Link href={`/passages/${book}/${chapter}`}>Read full chapter</Link>
          </ChakraLink>
        )}
      </Container>
      <ActionsBar
        navigateToChapter={navigateToChapter}
        previousChapter={previousChapter}
        nextChapter={nextChapter}
      />
    </main>
  );
}
