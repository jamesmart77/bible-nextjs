import { warmUpDb } from "@/supabase/utils/searchHistory";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  if (
    request.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    console.error("Unauthorized - be gone!");
    return new NextResponse("Unauthorized - be gone!", { status: 401 });
  }

  const sampleRecordId = await warmUpDb();
  console.log("Cron job executed. Sample record ID: ", sampleRecordId);
  return NextResponse.json({ ok: true });
}
