"use client";

import { Box, Icon, IconButton, Menu, Portal } from "@chakra-ui/react";
import {
  RiCheckLine,
  RiFontSize,
  RiMoonLine,
  RiSettings3Line,
} from "react-icons/ri";
import { useColorMode } from "@/app/theme/ColorMode";
import { useTextSize, type TextSize } from "@/app/theme/TextSize";

const textSizeOptions: { label: string; value: TextSize }[] = [
  { label: "Default", value: "default" },
  { label: "Large", value: "large" },
  { label: "Extra large", value: "extra-large" },
];

const menuItemStyles = {
  px: "0.75rem",
  py: "0.6rem",
  borderRadius: "lg",
  cursor: "pointer",
  _highlighted: {
    bg: "var(--js-bg-muted)",
  },
} as const;

const inlineIndicatorStyles = {
  position: "static",
  insetStart: "auto",
  top: "auto",
  transform: "none",
  flexShrink: 0,
} as const;

export default function SettingsMenu() {
  const { colorMode, setTheme } = useColorMode();
  const { textSize, setTextSize } = useTextSize();

  return (
    <Menu.Root closeOnSelect={false} positioning={{ placement: "bottom-end" }}>
      <Menu.Trigger asChild>
        <IconButton
          aria-label="Open display settings"
          title="Display settings"
          rounded="full"
          variant="ghost"
          size="md"
          color="var(--js-text-primary)"
          _hover={{ bg: "var(--js-bg-muted)" }}
        >
          <RiSettings3Line />
        </IconButton>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content
            minW="13.5rem"
            p="0.35rem"
            bg="var(--js-bg-surface)"
            color="var(--js-text-primary)"
            border="1px solid"
            borderColor="var(--js-border-muted)"
            borderRadius="xl"
            boxShadow="0 14px 36px rgba(25, 20, 27, 0.18)"
            zIndex="popover"
          >
            <Menu.ItemGroup>
              <Menu.ItemGroupLabel
                px="0.75rem"
                py="0.45rem"
                color="var(--js-text-secondary)"
                fontSize="xs"
                fontWeight="semibold"
                letterSpacing="0.06em"
                textTransform="uppercase"
              >
                Display
              </Menu.ItemGroupLabel>
              <Menu.CheckboxItem
                value="dark-mode"
                checked={colorMode === "dark"}
                onCheckedChange={(checked) =>
                  setTheme(checked ? "dark" : "light")
                }
                {...menuItemStyles}
              >
                <Icon as={RiMoonLine} color="var(--js-accent-solid)" />
                <Menu.ItemText flex="1">Dark mode</Menu.ItemText>
                <Menu.ItemIndicator
                  color="var(--js-accent-solid)"
                  {...inlineIndicatorStyles}
                >
                  <RiCheckLine />
                </Menu.ItemIndicator>
              </Menu.CheckboxItem>
            </Menu.ItemGroup>

            <Menu.Separator
              my="0.35rem"
              borderColor="var(--js-border-muted)"
            />

            <Menu.ItemGroup>
              <Menu.ItemGroupLabel
                display="flex"
                alignItems="center"
                gap="0.4rem"
                px="0.75rem"
                py="0.45rem"
                color="var(--js-text-secondary)"
                fontSize="xs"
                fontWeight="semibold"
                letterSpacing="0.06em"
                textTransform="uppercase"
              >
                <RiFontSize aria-hidden />
                Text size
              </Menu.ItemGroupLabel>
              <Menu.RadioItemGroup
                id="text-size"
                value={textSize}
                onValueChange={(event) =>
                  setTextSize(event.value as TextSize)
                }
              >
                {textSizeOptions.map((option) => (
                  <Menu.RadioItem
                    key={option.value}
                    value={option.value}
                    {...menuItemStyles}
                  >
                    <Box
                      width="1rem"
                      flexShrink="0"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Menu.ItemIndicator
                        color="var(--js-accent-solid)"
                        {...inlineIndicatorStyles}
                      >
                        <RiCheckLine />
                      </Menu.ItemIndicator>
                    </Box>
                    <Menu.ItemText>{option.label}</Menu.ItemText>
                  </Menu.RadioItem>
                ))}
              </Menu.RadioItemGroup>
            </Menu.ItemGroup>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
