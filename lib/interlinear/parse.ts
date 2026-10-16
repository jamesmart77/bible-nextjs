import { htmlToDOM, Element, type DOMNode } from "html-react-parser";
import type { InterlinearChapter, InterlinearToken, StrongsEntry } from "./types";

function children(node: DOMNode): DOMNode[] {
  return node instanceof Element ? node.children as DOMNode[] : [];
}
function elements(nodes: DOMNode[], predicate: (node: Element) => boolean): Element[] {
  return nodes.flatMap((node) => node instanceof Element
    ? [...(predicate(node) ? [node] : []), ...elements(children(node), predicate)] : []);
}
const hasClass = (node: Element, name: string) => node.attribs.class?.split(/\s+/).includes(name) ?? false;
function text(node: DOMNode): string {
  if (node.type === "text") return node.data;
  if (!(node instanceof Element) || ["script", "style", "iframe"].includes(node.name)) return "";
  if (node.name === "br") return "\n";
  const result = children(node).map(text).join("");
  if (node.name === "li") return `• ${result}\n`;
  return ["ol", "ul", "p", "div"].includes(node.name) ? `\n${result}\n` : result;
}
const clean = (value: string) => value.replace(/[^\S\n]+/g, " ").replace(/ *\n */g, "\n").replace(/\n{3,}/g, "\n\n").trim();
export function strongsResolverUrl(number: string) {
  return `https://www.biblestudytools.com/api/library/strongs/?strongsNumber=NAS-${number}`;
}
function strongsToken(value: string, prefix: string, label: string): InterlinearToken {
  const strongs = `${prefix}${Number(value)}`;
  return { text: label, strongs, href: strongsResolverUrl(strongs) };
}
export function parseChapter(html: string, sourceUrl: string): InterlinearChapter {
  const root = elements(htmlToDOM(html), (node) => hasClass(node, "bible-verses"))[0];
  if (!root || root.attribs["data-passage-translation"] !== "nas") throw new Error("NAS passage missing");
  const language = elements(children(root), (node) => hasClass(node, "hebrew")).length ? "hebrew" : "greek";
  const prefix = language === "hebrew" ? "H" : "G";
  function englishTokens(nodes: DOMNode[]): InterlinearToken[] {
    return nodes.flatMap((node): InterlinearToken[] => {
      if (node.type === "text") return [{ text: node.data }];
      if (!(node instanceof Element) || ["script", "style"].includes(node.name)) return [];
      const number = node.attribs["data-strongs-number"];
      return number && /^\d{1,5}$/.test(number)
        ? [strongsToken(number, prefix, text(node))] : englishTokens(children(node));
    });
  }
  function originalTokens(nodes: DOMNode[]): InterlinearToken[] {
    return nodes.flatMap((node): InterlinearToken[] => {
      if (node instanceof Element) {
        if (["script", "style", "iframe"].includes(node.name)) return [];
        if (hasClass(node, "text-gray-500")) return [{ text: text(node), morphology: true }];
        return originalTokens(children(node));
      }
      if (node.type !== "text") return [];
      // BST embeds legacy-font text with t-prefixed Strong's numbers.
      return node.data.split(/(t\d{1,5}|<\d{1,5}!>)/g).filter(Boolean).map((part) => {
        const match = /^(?:t(\d{1,5})|<(\d{1,5})!>)$/.exec(part);
        return match ? strongsToken(match[1] ?? match[2], prefix, `${prefix}${Number(match[1] ?? match[2])}`) : { text: part };
      });
    });
  }
  const verses = elements(children(root), (node) => hasClass(node, "bible-verse-row")).map((row) => {
    const english = elements(children(row), (node) => hasClass(node, "bible-text"))[0];
    const original = elements(children(row), (node) => hasClass(node, language))[0];
    const number = Number(row.attribs["data-verse-id"]);
    if (!english || !original || !Number.isInteger(number) || number < 1) throw new Error("Verse format changed");
    return { number, english: englishTokens(children(english)), original: originalTokens(children(original)) };
  });
  if (!verses.length) throw new Error("No verses found");
  return { sourceUrl, language, verses };
}

export function parseStrongs(html: string, number: string, sourceUrl: string): StrongsEntry {
  const heading = elements(htmlToDOM(html), (node) => node.name === "h1")[0];
  const card = heading?.parent;
  if (!heading || !(card instanceof Element)) throw new Error("Lexicon missing");
  const sections = children(card).filter((node): node is Element => node instanceof Element && node.name === "div");
  const part = sections.find((node) => text(node).includes("Parts of Speech"));
  const definition = elements(children(card), (node) => hasClass(node, "library-formatting"))[0];
  if (!part || !definition || !text(definition).includes("NAS Word Usage")) throw new Error("NAS definition missing");
  const details = sections.filter((node) => hasClass(node, "grid")).flatMap((node) => {
    const cells = children(node).filter((item): item is Element => item instanceof Element && item.name === "div");
    const label = cells[0] && clean(text(cells[0]));
    // Original language uses a legacy font; the full original text appears in the chapter.
    return label && !["Audio Pronunciation", "Original Language"].includes(label) && cells[1]
      ? [{ label, text: clean(text(cells[1])) }] : [];
  });
  return {
    number, sourceUrl, word: clean(text(heading)),
    pronunciation: sections[0] ? clean(text(sections[0])) : "",
    partOfSpeech: clean(text(part).replace("Parts of Speech", "")),
    definition: clean(text(definition)), details,
  };
}
