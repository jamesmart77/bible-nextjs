"use client";

import { Box } from "@chakra-ui/react";
import { domToReact, type DOMNode } from "html-react-parser";
import { type VerseNodeGroup } from "@/app/utils/scriptureHtmlParser";

type Props = {
  verse: VerseNodeGroup;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

export default function Verse({
  verse,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: Props) {
  return (
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
      {domToReact(verse.nodes as DOMNode[])}
    </Box>
  );
}
