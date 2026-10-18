import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildSync } from "esbuild";

const built = buildSync({ entryPoints: [new URL("./source.ts", import.meta.url).pathname], bundle: true, platform: "node", format: "cjs", write: false });
const module = { exports: {} };
new Function("module", "exports", "require", built.outputFiles[0].text)(module, module.exports, (await import("node:module")).createRequire(import.meta.url));
const { chapterUrl, normalizeStrongs, getStrongs } = module.exports;
const parser = buildSync({ entryPoints: [new URL("./parse.ts", import.meta.url).pathname], bundle: true, platform: "node", format: "cjs", write: false });
const parsedModule = { exports: {} };
new Function("module", "exports", "require", parser.outputFiles[0].text)(parsedModule, parsedModule.exports, (await import("node:module")).createRequire(import.meta.url));
const { parseChapter, parseStrongs } = parsedModule.exports;
const fixture = (name) => readFileSync(new URL(`./fixtures/${name}.html`, import.meta.url), "utf8");

test("Hebrew verses retain English words, original text and NAS Strong’s associations", () => {
  const result = parseChapter(fixture("hebrew-chapter"), "https://example.com/chapter");
  assert.equal(result.language, "hebrew");
  assert.deepEqual(result.verses.map(v => v.number), [1, 2]);
  const first = result.verses[0];
  assert.match(first.english.map(t => t.text).join(""), /How blessed are those whose way is blameless/);
  assert.deepEqual(first.english.find(t => t.text === "blessed"), { text: "blessed", strongs: "H835", href: "https://www.biblestudytools.com/api/library/strongs/?strongsNumber=NAS-H835" });
  assert.equal(first.original.find(t => t.strongs === "H835").text, "H835");
  assert.ok(first.original.some(t => t.text.includes("yer.v;a")));
});
test("Greek tokens preserve morphology and use the Greek number namespace", () => {
  const result = parseChapter(fixture("greek-chapter"), "https://example.com/chapter");
  assert.equal(result.language, "greek");
  assert.equal(result.verses[0].english.find(t => t.text === "Word").strongs, "G3056");
  assert.ok(result.verses[0].original.some(t => t.morphology && t.text === "N-NSM"));
});
for (const [language, number, word] of [["hebrew", "H835", "'esher"], ["greek", "G3056", "Logos"]]) {
  test(`${language} lexicon extracts only NAS definition and word details`, () => {
    const entry = parseStrongs(fixture(`${language}-lexicon`), number, "https://example.com/lexicon");
    assert.equal(entry.word, word);
    assert.equal(entry.partOfSpeech, "Noun Masculine");
    assert.match(entry.definition, /NAS Word Usage/);
    assert.ok(entry.pronunciation.length > 0);
    assert.ok(entry.details.some(d => d.label === "Origin"));
    assert.doesNotMatch(JSON.stringify(entry), /<script|<iframe|Audio Pronunciation/);
  });
}
test("invalid chapters, numbers and changed upstream markup fail safely", () => {
  assert.match(chapterUrl("1Samuel", 31), /nas\/1-samuel\/31.html$/);
  assert.match(chapterUrl("Psalm", 119), /nas\/psalms\/119.html$/);
  assert.equal(chapterUrl("psalms", 151), null);
  assert.equal(chapterUrl("../john", 1), null);
  assert.equal(chapterUrl("john", 1.5), null);
  assert.equal(normalizeStrongs("H0835"), "H835");
  for (const invalid of ["G0", "G5625", "H8675", "https://example.com", "H-1"]) assert.equal(normalizeStrongs(invalid), null);
  assert.throws(() => parseChapter("<div>Unavailable</div>", "https://example.com"));
  assert.throws(() => parseChapter(fixture("greek-chapter").replace('data-passage-translation="nas"', 'data-passage-translation="kjv"'), "https://example.com"));
  assert.throws(() => parseStrongs("<h1>Error</h1>", "H835", "https://example.com"));
});
test("upstream scripts and event handlers never become executable content", () => {
  const result = parseChapter(fixture("hebrew-chapter").replace("How ", 'How <script>alert(1)</script><img src=x onerror="alert(2)">'), "https://example.com");
  assert.doesNotMatch(JSON.stringify(result), /alert|onerror|<img/);
});
test("Strong’s resolver uses NAS and rejects external lexicon URLs", async () => {
  const originalFetch = globalThis.fetch;
  const urls = [];
  try {
    globalThis.fetch = async (url) => {
      urls.push(url);
      return Response.json({ url: "https://untrusted.example/lexicons/hebrew/nas/esher.html" });
    };
    await assert.rejects(getStrongs("H835"), /Unexpected lexicon URL/);
    assert.deepEqual(urls, ["https://www.biblestudytools.com/api/library/strongs/?strongsNumber=NAS-H835"]);
  } finally { globalThis.fetch = originalFetch; }
});

const listNodes = (nodes) => nodes.filter(node => node.type === "element" && ["ol", "ul"].includes(node.tag));
const itemNodes = (node) => node.children.filter(child => child.type === "element" && child.tag === "li");
const directText = (node) => node.children.filter(child => child.type === "text").map(child => child.text).join("").trim();

test("Hebrew definition keeps subdefinitions nested under their parent", () => {
  const { definitionContent } = parseStrongs(fixture("hebrew-lexicon"), "H835", "https://example.com");
  const [list] = listNodes(definitionContent);
  assert.equal(list.listType, "1");
  const [parent] = itemNodes(list);
  assert.equal(directText(parent), "happiness, blessedness");
  const [nested] = listNodes(parent.children);
  assert.equal(nested.listType, "a");
  assert.deepEqual(itemNodes(nested).map(directText), ["often used as interjection", "blessed are"]);
});

test("Greek definition preserves three levels and their numbering styles", () => {
  const { definitionContent } = parseStrongs(fixture("greek-lexicon"), "G3056", "https://example.com");
  const [list] = listNodes(definitionContent);
  const parents = itemNodes(list);
  assert.equal(parents.length, 3);
  assert.equal(directText(parents[0]), "of speech");
  const [nested] = listNodes(parents[0].children);
  assert.equal(nested.listType, "a");
  const speech = itemNodes(nested).find(item => directText(item) === "what someone has said");
  const [thirdLevel] = listNodes(speech.children);
  assert.equal(thirdLevel.listType, "1");
  assert.equal(itemNodes(thirdLevel).length, 6);
  assert.equal(directText(itemNodes(thirdLevel)[0]), "a word");
});

test("structured definitions discard executable markup and source attributes", () => {
  const html = fixture("hebrew-lexicon").replace("happiness, blessedness", '<strong onclick="alert(1)">happiness</strong>, blessedness<script>alert(2)</script><iframe src="https://example.com"></iframe>');
  const { definitionContent } = parseStrongs(html, "H835", "https://example.com");
  assert.doesNotMatch(JSON.stringify(definitionContent), /onclick|alert|iframe|src/);
  const [list] = listNodes(definitionContent);
  assert.equal(itemNodes(list)[0].children.find(node => node.tag === "strong").children[0].text, "happiness");
});
