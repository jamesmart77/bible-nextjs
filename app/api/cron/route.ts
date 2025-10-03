import { NextResponse } from "next/server";

export async function GET(request: Request) {
  if (
    request.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse("Unauthorized - be gone!", { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
