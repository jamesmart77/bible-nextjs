import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth0 } from "@/lib/auth0";
import { createUser } from '@/supabase/utils/user';

export async function middleware(request: NextRequest) {
  const authRes = await auth0.middleware(request)
 
  // all auth0 routes pass through
  if (request.nextUrl.pathname.startsWith("/auth")) {
    return authRes
  }
  
  /*
    Only run middleware for the base path "/" since auth0 redirects to the base path after login.
    For logged in users, inspect request to see if user creation has already been attempted.
    If not, create the user in the database.
    This is to avoid creating the user multiple times, which can lead to unnecessary database calls.
  */

  if (request.nextUrl.pathname !== "/") {
    return NextResponse.next();
  }

  const cookieName = 'js_user_created';
  const hasUserCreationAlreadyBeenAttempted = request.cookies.get(cookieName);
  const session = await auth0.getSession();

  if (session?.user?.email && !hasUserCreationAlreadyBeenAttempted) {
    const {status} = await createUser(session.user.email);

    // Set the cookie to avoid future DB calls
    const response = NextResponse.next();
    if (status === 201) {
      response.cookies.set(
        cookieName, 
        '1', 
        { 
          path: '/', 
          httpOnly: true, 
          maxAge: 60 * 60 * 24 * 30 // 30 days
        }); 
    }
    return response;
  }

  return NextResponse.next();
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