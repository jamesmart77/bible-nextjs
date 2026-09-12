import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("reference") ?? "";
  if (
    reference.length > 160 ||
    !/^[1-3]?\s*[A-Za-z][A-Za-z .]*\s+\d+(?::\d+)?(?:\s*[-–,]\s*\d+(?::\d+)?)*$/.test(
      reference,
    )
  ) {
    return NextResponse.json(
      { error: "Invalid scripture reference." },
      { status: 400 },
    );
  }
  const params = new URLSearchParams({
    q: reference,
    "include-passage-references": "false",
    "include-verse-numbers": "true",
    "include-footnotes": "false",
    "include-headings": "false",
    "include-short-copyright": "false",
  });
  try {
    const response = await fetch(
      `https://api.esv.org/v3/passage/text/?${params}`,
      {
        headers: { Authorization: `Token ${process.env.ESV_API_KEY}` },
        cache: "force-cache",
        signal: AbortSignal.timeout(15000),
      },
    );
    if (!response.ok) throw new Error("ESV request failed");
    const data = await response.json();
    const text = data.passages?.join("\n\n").trim();
    if (!text) throw new Error("Passage unavailable");
    return NextResponse.json({ text });
  } catch {
    return NextResponse.json(
      { error: "Unable to load this reference. Please try again." },
      { status: 502 },
    );
  }
}
