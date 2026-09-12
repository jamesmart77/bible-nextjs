import assert from "node:assert/strict";
import test from "node:test";
import {
  getCrossReferences,
  crossReferenceHref,
  splitReferenceText,
} from "./crossReferences";
import {
  getPassageVerseGroups,
  getPassageVerseTextByNumber,
} from "./scriptureHtmlParser";

const html = `<p id="p43001001_01-1"><b class="verse-num">1 </b>First <sup><a class="cf" href="1 Samuel 1:11; Romans 3:5–7/">a</a></sup>words <i>with emphasis</i>.<sup class="footnote"><a class="fn" href="#f1">1</a></sup></p>
<p id="p43001001_02-1">More <sup><a class="cf" href="John 1:2/">b</a></sup>words.</p>
<p><span id="p43001002_01-1"><b class="verse-num">2 </b>Poetry</span><br/><span id="p43001002_02-1">continues <sup><a class="cf" href="Psalm 23:1/">c</a></sup>here.</span><br/></p>`;

test("preserves original reference targets and groups continued verses", () => {
  const groups = getPassageVerseGroups(html);
  assert.equal(groups.get("1")?.length, 2);
  assert.deepEqual(
    getCrossReferences(groups.get("1")!.flatMap((verse) => verse.nodes)),
    [
      { label: "a", references: ["1 Samuel 1:11", "Romans 3:5–7"] },
      { label: "b", references: ["John 1:2"] },
    ],
  );
  assert.deepEqual(getCrossReferences(groups.get("2")![0].nodes), [
    { label: "c", references: ["Psalm 23:1"] },
  ]);
  assert.equal(
    getCrossReferences(groups.get("1")![0].nodes)[0].references[0],
    "1 Samuel 1:11",
  );
});

test("copy text retains nested scripture and excludes reference/footnote markers", () => {
  const text = getPassageVerseTextByNumber(html);
  assert.equal(text.get("1"), "1 First words with emphasis. More words.");
  assert.equal(text.get("2"), "2 Poetry continues here.");
});

test("links numbered and multiword books, verse ranges and cross-chapter references", () => {
  assert.equal(crossReferenceHref("1 Samuel 1:11"), "/passages/1Samuel/1/11");
  assert.equal(crossReferenceHref("Romans 3:5–7"), "/passages/Romans/3/5-7");
  assert.equal(
    crossReferenceHref("Song of Solomon 2:1"),
    "/passages/SongofSolomon/2/1",
  );
  assert.equal(crossReferenceHref("John 1:51-2:2"), "/passages/John/1/51");
  assert.equal(crossReferenceHref("Jude 5"), "/passages/Jude/1/5");
});

test("single references omit redundant verse numbers", () => {
  assert.deepEqual(splitReferenceText("[15] Though I am in the right."), [
    { text: "Though I am in the right." },
  ]);
});

test("ranges retain individually labelled verses without bracket formatting", () => {
  assert.deepEqual(
    splitReferenceText(
      "[5] First verse.\n\n[6] Second verse.\nPoetry continues.",
    ),
    [
      { verseNumber: "5", text: "First verse." },
      { verseNumber: "6", text: "Second verse.\nPoetry continues." },
    ],
  );
  assert.deepEqual(splitReferenceText("Text [without numbers]."), [
    { text: "Text [without numbers]." },
  ]);
});
