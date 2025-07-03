import { useRef } from "react";
import { useCombobox } from "downshift";
import { Box, Input, InputGroup, List } from "@chakra-ui/react";
import { useOutsideClick } from "@chakra-ui/react-use-outside-click";
import { bibleBooks } from "./bibleBooks";
import SearchTypSettings from "./SearchTypeSettings";

type Props = {
  inputValue: string;
  searchType: string;
  setInputValue: (value: string) => void;
  setSearchType: (value: "passage" | "keyword") => void;
  submitOnEnter: (event: React.KeyboardEvent<HTMLInputElement>) => void;
};

export default function AutocompleteInput(props: Props) {
  const {
    inputValue,
    setInputValue,
    searchType,
    setSearchType,
    submitOnEnter,
  } = props;

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
      <InputGroup
        flex="1"
        endElement={
          <SearchTypSettings
            searchType={searchType}
            setSearchType={setSearchType}
          />
        }
      >
        <Input
          {...getInputProps({
            placeholder: searchType === "passage" ? "John 3:16" : "Contentment",
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
                  bg={highlightedIndex === index ? "#A6ADB0" : "transparent"}
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
