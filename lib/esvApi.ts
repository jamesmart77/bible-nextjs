"use server";

export default async function getBiblePassage(book: string, passage: string[]) {
  const [chapter, verses] = passage;
  const [startVerse, endVerse] = verses?.split("-") || [];

  const query = [
    `${book}+`,
    chapter,
    startVerse ? `:${startVerse}` : "",
    endVerse ? `-${endVerse}` : ""
  ].join("");

  const url = `https://api.esv.org/v3/passage/html/?q=${query}`;
  const options = {
    method: "GET",
    cache: 'force-cache' as RequestCache,
    headers: {
      Authorization: `Token ${process.env.ESV_API_KEY}`,
      "Content-Type": "application/json",
    }
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`Error fetching bible passage: ${response.statusText}`);
    }
    const data = await response.json();
    const passage = data.passages[0];
    return passage;
  } catch (error) {
    console.error("Error fetching Bible passage:", error);
    throw error;
  }
}
