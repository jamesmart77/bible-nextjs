import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import { getUserSearchHistory } from "@/supabase/utils/user";
import { mapSearchHistoryForHome } from "@/app/components/search/searchHistoryDisplay";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getServerSession();
  const includeRecentSearches =
    new URL(request.url).searchParams.get("includeRecentSearches") === "1";
  const recentSearches =
    session && includeRecentSearches
      ? mapSearchHistoryForHome(await getUserSearchHistory(session.id))
      : [];
  const response = NextResponse.json({
    authenticated: !!session,
    ...(includeRecentSearches ? { recentSearches } : {}),
  });

  response.headers.set(
    "Cache-Control",
    "private, no-store, no-cache, max-age=0, must-revalidate",
  );
  response.headers.set("CDN-Cache-Control", "no-store");
  response.headers.set("Vercel-CDN-Cache-Control", "no-store");

  return response;
}
