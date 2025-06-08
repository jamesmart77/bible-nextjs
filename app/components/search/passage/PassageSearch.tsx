"use client";
import { Button } from "@chakra-ui/react";
import AutocompleteInput from "./Autocomplete";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveSearchQuery } from "@/lib/db";

export default function PassageSearch() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    let trimmedQuery = inputValue.trim();

    // Uppercase the first letter present
    trimmedQuery = trimmedQuery.replace(/([A-Za-z])/, (m) => m.toUpperCase());

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

    await saveSearchQuery(trimmedQuery, "passage");

    router.push(url);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <AutocompleteInput
          inputValue={inputValue}
          setInputValue={setInputValue}
          submitOnEnter={handleSubmit}
        />
        <Button
          mt="0.5rem"
          type="submit"
          width="100%"
          loadingText="Searching..."
        >
          Search
        </Button>
      </form>
    </div>
  );
}
