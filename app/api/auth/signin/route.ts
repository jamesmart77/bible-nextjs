import { NextResponse } from "next/server";
import { getUserByEmail, createUser } from "@/supabase/utils/user";
import { encryptSession } from "@/lib/session";
import { COOKIE_NAME, SESSION_MAX_AGE, SessionData } from "@/lib/constants";
import { verifyRecaptcha } from "@/lib/recaptcha";

function validateEmail(email: any) {
  return typeof email === "string" && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

function isRecaptchaToken(token: any): token is string {
  return typeof token === "string" && token.length > 0;
}

async function createSessionResponse(user: SessionData) {
  const token = await encryptSession(user);
  const res = NextResponse.json({ ok: true });
  res.headers.append(
    "Set-Cookie",
    `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_MAX_AGE}`,
  );
  return res;
}

export async function POST(req: Request) {
  const body = await req.json();
  const email = body?.email;
  const recaptchaToken = body?.recaptchaToken;

  if (!validateEmail(email) || !isRecaptchaToken(recaptchaToken)) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  const recaptchaOk = await verifyRecaptcha(recaptchaToken);
  if (!recaptchaOk) {
    return NextResponse.json(
      { message: "Recaptcha validation failed" },
      { status: 400 },
    );
  }

  const existing = await getUserByEmail(email);
  if (existing) {
    return createSessionResponse({ id: existing.id, email: existing.email });
  }

  const { status, user } = await createUser(email);
  if (status === 201 && user) {
    return createSessionResponse({ id: user.id, email: user.email });
  }

  return NextResponse.json({ message: "Unable to sign in" }, { status: 500 });
}
