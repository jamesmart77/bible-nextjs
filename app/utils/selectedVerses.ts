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

export const formatSelectedVersesForShare = ({
  selectedVerses,
  book,
  chapter,
}: ShareTextOptions) =>
  [
    selectedVerses.map((verse) => verse.text).join(" "),
    `\n${book} ${chapter} | JustScripture (ESV)`,
    `Read the full chapter: https://www.justscripture.app/passages/${book}/${chapter}`,
  ].join("\n");
