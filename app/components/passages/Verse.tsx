"use client";

import { Fragment } from "react";
import { isCrossReferenceMarker } from "@/app/utils/crossReferences";
import { Box, chakra } from "@chakra-ui/react";
import { domToReact, Element, type DOMNode } from "html-react-parser";
import { replaceEsvHtmlNode } from "@/app/utils/htmlParser";
import { type VerseNodeGroup } from "@/app/utils/scriptureHtmlParser";

type Props = {
  verse: VerseNodeGroup;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onCrossReferenceClick?: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

export default function Verse({
  verse,
  isSelected,
  isHovered,
  onClick,
  onCrossReferenceClick,
  onMouseEnter,
  onMouseLeave,
}: Props) {
  const lastContentIndex = verse.nodes.findLastIndex((node) =>
    node.type === "text"
      ? !!node.data.trim()
      : node instanceof Element &&
        node.name !== "br" &&
        !/(?:begin|end)-line-group/.test(node.attribs.class ?? ""),
  );
  const contentNodes = verse.nodes.slice(0, lastContentIndex + 1);
  const trailingNodes = verse.nodes.slice(lastContentIndex + 1);

  return (
    <>
      <Box
        as="span"
        bg={isSelected ? "yellow.200" : undefined}
        color={isSelected ? "gray.900" : undefined}
        cursor="pointer"
        borderRadius="md"
        mx={0.5}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        _dark={
          isSelected
            ? {
                bg: "#5C4700",
                color: "white",
              }
            : undefined
        }
        textDecor={isHovered ? "underline dotted" : undefined}
        textUnderlineOffset={isHovered ? "6px" : undefined}
        textDecorationColor={isHovered ? "gray.300" : undefined}
      >
        {domToReact(contentNodes as DOMNode[], {
          replace: (node, index) =>
            isCrossReferenceMarker(node) ? (
              <Fragment />
            ) : (
              replaceEsvHtmlNode(node, index)
            ),
        })}
      </Box>
      {onCrossReferenceClick && (
        <Box
          as="sup"
          ml={0.5}
          mr={1}
          color={{ base: "#38877F", _dark: "#80CFC5" }}
        >
          <chakra.button
            type="button"
            aria-label={`Cross references for verse ${verse.verseNum}`}
            aria-haspopup="dialog"
            cursor="pointer"
            px={1}
            py={1}
            borderRadius="sm"
            _hover={{ textDecoration: "underline" }}
            _focusVisible={{
              outline: "2px solid",
              outlineColor: "accent.focus",
            }}
            onClick={(event) => {
              event.stopPropagation();
              onCrossReferenceClick();
            }}
          >
            cf
          </chakra.button>
        </Box>
      )}
      {domToReact(trailingNodes as DOMNode[], { replace: replaceEsvHtmlNode })}
    </>
  );
}
