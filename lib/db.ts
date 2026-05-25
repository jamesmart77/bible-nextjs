'use server';
import {saveSearchHistory} from '@/supabase/utils/searchHistory';
import { getServerSession } from './session';
import { getUserByEmail } from '@/supabase/utils/user';

export async function saveSearchQuery(
  query: string,
  queryType: "passage" | "ai" | "keyword",
  queryRes?: string | null
) {
  const session = await getServerSession();

  if (!session?.email) {
    console.debug('Skip search history save: user not logged in');
    return;
  }

  const user = await getUserByEmail(session.email as string);
  if (!user) return;

  return saveSearchHistory(user.id, query, queryType, queryRes);
}