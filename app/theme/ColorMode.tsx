"use client";

import { IconButton } from "@chakra-ui/react";
import { useTheme, ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import { RiMoonLine, RiSunLine } from "react-icons/ri";

export function ColorModeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
}

export function useColorMode() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const colorMode = mounted
    ? resolvedTheme === "dark"
      ? "dark"
      : "light"
    : "light";
  const toggleColorMode = () =>
    setTheme(colorMode === "dark" ? "light" : "dark");

  return { colorMode, toggleColorMode, setTheme };
}

export function useColorModeValue<T>(lightValue: T, darkValue: T): T {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === "dark" ? darkValue : lightValue;
}

export function ColorModeButton() {
  const { colorMode, toggleColorMode } = useColorMode();
  const label =
    colorMode === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <IconButton
      aria-label={label}
      onClick={toggleColorMode}
      rounded="full"
      variant="ghost"
      size="md"
      title={label}
    >
      {colorMode === "dark" ? <RiSunLine /> : <RiMoonLine />}
    </IconButton>
  );
}
