import { Element } from "html-react-parser";
import type { ChildNode } from "domhandler";
import { handlePassageSearch } from "./passageParser";

export type CrossReference = { label: string; references: string[] };

export function splitReferenceText(text: string) {
  const markers = [...text.matchAll(/\[(\d+)\]/g)];
  if (!markers.length) return [{ text }];
  const parts: { text: string; verseNumber?: string }[] = [];
  const preface = text.slice(0, markers[0].index).trim();
  if (preface) parts.push({ text: preface });
  markers.forEach((marker, index) => {
    parts.push({
      text: text
        .slice(marker.index! + marker[0].length, markers[index + 1]?.index)
        .trim(),
      // A single verse is already identified by its passage link.
      ...(markers.length > 1 ? { verseNumber: marker[1] } : {}),
    });
  });
  return parts;
}

export const isCrossReferenceLink = (node: unknown): boolean =>
  node instanceof Element &&
  node.name === "a" &&
  (node.attribs.class ?? "").split(/\s+/).includes("cf");

export const isCrossReferenceMarker = (node: unknown): boolean =>
  node instanceof Element &&
  node.name === "sup" &&
  node.children.some(isCrossReferenceLink);

const textContent = (node: ChildNode): string =>
  node.type === "text"
    ? node.data
    : node instanceof Element
      ? node.children.map(textContent).join("")
      : "";

export function getCrossReferences(nodes: ChildNode[]): CrossReference[] {
  const references: CrossReference[] = [];
  const visit = (node: ChildNode) => {
    if (node instanceof Element && isCrossReferenceLink(node)) {
      references.push({
        label: textContent(node).trim(),
        references: node.attribs.href
          .replace(/\/$/, "")
          .split(";")
          .map((ref) => ref.trim())
          .filter(Boolean),
      });
    } else if (node instanceof Element) node.children.forEach(visit);
  };
  nodes.forEach(visit);
  return references;
}

export function crossReferenceHref(reference: string) {
  const singleChapter = reference.match(
    /^(Obadiah|Philemon|2 John|3 John|Jude)\s+(\d+(?:[-–]\d+)?)$/i,
  );
  if (singleChapter)
    return handlePassageSearch(
      `${singleChapter[1]} 1:${singleChapter[2].replace("–", "-")}`,
    );
  // Cross-chapter and disjoint ranges open at their first verse.
  const start = reference
    .replace(/[–—]/g, "-")
    .match(/^(.*?\s+\d+)(?::(\d+(?:-\d+)?))?/);
  if (!start) return undefined;
  const verse = start[2]?.split("-");
  const crossesChapter = /:\d+-\d+:/.test(reference);
  return handlePassageSearch(
    `${start[1]}${verse ? `:${crossesChapter ? verse[0] : start[2]}` : ""}`,
  );
}
