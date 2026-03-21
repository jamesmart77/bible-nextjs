"use client";

import { ChakraProvider } from "@chakra-ui/react";
import {ColorModeProvider} from '@/app/components/chakra-snippets/color-mode'
import system from "@/app/theme/theme";
import { ReactNode } from "react";

export function Provider({ children }: { children: ReactNode }) {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider>
        {children}
      </ColorModeProvider>
    </ChakraProvider>
  )
}
