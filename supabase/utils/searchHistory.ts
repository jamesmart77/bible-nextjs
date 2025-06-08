import supabaseClient from "./schema";

export type DbRes = {
  status: 200 | 400;
  error?: string;
}

export async function saveSearchHistory(
  userId: number,
  query: string,
  queryType: "passage" | "ai",
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