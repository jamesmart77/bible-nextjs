"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { ColorModeProvider } from "@/app/theme/ColorMode";
import { TextSizeProvider } from "@/app/theme/TextSize";
import system from "@/app/theme/theme";
import { ReactNode } from "react";
import { EmotionRegistry } from "./EmotionRegistry";

export function Provider({ children }: { children: ReactNode }) {
  return (
    <EmotionRegistry>
      <ColorModeProvider>
        <TextSizeProvider>
          <ChakraProvider value={system}>{children}</ChakraProvider>
        </TextSizeProvider>
      </ColorModeProvider>
    </EmotionRegistry>
  );
}
