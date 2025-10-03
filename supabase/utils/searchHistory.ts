import supabaseClient from "./client";

export type DbRes = {
  status: 200 | 400;
  error?: string;
}

export async function saveSearchHistory(
  userId: number,
  query: string,
  queryType: "passage" | "ai" | "keyword",
  queryRes?: string | null
): Promise<DbRes> {
  const { error } = await supabaseClient
    .from('search_history')
    .insert({ 
      query, 
      user_id: userId, 
      querytype: queryType, 
      queryres: queryRes ?? null
    });

  if (error) {
    console.error('Error fetching user search history:', error);
    return { status: 400, error: error.details || 'Unknown error' };
  }

  return { status: 200 };
}

export async function warmUpDb(): Promise<number | null> {
  const { data, error } = await supabaseClient
    .from("search_history")
    .select("id")
    .limit(1);

  if (error) {
    console.error("Error during DB warmup: ", error);
    return null;
  }

  return data[0]?.id | 0;
}