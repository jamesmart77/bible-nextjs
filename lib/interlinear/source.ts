import { bibleBooks } from "@/app/components/search/passage/bibleBooks";
import { parseChapter, parseStrongs, strongsResolverUrl } from "./parse";

const books = bibleBooks.map((name) => name.trim().toLowerCase().replaceAll(" ", "-"));
const chapterCounts = [50,40,27,36,34,24,21,4,31,24,22,25,29,36,10,13,10,42,150,31,12,8,66,52,5,48,12,14,3,9,1,4,7,3,3,3,2,14,4,28,16,24,21,28,16,16,13,6,6,4,4,5,3,6,4,3,1,13,5,5,3,5,1,1,1,22];
export function chapterUrl(book: string, chapter: number): string | null {
  let slug = book.trim().toLowerCase().replaceAll(" ", "-").replace(/^([1-3])(?=[a-z])/, "$1-");
  if (slug === "psalm") slug = "psalms";
  if (slug === "songofsolomon") slug = "song-of-solomon";
  const index = books.indexOf(slug);
  if (index < 0 || !Number.isInteger(chapter) || chapter < 1 || chapter > chapterCounts[index]) return null;
  return `https://www.biblestudytools.com/interlinear-bible/nas/${slug}/${chapter}.html`;
}
export function normalizeStrongs(value: string): string | null {
  if (!/^[HG]0*\d{1,4}$/.test(value)) return null;
  const number = Number(value.slice(1));
  if (number < 1 || number > (value[0] === "H" ? 8674 : 5624)) return null;
  return `${value[0]}${number}`;
}
async function sourceFetch(url: string) {
  const response = await fetch(url, {
    next: { revalidate: 86400 },
    signal: AbortSignal.timeout(15000),
    redirect: "error",
  });
  if (!response.ok) throw new Error("BibleStudyTools unavailable");
  return response;
}
export async function getChapter(url: string) {
  return parseChapter(await (await sourceFetch(url)).text(), url);
}
export async function getStrongs(number: string) {
  const lookup = await (await sourceFetch(strongsResolverUrl(number))).json();
  const url = new URL(lookup.url);
  const language = number[0] === "H" ? "hebrew" : "greek";
  // Never fetch arbitrary URLs returned by an upstream service.
  if (url.origin !== "https://www.biblestudytools.com" ||
      !new RegExp(`^/lexicons/${language}/nas/[a-z0-9-]+\\.html$`).test(url.pathname) || url.search || url.hash) {
    throw new Error("Unexpected lexicon URL");
  }
  return parseStrongs(await (await sourceFetch(url.href)).text(), number, url.href);
}
