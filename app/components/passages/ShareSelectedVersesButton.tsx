"use client";

import { IconButton } from "@chakra-ui/react";
import { Bounce } from "react-awesome-reveal";
import { RiShareFill } from "react-icons/ri";

type Props = {
  isVisible: boolean;
  onClick: () => void;
};

export default function ShareSelectedVersesButton({
  isVisible,
  onClick,
}: Props) {
  if (!isVisible) return null;

  return (
    <Bounce
      triggerOnce
      style={{ position: "fixed", bottom: "1.5rem", right: "1rem" }}
    >
      <IconButton
        aria-label="Share selected verses"
        rounded="full"
        onClick={onClick}
      >
        <RiShareFill />
      </IconButton>
    </Bounce>
  );
}
