export type SelectedVerse = {
  verseNum: string;
  text: string;
};

const getVerseSortValue = (verseNum: string) => parseInt(verseNum, 10);

export const toggleSelectedVerse = (
  selectedVerses: SelectedVerse[],
  verse: SelectedVerse
) => {
  const exists = selectedVerses.some((selected) => selected.verseNum === verse.verseNum);
  const nextSelectedVerses = exists
    ? selectedVerses.filter((selected) => selected.verseNum !== verse.verseNum)
    : [...selectedVerses, verse];

  return nextSelectedVerses.sort(
    (a, b) => getVerseSortValue(a.verseNum) - getVerseSortValue(b.verseNum)
  );
};

type ShareTextOptions = {
  selectedVerses: SelectedVerse[];
  book: string;
  chapter: string;
};

const formatVerseNumbers = (selectedVerses: SelectedVerse[]) => {
  const verseNumbers = [
    ...new Set(
      selectedVerses.map((verse) => getVerseSortValue(verse.verseNum)),
    ),
  ].sort((a, b) => a - b);

  const ranges: string[] = [];
  let rangeStart = verseNumbers[0];
  let rangeEnd = rangeStart;

  for (const verseNumber of verseNumbers.slice(1)) {
    if (verseNumber === rangeEnd + 1) {
      rangeEnd = verseNumber;
      continue;
    }

    ranges.push(
      rangeStart === rangeEnd ? String(rangeStart) : `${rangeStart}-${rangeEnd}`,
    );
    rangeStart = verseNumber;
    rangeEnd = verseNumber;
  }

  if (rangeStart !== undefined) {
    ranges.push(
      rangeStart === rangeEnd ? String(rangeStart) : `${rangeStart}-${rangeEnd}`,
    );
  }

  return ranges.join(",");
};

export const formatSelectedVersesForShare = (options: ShareTextOptions) => {
  const { selectedVerses, book, chapter } = options;
  const sortedVerses = [...selectedVerses].sort(
    (a, b) => getVerseSortValue(a.verseNum) - getVerseSortValue(b.verseNum),
  );
  const verseNumbers = formatVerseNumbers(sortedVerses);

  return [
    sortedVerses.map((verse) => verse.text).join(" "),
    "",
    `${book} ${chapter}:${verseNumbers}`,
    `https://www.justscripture.app/passages/${book}/${chapter}`,
  ].join("\n");
};
