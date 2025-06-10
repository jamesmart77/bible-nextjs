import { Heading, Box, Container, Text, Link as ChakraLink, } from "@chakra-ui/react";
import parse, { HTMLReactParserOptions, Element } from "html-react-parser";
import Link from "next/link";

type Props = {
  passageText: string;
  book: string;
  chapter: string;
  shouldShowFullChapterLink: boolean;
};

export default function ScriptureText({ passageText, book, chapter, shouldShowFullChapterLink }: Props) {
  const options: HTMLReactParserOptions = {
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
  
        // footnotes formatting
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
    <Container my="2rem">
        <Text as="section">{passageHtml}</Text>
        {shouldShowFullChapterLink && (
          <ChakraLink asChild fontSize="sm" mt="1rem" variant="underline">
            <Link href={`/passages/${book}/${chapter}`}>Read full chapter</Link>
          </ChakraLink>
        )}
      </Container>
  );
}