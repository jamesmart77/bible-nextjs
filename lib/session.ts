import { EncryptJWT, jwtDecrypt, JWTPayload } from "jose";
import { cookies } from "next/headers";
import { unstable_rethrow } from "next/navigation";
import { SessionData, COOKIE_NAME, SESSION_EXP_TIME } from "./constants";

function getKey() {
  const secret = process.env.SESSION_SECRET!;
  if (!secret) throw new Error("SESSION_SECRET not set");
  return Buffer.from(secret, "base64");
}

export async function encryptSession(payload: SessionData) {
  const key = getKey();
  return await new EncryptJWT(payload)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setExpirationTime(SESSION_EXP_TIME)
    .encrypt(key as any);
}

function assertSessionData(payload: JWTPayload): SessionData {
  if (
    !payload ||
    typeof payload !== "object" ||
    typeof payload.id !== "number" ||
    typeof payload.email !== "string"
  ) {
    throw new Error("Invalid session payload");
  }

  return payload as SessionData;
}

export async function decryptSession(token: string): Promise<SessionData> {
  const key = getKey();
  try {
    const { payload } = await jwtDecrypt(token, key);
    return assertSessionData(payload);
  } catch (err) {
    console.error("Session decryption failed:", err);
    throw new Error("Invalid session");
  }
}

export async function getServerSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(COOKIE_NAME)?.value;
    if (!cookie) {
      console.warn("No session cookie found...");
      return null;
    }
    return await decryptSession(cookie);
  } catch (err) {
    unstable_rethrow(err);
    console.error("Failed to get server session:", err);
    return null;
  }
}
