"use client";

import { Fragment, useState } from "react";
import {
  Heading,
  Box,
  Container,
  Text,
  Link as ChakraLink,
  IconButton,
} from "@chakra-ui/react";
import { toaster, Toaster } from "@/app/components/chakra-snippets/toaster";
import parse, { HTMLReactParserOptions, Element } from "html-react-parser";
import Link from "next/link";
import { RiShareFill } from "react-icons/ri";
import { Bounce } from "react-awesome-reveal";

type Props = {
  passageText: string;
  book: string;
  chapter: string;
  shouldShowFullChapterLink: boolean;
};

type SelectedVerse = {
  verseNum: string;
  text: string;
};

export default function ScriptureText({
  passageText,
  book,
  chapter,
  shouldShowFullChapterLink,
}: Props) {
  const [selectedVerses, setSelectedVerses] = useState<SelectedVerse[]>([]);

  // Helper to check if a verse is selected
  const isVerseSelected = (verseNum: string) =>
    selectedVerses.some((v) => v.verseNum === verseNum);

  const toastSuccess = (verseText: string) => {
    navigator.clipboard.writeText(verseText);
    toaster.create({
      title: "Copied to clipboard",
      type: "success",
      duration: 1500,
    });
  };

  // Toggle verse selection
  const handleVerseClick = (verseNum: string, text: string) => {
    setSelectedVerses((prev) => {
      const exists = prev.find((v) => v.verseNum === verseNum);
      let updated;
      if (exists) {
        updated = prev.filter((v) => v.verseNum !== verseNum);
      } else {
        updated = [...prev, { verseNum, text }];
      }
      // Sort: "1:1" first, then numerically
      return updated.sort((a, b) => {
        const parseNum = (v: string) => (v === "1:1" ? 0 : parseInt(v, 10));
        return parseNum(a.verseNum) - parseNum(b.verseNum);
      });
    });
  };

  const copySelectionsToClipboard = () => {
    const verseLines = selectedVerses.map((v) => v.text);
    const verseText = [
      verseLines.join(" "),
      `\n${book} ${chapter} | JustScripture (ESV)`,
      `Read the full chapter: https://www.justscripture.app/passages/${book}/${chapter}`,
    ].join("\n");

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
  };

  // Custom parser to group verses in <p> by <b class="chapter-num"> and <b class="verse-num">
  const parseVersesFromParagraph = (pNode: Element, index: number) => {
    const children = pNode.children || [];
    const verses: { verseNum: string; nodes: any[] }[] = [];
    let currentVerseNum = "";
    let currentNodes: any[] = [];
    let collecting = false;

    children.forEach((child) => {
      if (
        child.type === "tag" &&
        child.name === "b" &&
        child.attribs &&
        (child.attribs.class === "chapter-num" ||
          child.attribs.class === "verse-num")
      ) {
        // If already collecting, push previous verse
        if (collecting && currentVerseNum) {
          verses.push({ verseNum: currentVerseNum, nodes: [...currentNodes] });
        }
        // Start new verse
        collecting = true;
        currentVerseNum =
          child.children &&
          child.children[0] &&
          child.children[0].type === "text" &&
          typeof (child.children[0] as any).data === "string"
            ? (child.children[0] as any).data.replace(/\u00a0/g, "").trim() // Remove &nbsp;
            : "";
        currentNodes = [child];
      } else if (collecting) {
        if (
          child.type === "tag" &&
          child.name === "sup" &&
          child.children?.length > 0
        ) {
          child.children.forEach((supChild) => {
            if (supChild.type === "tag" && supChild.name === "a") {
              supChild.attribs = { ...supChild.attribs, href: "#" };
            }
          });
        }
        currentNodes.push(child);
      }
    });
    // Push last verse
    if (collecting && currentVerseNum) {
      verses.push({ verseNum: currentVerseNum, nodes: [...currentNodes] });
    }
    return (
      <Box as="span" key={index}>
        {verses.map((verse, vIdx) => {
          // Render ONLY verse text for selection -- not cross refs or anything else
          const verseText = verse.nodes
            .map((n) => {
              if (n.type === "text") return n.data;
              if (n.type === "tag" && n.children)
                return n.children.map((c: any) => c.data || "").join("");
              return "";
            })
            .join("")
            .replace(/\s+/g, " ")
            .trim();
          return (
            <Box
              as="span"
              key={verse.verseNum + vIdx}
              bg={isVerseSelected(verse.verseNum) ? "yellow.300" : undefined}
              cursor="pointer"
              borderRadius="md"
              px={1}
              mx={0.5}
              onClick={() => handleVerseClick(verse.verseNum, verseText)}
              _hover={{
                textDecor: "underline dotted",
                textUnderlineOffset: "6px",
                textDecorationColor: "gray.300", // set dotted line color
              }}
            >
              {verse.nodes.map((n, i) => (
                <Fragment key={i}>
                  {parse(require("dom-serializer").default(n))}
                </Fragment>
              ))}
            </Box>
          );
        })}
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
              ? (domNode.children[0] as any).data
              : null}
          </Heading>
        );
      }
      if (domNode.type === "tag" && domNode.name === "p") {
        // Group and render verses
        return parseVersesFromParagraph(domNode as Element, index);
      }
      if (
        domNode.type === "tag" &&
        domNode.name === "h3" &&
        domNode.children[0] &&
        domNode.children[0].type === "text" &&
        (domNode.children[0] as any).data
      ) {
        return (
          <Heading
            key={index}
            as="h3"
            fontSize="md"
            fontWeight="medium"
            mt="1rem"
            pb="0.25rem"
          >
            {(domNode.children[0] as any).data}
          </Heading>
        );
      }
      // footnotes formatting
      if (
        domNode.type === "tag" &&
        domNode.name === "div" &&
        (domNode as Element).attribs &&
        (domNode as Element).attribs.class === "footnotes extra_text"
      ) {
        return (
          <Box
            key={index}
            borderTop="1px solid"
            borderColor="gray.200"
            mt="1rem"
          >
            {domNode.children && domNode.children.length > 0
              ? domNode.children.map((child, childIdx) => (
                  <Fragment key={`${index}-footnote-${childIdx}`}>
                    {parse(require("dom-serializer").default(child), options)}
                  </Fragment>
                ))
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
      {selectedVerses.length > 0 && (
        <Bounce
          triggerOnce
          style={{ position: "fixed", bottom: "1.5rem", right: "1rem" }}
        >
          <Toaster />
          <IconButton
            aria-label="Share selected verses"
            rounded="full"
            onClick={copySelectionsToClipboard}
          >
            <RiShareFill />
          </IconButton>
        </Bounce>
      )}
    </Container>
  );
}
