"use client";

import { Button } from "@chakra-ui/react";
import AutocompleteInput from "./Autocomplete";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveSearchQuery } from "@/lib/db";

export default function PassageSearch() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const [searchType, setSearchType] = useState<"passage" | "keyword">(
    "passage"
  );
  const [isExactPhrase, setIsExactPhrase] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePassageSearch = (trimmedQuery: string): string | undefined => {
    // Regex breakdown:
    // - `^(\d?\s?[A-Za-z]+(?:\s[A-Za-z]+)*)`: book name like "1 John"
    // - `(?:\s+(\d+))?`: optional chapter
    // - `(?::(\d+(?:-\d+)?))?`: optional verse or range
    const regex =
      /^(\d?\s?[A-Za-z]+(?:\s[A-Za-z]+)*)(?:\s+(\d+))?(?::(\d+(?:-\d+)?))?$/;
    const match = trimmedQuery.match(regex);

    if (!match) {
      console.error("Invalid input format");
      return;
    }

    const [_, bookRaw, chapter, verses] = match;
    const book = bookRaw.replace(/\s+/g, ""); // e.g. "1 John" → "1John"

    let url = `/passages/${book}`;
    if (chapter) {
      url += `/${chapter}`;
      if (verses) {
        url += `/${verses}`;
      }
    }

    return url;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    // Uppercase the first letter present
    const trimmedQuery = inputValue
      .trim()
      .replace(/([A-Za-z])/, (m) => m.toUpperCase());

    let url: string | undefined = undefined;

    if (searchType === "passage") {
      url = handlePassageSearch(trimmedQuery);
    } else if (searchType === "keyword") {
      url = `/keyword/${encodeURIComponent(trimmedQuery)}?isExact=${isExactPhrase}`;
    }

    if (url) {
      await saveSearchQuery(trimmedQuery, searchType);

      router.push(url);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <AutocompleteInput
          inputValue={inputValue}
          setInputValue={setInputValue}
          submitOnEnter={handleSubmit}
          searchType={searchType}
          setSearchType={setSearchType}
          isExactPhrase={isExactPhrase}
          setIsExactPhrase={setIsExactPhrase}
        />
        <Button
          mt="0.5rem"
          type="submit"
          width="100%"
          loading={isLoading}
          loadingText="Searching..."
        >
          Search
        </Button>
      </form>
    </div>
  );
}
