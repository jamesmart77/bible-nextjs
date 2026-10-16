# NAS interlinear study panel

Open the book icon in the passage action bar, then choose **Interlinear**. The drawer always opens on Commentary. Interlinear shows the entire current chapter in NASB 1995, regardless of the translation in the main reading view. Selecting an English word or an original-language Strong’s number loads its NAS lexicon entry above the verses.

- `GET /api/interlinear?book=psalms&chapter=119` extracts only verse rows, English word associations, original-language text, and Greek morphology from BibleStudyTools.
- `GET /api/interlinear/strongs?number=H835` resolves the NAS Strong’s number through BibleStudyTools and extracts the word, pronunciation, part of speech, definition, origin, and lexicon references.
- Books and chapter limits are validated. Definition fetches are restricted to the expected BibleStudyTools NAS Hebrew/Greek lexicon paths. Upstream HTML is converted into plain structured data; scripts, ads, event handlers, and arbitrary HTML are never rendered.
- Upstream responses are cached for 24 hours; successful API responses can be cached by the browser for one hour. Lookups have a 15-second timeout per upstream request. The UI provides retry controls for failures.
- Original-language strings use BibleStudyTools’ legacy encoding. The corresponding small BST fonts are served locally from `public/fonts/interlinear`.

Run scraper regression tests with:

```sh
node --test lib/interlinear/interlinear.test.mjs
```

Fixtures contain two verse rows and one lexicon entry from each language. They preserve the upstream markup (including malformed span closures) so parser changes can be checked without a network connection. If BibleStudyTools changes its markup, update `lib/interlinear/parse.ts` and the fixtures together.

Sources: [Psalm 119 NAS interlinear](https://www.biblestudytools.com/interlinear-bible/nas/psalms/119.html), [John 1 NAS interlinear](https://www.biblestudytools.com/interlinear-bible/nas/john/1.html), [Hebrew H835](https://www.biblestudytools.com/lexicons/hebrew/nas/esher.html), [Greek G3056](https://www.biblestudytools.com/lexicons/greek/nas/logos.html).
