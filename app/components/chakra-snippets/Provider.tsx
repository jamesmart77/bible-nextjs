"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { ColorModeProvider } from "@/app/theme/ColorMode";
import system from "@/app/theme/theme";
import { ReactNode } from "react";

export function Provider({ children }: { children: ReactNode }) {
  return (
    <ColorModeProvider>
      <ChakraProvider value={system}>{children}</ChakraProvider>
    </ColorModeProvider>
  );
}
