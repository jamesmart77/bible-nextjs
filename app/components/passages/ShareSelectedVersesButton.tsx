"use client";

import { Box, IconButton } from "@chakra-ui/react";
import { Bounce } from "react-awesome-reveal";
import { RiShareFill } from "react-icons/ri";
import useDeviceBreakpoint from "@/app/hooks/useDeviceBreakpoint";

type Props = {
  isVisible: boolean;
  onClick: () => void;
};

export default function ShareSelectedVersesButton({
  isVisible,
  onClick,
}: Props) {
  const { isMobile } = useDeviceBreakpoint();

  if (!isVisible) return null;

  console.log({ isMobile });

  return (
    <Box
      position="fixed"
      bottom={isMobile ? "6rem" : "1.5rem"}
      right="1rem"
      zIndex={2}
    >
      <Bounce triggerOnce>
        <IconButton
          aria-label="Share selected verses"
          rounded="full"
          onClick={onClick}
        >
          <RiShareFill />
        </IconButton>
      </Bounce>
    </Box>
  );
}
