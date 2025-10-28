"use client";

import { ChakraProvider } from "@chakra-ui/react";
import system from "@/app/theme/theme";
import { ReactNode } from "react";

export function Provider({ children }: { children: ReactNode }) {
  return <ChakraProvider value={system}>{children}</ChakraProvider>;
}
