import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecrypt } from 'jose';
import { COOKIE_NAME } from './lib/constants';

const KEY = Buffer.from(process.env.SESSION_SECRET || '', 'base64');

export async function proxy(req: NextRequest) {
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  if (!cookie) return NextResponse.next();

  try {
    const { payload } = await jwtDecrypt(cookie, KEY as any);
    const requestHeaders = new Headers(req.headers);
    if (payload?.email) requestHeaders.set('x-user-email', String(payload.email));
    if (payload?.id) requestHeaders.set('x-user-id', String(payload.id));

    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch (err) {
    const res = NextResponse.next();
    res.headers.append('Set-Cookie', `${COOKIE_NAME}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict`);
    return res;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}
