import { NextResponse } from "next/server";

export async function GET(request: Request) {
  if (
    request.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    console.error("Unauthorized - be gone!");
    return new NextResponse("Unauthorized - be gone!", { status: 401 });
  }
  console.log("Cron job executed");
  return NextResponse.json({ ok: true });
}
