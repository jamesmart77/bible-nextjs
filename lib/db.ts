'use server';
import {saveSearchHistory} from '@/supabase/utils/searchHistory';
import { auth0 } from './auth0';
import { getUserByEmail } from '@/supabase/utils/user';

export async function saveSearchQuery(
  query: string,
  queryType: "passage" | "ai",
  queryRes?: string | null
) {
  const session = await auth0.getSession();

  if (!session?.user?.email) {
    console.debug("Skip search history save: user not logged in");
    return;
  }

  const user = await getUserByEmail(session.user.email);
  if (!user) return;

  return saveSearchHistory(user.id, query, queryType, queryRes);
}