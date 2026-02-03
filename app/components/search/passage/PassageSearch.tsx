"use client";

import { Button } from "@chakra-ui/react";
import AutocompleteInput from "./Autocomplete";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveSearchQuery } from "@/lib/db";
import { handlePassageSearch } from "@/app/utils/passageParser";

export default function PassageSearch() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const [searchType, setSearchType] = useState<"passage" | "keyword">(
    "passage",
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!inputValue.trim()) return;

    setIsLoading(true);

    // Uppercase the first letter present
    const trimmedQuery = inputValue
      .trim()
      .replace(/([A-Za-z])/, (m) => m.toUpperCase());

    let url: string | undefined = undefined;

    if (searchType === "passage") {
      url = handlePassageSearch(trimmedQuery);
    } else if (searchType === "keyword") {
      url = `/keyword/${encodeURIComponent(trimmedQuery)}?page=1`;
    }

    if (url) {
      await saveSearchQuery(trimmedQuery, searchType);

      router.push(url);
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        aria-busy={isLoading}
        aria-disabled={isLoading}
      >
        <AutocompleteInput
          inputValue={inputValue}
          setInputValue={setInputValue}
          submitOnEnter={handleSubmit}
          searchType={searchType}
          setSearchType={setSearchType}
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
