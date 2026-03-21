"use client"

import { ClientOnly, IconButton, Skeleton } from "@chakra-ui/react"
import { useColorMode } from "@/app/components/chakra-snippets/color-mode"
import { LuMoon, LuSun } from "react-icons/lu"


export default function ColorThemeToggle() {
  const { toggleColorMode, colorMode } = useColorMode()
  return (
    <ClientOnly fallback={<Skeleton boxSize="8" />}>
      <IconButton onClick={toggleColorMode} variant="outline" size="sm">
        {colorMode === "light" ? <LuSun /> : <LuMoon />}
      </IconButton>
    </ClientOnly>
  )
}
