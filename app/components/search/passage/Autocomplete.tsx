import { useCombobox } from "downshift";
import { Box, Input, List } from "@chakra-ui/react";
import { useOutsideClick } from "@chakra-ui/react-use-outside-click";
import { useRef } from "react";
import { bibleBooks } from "./bibleBooks";

type AutocompleteInputProps = {
  inputValue: string;
  setInputValue: (value: string) => void;
  submitOnEnter: (event: React.KeyboardEvent<HTMLInputElement>) => void;
};

export default function AutocompleteInput({
  inputValue,
  setInputValue,
  submitOnEnter,
}: AutocompleteInputProps) {
  const ref = useRef<HTMLElement>(null) as React.RefObject<HTMLElement>;

  const filteredBooks = bibleBooks.filter((book) =>
    book.toLowerCase().includes(inputValue.toLowerCase())
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
      <Input
        {...getInputProps({
          placeholder: "John 3:16",
          onFocus: openMenu,
          onKeyDown: (event) => {
            if (event.key === "Enter") {
              submitOnEnter(event);
            }
          }
        })}
      />
      <Box
        {...getMenuProps()}
        position="absolute"
        width="100%"
        mt={1}
        bg="white"
        borderWidth={1}
        borderColor="gray.200"
        borderRadius="md"
        boxShadow="sm"
        zIndex={10}
        display={isOpen && bibleBooks.length > 0 ? "block" : "none"}
      >
        <List.Root maxH="200px" overflowY="auto">
          {isOpen &&
            filteredBooks.map((book, index) => (
              <List.Item
                key={`${book}-${index}`}
                bg={highlightedIndex === index ? "teal.200" : "transparent"}
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
    </Box>
  );
}
