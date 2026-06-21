import { useRef } from "react";
import { useCombobox } from "downshift";
import { Box, Input, InputGroup, List } from "@chakra-ui/react";
import { useOutsideClick } from "@chakra-ui/react-use-outside-click";
import useDeviceBreakpoint from "@/app/hooks/useDeviceBreakpoint";
import { bibleBooks } from "./bibleBooks";
import SearchTypSettings from "./SearchTypeSettings";

type Props = {
  inputValue: string;
  searchType: string;
  setInputValue: (value: string) => void;
  setSearchType: (value: "passage" | "keyword") => void;
  submitOnEnter: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  showSearchTypeSettings?: boolean;
};

export default function AutocompleteInput(props: Props) {
  const {
    inputValue,
    setInputValue,
    searchType,
    setSearchType,
    submitOnEnter,
    placeholder,
    showSearchTypeSettings = true,
  } = props;

  const { isDesktop } = useDeviceBreakpoint();

  const ref = useRef<HTMLElement>(null) as React.RefObject<HTMLElement>;

  const filteredBooks = bibleBooks.filter((book) =>
    book.toLowerCase().includes(inputValue.toLowerCase()),
  );

  const {
    isOpen,
    getMenuProps,
    getInputProps,
    getItemProps,
    highlightedIndex,
    openMenu,
  } = useCombobox({
    items: filteredBooks,
    onInputValueChange: ({ inputValue }) => {
      setInputValue(inputValue ?? "");
    },
  });

  // Close dropdown on outside click
  useOutsideClick({
    ref,
    handler: () => {
      if (isOpen) {
        (document.activeElement as HTMLElement | null)?.blur(); // optionally blur the input to close keyboard on mobile
      }
    },
  });

  return (
    <Box position="relative" width="100%" ref={ref}>
      <InputGroup
        flex="1"
        endElement={
          showSearchTypeSettings ? (
            <SearchTypSettings
              searchType={searchType}
              setSearchType={setSearchType}
            />
          ) : undefined
        }
      >
        <Input
          size="lg"
          borderRadius="xl"
          borderColor="var(--js-border-muted)"
          bg="var(--js-bg-input)"
          color="var(--js-text-primary)"
          _focusVisible={{
            borderColor: "var(--js-accent-solid)",
            boxShadow: "0 0 0 1px var(--js-accent-solid)",
          }}
          {...getInputProps({
            placeholder:
              placeholder ||
              (searchType === "passage" ? "John 3:16" : "Contentment"),
            onFocus: openMenu,
            onKeyDown: (event) => {
              if (
                event.key === "Enter" &&
                highlightedIndex === -1 // Only submit if no item is highlighted from downshift
              ) {
                submitOnEnter(event);
              }
            },
          })}
        />
      </InputGroup>
      {searchType === "passage" && (
        <Box
          {...getMenuProps()}
          position="absolute"
          bottom={isDesktop ? "inherit" : "2.8rem"} // push dropdown above keyboard on mobile
          width="100%"
          mt={1}
          bg={{
            base: "var(--js-bg-surface)",
            _dark: "var(--js-bg-surface)",
          }}
          borderWidth={1}
          borderColor="var(--js-border-muted)"
          borderRadius="lg"
          boxShadow="sm"
          zIndex={10}
          display={isOpen && bibleBooks.length > 0 ? "block" : "none"}
        >
          <List.Root maxH="200px" overflowY="auto">
            {isOpen &&
              filteredBooks.map((book, index) => (
                <List.Item
                  key={`${book}-${index}`}
                  bg={
                    highlightedIndex === index
                      ? "var(--js-accent-subtle)"
                      : "transparent"
                  }
                  color="var(--js-text-primary)"
                  px={4}
                  py={2}
                  cursor="pointer"
                  {...getItemProps({ item: book, index })}
                >
                  {book}
                </List.Item>
              ))}
          </List.Root>
        </Box>
      )}
    </Box>
  );
}
