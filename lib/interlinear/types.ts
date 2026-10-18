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
export type DefinitionNode =
  | { type: "text"; text: string }
  | {
      type: "element";
      tag: "ol" | "ul" | "li" | "p" | "br" | "strong" | "em";
      listType?: "1" | "a" | "A" | "i" | "I";
      children: DefinitionNode[];
    };

export type StrongsEntry = {
  number: string;
  sourceUrl: string;
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  definition: string;
  definitionContent?: DefinitionNode[];
  details: { label: string; text: string }[];
};
