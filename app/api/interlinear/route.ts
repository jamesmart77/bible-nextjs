import { NextRequest, NextResponse } from "next/server";
import { chapterUrl, getChapter } from "@/lib/interlinear/source";

export async function GET(request: NextRequest) {
  const url = chapterUrl(request.nextUrl.searchParams.get("book") ?? "", Number(request.nextUrl.searchParams.get("chapter")));
  if (!url) return NextResponse.json({ error: "Invalid Bible chapter." }, { status: 400 });
  try {
    return NextResponse.json(await getChapter(url), { headers: { "Cache-Control": "public, max-age=3600" } });
  } catch {
    return NextResponse.json({ error: "Unable to load the NAS interlinear. Please try again." }, { status: 502 });
  }
}
