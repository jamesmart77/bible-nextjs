import { NextRequest, NextResponse } from "next/server";
import { handlePassageSearch } from "@/app/utils/passageParser";

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("reference") ?? "";
  // Only accept the ESV verse-ID range returned in prev_chapter/next_chapter.
  if (!/^\d{7,8}-\d{7,8}$/.test(reference)) {
    return NextResponse.json({ error: "Invalid chapter reference." }, { status: 400 });
  }
  try {
    const response = await fetch(
      `https://api.esv.org/v3/passage/html/?q=${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Token ${process.env.ESV_API_KEY}` },
        cache: "force-cache",
        signal: AbortSignal.timeout(15000),
      },
    );
    if (!response.ok) throw new Error("ESV request failed");
    const data = await response.json();
    const audioSrc = data.passages?.[0]?.match(
      /<a\b(?=[^>]*\bclass=["'][^"']*\bmp3link\b[^"']*["'])(?=[^>]*\bhref=["']([^"']+)["'])[^>]*>/i,
    )?.[1]?.replace(/&amp;/g, "&");
    const passageUrl = handlePassageSearch(data.canonical);
    const meta = data.passage_meta?.[0];
    if (!audioSrc || !passageUrl || !meta) throw new Error("Audio unavailable");
    return NextResponse.json({
      passageRef: data.canonical,
      audioSrc,
      passageUrl,
      previousChapter: meta.prev_chapter?.join("-") ?? null,
      nextChapter: meta.next_chapter?.join("-") ?? null,
    });
  } catch {
    return NextResponse.json({ error: "Unable to load chapter audio." }, { status: 502 });
  }
}
