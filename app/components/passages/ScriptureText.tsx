"use client";

import { Fragment, useMemo, useState } from "react";
import {
  Box,
  Container,
  Heading,
  Link as ChakraLink,
  Text,
} from "@chakra-ui/react";
import Link from "next/link";
import parse, { Element, HTMLReactParserOptions } from "html-react-parser";
import { toaster, Toaster } from "@/app/components/chakra-snippets/toaster";
import { replaceEsvHtmlNode } from "@/app/utils/htmlParser";
import {
  formatSelectedVersesForShare,
  type SelectedVerse,
  toggleSelectedVerse,
} from "@/app/utils/selectedVerses";
import {
  getPassageVerseTextByNumber,
  groupParagraphNodesByVerse,
  hasVerseNumber,
  serializeHtmlNode,
} from "@/app/utils/scriptureHtmlParser";
import Copyright from "./Copyright";
import ShareSelectedVersesButton from "./ShareSelectedVersesButton";
import Verse from "./Verse";

type Props = {
  passageText: string;
  book: string;
  chapter: string;
  shouldShowFullChapterLink: boolean;
};

export default function ScriptureText({
  passageText,
  book,
  chapter,
  shouldShowFullChapterLink,
}: Props) {
  const [selectedVerses, setSelectedVerses] = useState<SelectedVerse[]>([]);
  const [hoveredVerseNum, setHoveredVerseNum] = useState<string | null>(null);
  const verseTextByNumber = useMemo(
    () => getPassageVerseTextByNumber(passageText),
    [passageText]
  );

  const isVerseSelected = (verseNum: string) =>
    selectedVerses.some((verse) => verse.verseNum === verseNum);

  const toastSuccess = (verseText: string) => {
    navigator.clipboard.writeText(verseText);
    toaster.create({
      title: "Copied to clipboard",
      type: "success",
      duration: 1500,
    });
  };

  const handleVerseClick = (verse: SelectedVerse) => {
    setSelectedVerses((prev) => toggleSelectedVerse(prev, verse));
  };

  const copySelectionsToClipboard = () => {
    const verseText = formatSelectedVersesForShare({
      selectedVerses,
      book,
      chapter,
    });

    if (navigator.share) {
      navigator
        .share({
          title: `JustScripture: ${book} ${chapter}`,
          text: verseText,
        })
        .catch(() => {
          toastSuccess(verseText);
        });
    } else {
      toastSuccess(verseText);
    }

    setSelectedVerses([]);
  };

  const parseVersesFromParagraph = (pNode: Element, index: number) => {
    const verses = groupParagraphNodesByVerse(pNode);

    return (
      <Box as="span" key={index}>
        {verses.map((verse, verseIndex) => (
          <Verse
            key={`${verse.verseNum}-${verseIndex}`}
            verse={verse}
            isSelected={isVerseSelected(verse.verseNum)}
            isHovered={hoveredVerseNum === verse.verseNum}
            onClick={() =>
              handleVerseClick({
                verseNum: verse.verseNum,
                text: verseTextByNumber.get(verse.verseNum) ?? verse.text,
              })
            }
            onMouseEnter={() => setHoveredVerseNum(verse.verseNum)}
            onMouseLeave={() => setHoveredVerseNum(null)}
          />
        ))}
      </Box>
    );
  };

  const options: HTMLReactParserOptions = {
    replace: (domNode, index) => {
      if (domNode.type === "tag" && domNode.name === "h2") {
        return (
          <Heading
            key={index}
            as="h2"
            fontSize="2xl"
            fontWeight="bold"
            mb="1rem"
          >
            {domNode.children[0] && domNode.children[0].type === "text"
              ? domNode.children[0].data
              : null}
          </Heading>
        );
      }

      if (domNode.type === "tag" && domNode.name === "p") {
        if (hasVerseNumber(domNode as Element)) {
          return parseVersesFromParagraph(domNode as Element, index);
        }
      }

      if (
        domNode.type === "tag" &&
        domNode.name === "h3" &&
        domNode.children[0] &&
        domNode.children[0].type === "text" &&
        domNode.children[0].data
      ) {
        return (
          <Heading
            key={index}
            as="h3"
            display="block"
            fontSize="md"
            fontWeight="bold"
            mt="1rem"
            pb="0.25rem"
          >
            {domNode.children.map((child, childIndex) => (
              <Fragment key={childIndex}>
                {parse(serializeHtmlNode(child), options)}
              </Fragment>
            ))}
          </Heading>
        );
      }

      if (
        domNode.type === "tag" &&
        domNode.name === "div" &&
        domNode.attribs.class === "footnotes extra_text"
      ) {
        return (
          <Box
            key={index}
            borderTop="1px solid"
            borderColor="gray.200"
            mt="1rem"
          >
            {domNode.children.map((child, childIndex) => (
              <Fragment key={`${index}-footnote-${childIndex}`}>
                {parse(serializeHtmlNode(child), options)}
              </Fragment>
            ))}
          </Box>
        );
      }

      return replaceEsvHtmlNode(domNode, index);
    },
  };

  const passageHtml = parse(passageText, options);

  return (
    <Container
      my="2rem"
      maxW={{ base: "100%", md: "900px" }}
      marginInline={{ base: "auto" }}
    >
      <Toaster />
      <Text as="section" pb={6}>
        {passageHtml}
      </Text>
      {shouldShowFullChapterLink && (
        <ChakraLink asChild fontSize="sm" mt="1rem" variant="underline">
          <Link href={`/passages/${book}/${chapter}`}>Read full chapter</Link>
        </ChakraLink>
      )}
      <ShareSelectedVersesButton
        isVisible={selectedVerses.length > 0}
        onClick={copySelectionsToClipboard}
      />
      <Copyright />
    </Container>
  );
}
