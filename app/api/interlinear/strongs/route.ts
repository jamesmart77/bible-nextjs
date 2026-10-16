import { NextRequest, NextResponse } from "next/server";
import { getStrongs, normalizeStrongs } from "@/lib/interlinear/source";

export async function GET(request: NextRequest) {
  const number = normalizeStrongs(request.nextUrl.searchParams.get("number") ?? "");
  if (!number) return NextResponse.json({ error: "Invalid Strong’s number." }, { status: 400 });
  try {
    return NextResponse.json(await getStrongs(number), { headers: { "Cache-Control": "public, max-age=3600" } });
  } catch {
    return NextResponse.json({ error: "Unable to load this Strong’s definition. Please try again." }, { status: 502 });
  }
}
