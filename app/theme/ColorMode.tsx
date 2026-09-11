"use client";

import { useTheme, ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";

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

  return { colorMode, setTheme };
}

export function useColorModeValue<T>(lightValue: T, darkValue: T): T {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === "dark" ? darkValue : lightValue;
}
