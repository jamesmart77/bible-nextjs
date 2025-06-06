import { getBiblePassage, navigateToChapter } from "@/lib/esvApi";
import {
  Container,
  Text,
  Link as ChakraLink,
  Heading,
  Box,
} from "@chakra-ui/react";
import { redirect } from "next/navigation";
import parse, { HTMLReactParserOptions, Element } from "html-react-parser";
import Link from "next/link";
import ActionsBar from "@/app/components/utilities/ActionsBar";
import { auth0 } from "@/lib/auth0";

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
          url: "https://justscripture.app/logo.webp",
          width: 50,
          height: 50,
        },
      ],
    },
  };
}

export default async function Passage({ params }: ParamProps) {
  const { book, passage } = await params;
  const session = await auth0.getSession();

  if (!passage) {
    return redirect(`/passages/${book}/1`);
  }

  const [chapter, verses] = passage;
  const { passageText, previousChapter, nextChapter } = await getBiblePassage(
    book,
    passage
  );

  const options: HTMLReactParserOptions = {
    trim: true,
    replace: (domNode) => {
      if (domNode.type === "tag" && domNode.name === "h2") {
        return (
          <Heading as="h2" fontSize="2xl" fontWeight="bold" mb="1rem">
            {domNode.children[0] && domNode.children[0].type === "text"
              ? (domNode.children[0] as any).data
              : null}
          </Heading>
        );
      }
      if (domNode.type === "tag" && domNode.name === "h3") {
        return (
          <Heading as="h3" fontSize="md" fontWeight="medium" mt="1rem" pb="0.25rem">
            {domNode.children[0] && domNode.children[0].type === "text"
              ? (domNode.children[0] as any).data
              : null}
          </Heading>
        );
      }
      if (domNode.type === "text" && domNode.data.trim() !== "") {
        return <Text as="span">{domNode.data}</Text>;
      }

      if (
        domNode.type === "tag" &&
        domNode.name === "div" &&
        (domNode as Element).attribs &&
        (domNode as Element).attribs.class === "footnotes extra_text"
      ) {
        return (
          <Box borderTop="1px solid" borderColor="gray.200" mt="1rem">
            {domNode.children && domNode.children.length > 0
              ? domNode.children.map((child) =>
                  parse(require("dom-serializer").default(child), options)
                )
              : null}
          </Box>
        );
      }
    },
  };

  const passageHtml = parse(passageText, options);

  return (
    <main>
      <Container my="2rem">
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
        userSession={session}
      />
    </main>
  );
}
