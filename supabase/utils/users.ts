import supabaseClient from "./schema";

export type User = {
  id: number;
  email: string;
}

export type SearchHistory = {
  query: string; 
  createdAt: string;
}

export async function getUserByEmail(
  email: string
): Promise<User | null> {
  const { data, error } = await supabaseClient
    .from('user')
    .select('id, email')
    .eq('email', email)
    .single();

  if (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }

  return data;
}

export async function createUser(
  email: string
): Promise<User | null> {
  const { data, error } = await supabaseClient
    .from('user')
    .upsert({ email }, { onConflict: 'email', ignoreDuplicates: true })
    .select('id, email')
    .single();

  if (error) {
    error.details === 'The result contains 0 rows' ?
      console.warn(`User with email ${email} likely already exists. Skipping...`) :
      console.error(`Error creating user ${email}:`, error);
    return null;
  }

  return data;
}

export async function getUserSearchHistory(
  userId: number
): Promise<SearchHistory[]> {
  const { data, error } = await supabaseClient
    .from('search_history')
    .select('query, createdAt:created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user search history:', error);
    return [];
  }

  return data;
}