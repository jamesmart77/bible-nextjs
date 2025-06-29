"use server";

import { redirect } from "next/navigation";

function getReqOptions() {
  return {
    method: "GET",
    cache: "force-cache" as RequestCache,
    headers: {
      Authorization: `Token ${process.env.ESV_API_KEY}`,
      "Content-Type": "application/json",
    },
  };
}

export async function getBiblePassage(book: string, passage: string[]) {
  const [chapter, verses] = passage;
  const [startVerse, endVerse] = verses?.split("-") || [];

  const query = [
    `${book}+`,
    chapter,
    startVerse ? `:${startVerse}` : "",
    endVerse ? `-${endVerse}` : "",
  ].join("");

  const url = `https://api.esv.org/v3/passage/html/?q=${query}&include-crossrefs=true`;
  const options = getReqOptions();

  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      throw new Error(`Error fetching bible passage. Status: ${res.statusText}. Code: ${res.status}`);
    }
    const data = await res.json();
    const [prevStart, prevEnd] = data.passage_meta[0].prev_chapter || [];
    const [nextStart, nextEnd] = data.passage_meta[0].next_chapter || [];
    return {
      passageText: data.passages[0],
      canonical: data.canonical,
      previousChapter: prevStart ? `${prevStart}-${prevEnd}` : null,
      nextChapter: nextStart ? `${nextStart}-${nextEnd}` : null,
    };
  } catch (error) {
    console.error("Error parsing Bible passage:", error);
    throw error;
  }
}

async function getChapterCanonical(ref: string) {
  const url = `https://api.esv.org/v3/passage/html/?q=${ref}`;
  const options = getReqOptions();

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(
        `Error fetching chapter canonical: ${response.statusText}`
      );
    }
    const data = await response.json();

    return data.canonical;
  } catch (error) {
    console.error("Error parsing chapter canonical:", error);
    throw error;
  }
}

export async function navigateToChapter(
  chapter: string | null
) {
  if (!chapter) return;

  const canonical = await getChapterCanonical(chapter);
  const [canonicalBook, canonicalPassage] = canonical.split(" ");
  const [canonicalChapter, canonicalVerses] = canonicalPassage.split(":");
  const redirectUrl = `/passages/${canonicalBook}/${canonicalChapter}${
    canonicalVerses ? `/${canonicalVerses}` : ""
  }`;
  redirect(redirectUrl);
}

type KeywordSearchResult = {
  results: {
    reference: string;
    content: string;
  }[];
  page: number;
  total_results: number;
  total_pages: number;
};

export async function getKeywordResults(query: string, pageNumber?: number) {
  const options = getReqOptions();
    const page = pageNumber || 1;
    const res = await fetch(`https://api.esv.org/v3/passage/search/?q=${query}&page-size=50&page=${page}`, options);

    if (!res.ok) {
      throw new Error(`Error fetching keyword search. Status: ${res.statusText}. Code: ${res.status}`);
    }

    const data: KeywordSearchResult = await res.json();
    
    if (data.results.length === 0 ) throw new Error(`Invalid search. Query: ${query}`);
    
    return data;
}