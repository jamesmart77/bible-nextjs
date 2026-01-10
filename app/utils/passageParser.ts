export function handlePassageSearch (trimmedQuery: string): string | undefined{
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