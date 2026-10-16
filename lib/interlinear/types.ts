export type InterlinearToken = {
  text: string;
  strongs?: string;
  href?: string;
  morphology?: boolean;
};
export type InterlinearVerse = {
  number: number;
  english: InterlinearToken[];
  original: InterlinearToken[];
};
export type InterlinearChapter = {
  sourceUrl: string;
  language: "hebrew" | "greek";
  verses: InterlinearVerse[];
};
export type StrongsEntry = {
  number: string;
  sourceUrl: string;
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  definition: string;
  details: { label: string; text: string }[];
};
