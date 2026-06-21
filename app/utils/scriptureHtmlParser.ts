import { Element, htmlToDOM } from "html-react-parser";
import serialize from "dom-serializer";
import type { ChildNode, AnyNode } from "domhandler";

export type VerseNodeGroup = {
  verseNum: string;
  nodes: ChildNode[];
  text: string;
};

const hasClass = (node: unknown, className: string) =>
  node instanceof Element &&
  typeof node.attribs.class === "string" &&
  node.attribs.class.split(/\s+/).includes(className);

export const serializeHtmlNode = (node: ChildNode) => serialize(node);

export const findVerseNumberNode = (node: unknown): Element | null => {
  if (
    node instanceof Element &&
    (hasClass(node, "chapter-num") || hasClass(node, "verse-num"))
  ) {
    return node;
  }

  if (!(node instanceof Element)) return null;

  for (const child of node.children) {
    const verseNode = findVerseNumberNode(child);
    if (verseNode) return verseNode;
  }

  return null;
};

export const getVerseNumber = (node: Element) => {
  const textNode = node.children.find((child) => child.type === "text");
  const verseText =
    typeof textNode?.data === "string"
      ? textNode.data.replace(/\u00a0/g, "").trim()
      : "";

  return verseText.includes(":") ? verseText.split(":").at(-1) || "" : verseText;
};

const getVerseNumberFromParagraphId = (node: Element) => {
  const match = node.attribs.id?.match(/^p\d{5}(\d{3})_/);
  if (!match) return "";

  return String(parseInt(match[1], 10));
};

const getVerseNumberFromNodeId = (node: ChildNode) => {
  if (!(node instanceof Element)) return "";

  return getVerseNumberFromParagraphId(node);
};

const findVerseNumberFromDescendantId = (node: Element): string => {
  const verseNum = getVerseNumberFromParagraphId(node);
  if (verseNum) return verseNum;

  for (const child of node.children) {
    if (child instanceof Element) {
      const childVerseNum = findVerseNumberFromDescendantId(child);
      if (childVerseNum) return childVerseNum;
    }
  }

  return "";
};

export const hasVerseNumber = (node: Element) =>
  !!findVerseNumberNode(node) || !!findVerseNumberFromDescendantId(node);

const disableNestedFootnoteLinks = (node: ChildNode) => {
  if (
    node instanceof Element &&
    node.name === "sup" &&
    node.children.length > 0
  ) {
    node.children.forEach((child) => {
      if (child instanceof Element && child.name === "a") {
        child.attribs = { ...child.attribs, href: "#" };
      }
    });
  }
};

const getNodeText = (node: ChildNode) => {
  if (node.type === "text") return node.data;

  if (node instanceof Element) {
    return node.children
      .map((child) => ("data" in child ? child.data : ""))
      .join("");
  }

  return "";
};

const getVerseText = (nodes: ChildNode[]) =>
  nodes.map(getNodeText).join("").replace(/\s+/g, " ").trim();

export const groupParagraphNodesByVerse = (pNode: Element): VerseNodeGroup[] => {
  const verses: VerseNodeGroup[] = [];
  let currentVerseNum = "";
  let currentNodes: ChildNode[] = [];
  let collecting = false;

  const paragraphVerseNum = getVerseNumberFromParagraphId(pNode);
  if (!findVerseNumberNode(pNode) && paragraphVerseNum) {
    pNode.children.forEach(disableNestedFootnoteLinks);

    return [
      {
        verseNum: paragraphVerseNum,
        nodes: [...pNode.children],
        text: getVerseText(pNode.children),
      },
    ];
  }

  pNode.children.forEach((child) => {
    const verseNumberNode = findVerseNumberNode(child);
    const childVerseNum = getVerseNumberFromNodeId(child);

    if (verseNumberNode) {
      if (collecting && currentVerseNum) {
        verses.push({
          verseNum: currentVerseNum,
          nodes: [...currentNodes],
          text: getVerseText(currentNodes),
        });
      }

      collecting = true;
      currentVerseNum = getVerseNumber(verseNumberNode);
      currentNodes = [child];
    } else if (!collecting && childVerseNum) {
      disableNestedFootnoteLinks(child);
      collecting = true;
      currentVerseNum = childVerseNum;
      currentNodes = [child];
    } else if (collecting) {
      if (childVerseNum && childVerseNum !== currentVerseNum) {
        verses.push({
          verseNum: currentVerseNum,
          nodes: [...currentNodes],
          text: getVerseText(currentNodes),
        });

        disableNestedFootnoteLinks(child);
        currentVerseNum = childVerseNum;
        currentNodes = [child];
        return;
      }

      disableNestedFootnoteLinks(child);
      currentNodes.push(child);
    }
  });

  if (collecting && currentVerseNum) {
    verses.push({
      verseNum: currentVerseNum,
      nodes: [...currentNodes],
      text: getVerseText(currentNodes),
    });
  }

  return verses;
};

const collectParagraphs = (node: AnyNode, paragraphs: Element[]) => {
  if (node instanceof Element && node.name === "p") {
    paragraphs.push(node);
  }

  if (node instanceof Element) {
    node.children.forEach((child) => collectParagraphs(child, paragraphs));
  }
};

export const getPassageVerseTextByNumber = (passageHtml: string) => {
  const verseTextByNumber = new Map<string, string>();
  const paragraphs: Element[] = [];

  htmlToDOM(passageHtml).forEach((node) =>
    collectParagraphs(node as AnyNode, paragraphs)
  );

  paragraphs.forEach((paragraph) => {
    if (!hasVerseNumber(paragraph)) return;

    groupParagraphNodesByVerse(paragraph).forEach((verse) => {
      const existingText = verseTextByNumber.get(verse.verseNum);
      verseTextByNumber.set(
        verse.verseNum,
        [existingText, verse.text].filter(Boolean).join(" ")
      );
    });
  });

  return verseTextByNumber;
};
