import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";

export async function GET() {
  const session = await getServerSession();
  const response = NextResponse.json({ authenticated: !!session });

  response.headers.set("Cache-Control", "no-store, max-age=0");

  return response;
}
