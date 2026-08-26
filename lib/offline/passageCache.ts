export const ESV_OFFLINE_VERSE_LIMIT = 500;

export type CachedVerse = {
  key: string;
  verseNum: string;
  text: string;
};

export type CachedPassage = {
  url: string;
  book: string;
  bookKey: string;
  chapter: string;
  reference: string;
  verses: CachedVerse[];
  cachedAt: number;
  lastAccessed: number;
};

export type PassageToCache = Omit<CachedPassage, "cachedAt" | "lastAccessed">;

const DB_NAME = "justscripture-offline";
const DB_VERSION = 1;
const PASSAGE_STORE = "passages";

// Crossway also limits local storage to half of any individual book. These
// conventional verse totals keep the 500-verse global cache within that rule.
const HALF_BOOK_VERSE_LIMITS: Record<string, number> = {
  genesis: 766,
  exodus: 606,
  leviticus: 429,
  numbers: 644,
  deuteronomy: 479,
  joshua: 329,
  judges: 309,
  ruth: 42,
  "1samuel": 405,
  "2samuel": 347,
  "1kings": 408,
  "2kings": 359,
  "1chronicles": 471,
  "2chronicles": 411,
  ezra: 140,
  nehemiah: 203,
  esther: 83,
  job: 535,
  psalms: 1230,
  proverbs: 457,
  ecclesiastes: 111,
  songofsolomon: 58,
  isaiah: 646,
  jeremiah: 682,
  lamentations: 77,
  ezekiel: 636,
  daniel: 178,
  hosea: 98,
  joel: 36,
  amos: 73,
  obadiah: 10,
  jonah: 24,
  micah: 52,
  nahum: 23,
  habakkuk: 28,
  zephaniah: 26,
  haggai: 19,
  zechariah: 105,
  malachi: 27,
  matthew: 535,
  mark: 339,
  luke: 575,
  john: 439,
  acts: 503,
  romans: 216,
  "1corinthians": 218,
  "2corinthians": 128,
  galatians: 74,
  ephesians: 77,
  philippians: 52,
  colossians: 47,
  "1thessalonians": 44,
  "2thessalonians": 23,
  "1timothy": 56,
  "2timothy": 41,
  titus: 23,
  philemon: 12,
  hebrews: 151,
  james: 54,
  "1peter": 52,
  "2peter": 30,
  "1john": 52,
  "2john": 6,
  "3john": 7,
  jude: 12,
  revelation: 202,
};

export function normalizeBookKey(book: string) {
  const normalized = book.toLowerCase().replace(/[^a-z0-9]/g, "");
  return normalized === "psalm" ? "psalms" : normalized;
}

export function createCachedVerseKey(
  book: string,
  chapter: string,
  verseNum: string,
) {
  return `${normalizeBookKey(book)}|${chapter}|${verseNum}`;
}

function normalizePassageUrl(url: string) {
  const pathname = url.split(/[?#]/, 1)[0] || "/";
  return pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
}

function getUniqueVerseKeys(passages: CachedPassage[]) {
  return new Set(
    passages.flatMap((passage) => passage.verses.map(({ key }) => key)),
  );
}

function isWithinVerseLimits(passages: CachedPassage[]) {
  const verseKeys = getUniqueVerseKeys(passages);
  if (verseKeys.size > ESV_OFFLINE_VERSE_LIMIT) return false;

  const countsByBook = new Map<string, number>();
  for (const key of verseKeys) {
    const [bookKey] = key.split("|");
    countsByBook.set(bookKey, (countsByBook.get(bookKey) || 0) + 1);
  }

  return [...countsByBook].every(([bookKey, count]) => {
    const bookLimit = Math.min(
      HALF_BOOK_VERSE_LIMITS[bookKey] ?? 250,
      ESV_OFFLINE_VERSE_LIMIT,
    );
    return count <= bookLimit;
  });
}

export function countCachedVerses(passages: CachedPassage[]) {
  return getUniqueVerseKeys(passages).size;
}

export function planPassageCacheUpdate(
  existingPassages: CachedPassage[],
  incomingPassage: CachedPassage,
) {
  const candidates = existingPassages
    .filter((passage) => passage.url !== incomingPassage.url)
    .sort((a, b) => a.lastAccessed - b.lastAccessed);

  if (!isWithinVerseLimits([incomingPassage])) {
    return { canStore: false, evictUrls: [], totalVerseCount: 0 };
  }

  const keptPassages = [...candidates, incomingPassage];
  const evictUrls: string[] = [];

  while (!isWithinVerseLimits(keptPassages) && candidates.length > 0) {
    const oldest = candidates.shift();
    if (!oldest) break;
    evictUrls.push(oldest.url);
    const index = keptPassages.findIndex((passage) => passage.url === oldest.url);
    if (index >= 0) keptPassages.splice(index, 1);
  }

  return {
    canStore: isWithinVerseLimits(keptPassages),
    evictUrls,
    totalVerseCount: countCachedVerses(keptPassages),
  };
}

function openPassageDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(PASSAGE_STORE)) {
        database.createObjectStore(PASSAGE_STORE, { keyPath: "url" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transactionDone(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

export async function cachePassage(passage: PassageToCache) {
  const database = await openPassageDatabase();
  const now = Date.now();
  const url = normalizePassageUrl(passage.url);
  const verses = [
    ...new Map(passage.verses.map((verse) => [verse.key, verse])).values(),
  ];
  const incomingPassage: CachedPassage = {
    ...passage,
    url,
    verses,
    cachedAt: now,
    lastAccessed: now,
  };
  const transaction = database.transaction(PASSAGE_STORE, "readwrite");
  const store = transaction.objectStore(PASSAGE_STORE);

  const result = await new Promise<ReturnType<typeof planPassageCacheUpdate>>(
    (resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const existingPassages = request.result as CachedPassage[];
        const existingCopy = existingPassages.find(
          ({ url: existingUrl }) => existingUrl === url,
        );
        if (existingCopy) incomingPassage.cachedAt = existingCopy.cachedAt;

        const plan = planPassageCacheUpdate(existingPassages, incomingPassage);
        if (plan.canStore && verses.length > 0) {
          for (const evictUrl of plan.evictUrls) store.delete(evictUrl);
          store.put(incomingPassage);
        }
        resolve(plan);
      };
      request.onerror = () => reject(request.error);
    },
  );

  await transactionDone(transaction);
  database.close();
  return result;
}

export async function listCachedPassages() {
  const database = await openPassageDatabase();
  const transaction = database.transaction(PASSAGE_STORE, "readonly");
  const request = transaction.objectStore(PASSAGE_STORE).getAll();
  const passages = await new Promise<CachedPassage[]>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as CachedPassage[]);
    request.onerror = () => reject(request.error);
  });
  await transactionDone(transaction);
  database.close();
  return passages.sort((a, b) => b.lastAccessed - a.lastAccessed);
}

export async function getCachedPassage(url: string) {
  const database = await openPassageDatabase();
  const transaction = database.transaction(PASSAGE_STORE, "readwrite");
  const store = transaction.objectStore(PASSAGE_STORE);
  const request = store.get(normalizePassageUrl(url));
  const passage = await new Promise<CachedPassage | undefined>(
    (resolve, reject) => {
      request.onsuccess = () => {
        const cachedPassage = request.result as CachedPassage | undefined;
        if (cachedPassage) {
          cachedPassage.lastAccessed = Date.now();
          store.put(cachedPassage);
        }
        resolve(cachedPassage);
      };
      request.onerror = () => reject(request.error);
    },
  );
  await transactionDone(transaction);
  database.close();
  return passage;
}
