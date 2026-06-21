import type { SearchHistory as SearchHistoryType } from "@/supabase/utils/user";

export type SearchType = "passage" | "keyword" | "assisted";

export type RecentSearch = {
  id: string;
  type: SearchType;
  label: string;
};

export function truncateAssistedQuery(query: string, maxWords = 4) {
  const words = query.trim().split(/\s+/);

  return words.length > maxWords
    ? `${words.slice(0, maxWords).join(" ")}…`
    : query;
}

export function getDisplayLabel(search: RecentSearch) {
  if (search.type === "assisted") {
    return truncateAssistedQuery(search.label, 4);
  }

  return search.label;
}

function normalizeRecentSearch(item: SearchHistoryType): RecentSearch | null {
  if (!["passage", "keyword", "ai"].includes(item.queryType)) return null;

  return {
    id: String(item.id),
    type: item.queryType === "ai" ? "assisted" : (item.queryType as SearchType),
    label: item.query,
  };
}

export function mapSearchHistoryForHome(searchHistory: SearchHistoryType[]) {
  return searchHistory
    .map(normalizeRecentSearch)
    .filter((search): search is RecentSearch => Boolean(search))
    .slice(0, 4);
}
