"use server";
import supabaseClient from "./client";

export type User = {
  id: number;
  email: string;
};

export type SearchHistory = {
  id: number;
  query: string;
  queryType: string;
  queryRes: string | null;
  createdAt: string;
};

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const { data, error } = await supabaseClient
    .from("user")
    .select("id, email")
    .eq("email", email)
    .single();

  if (error) {
    console.error("Error fetching user by email: ", error);
    return undefined;
  }

  return data;
}

export async function createUser(
  email: string
): Promise<{ status: 201 | 302 | 500; user?: User }> {
  const { data, error } = await supabaseClient
    .from("user")
    .upsert({ email }, { onConflict: "email", ignoreDuplicates: true })
    .select("id, email")
    .single();

  if (error?.details === "The result contains 0 rows") {
    console.warn(`User with email ${email} likely already exists. Skipping...`);
    return { status: 302 };
  }

  if (error) {
    console.error(`Error creating user ${email}: `, error);
    return { status: 500 };
  }

  return { status: 201, user: data };
}

export async function getUserSearchHistory(
  userId: number
): Promise<SearchHistory[]> {
  const { data, error } = await supabaseClient
    .from("search_history")
    .select(
      "id, query, queryType:querytype, queryRes:queryres, createdAt:created_at"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error fetching user search history: ", error);
    return [];
  }

  return data;
}
