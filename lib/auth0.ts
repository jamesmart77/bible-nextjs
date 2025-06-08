import { Auth0Client } from "@auth0/nextjs-auth0/server"
import { NextResponse } from "next/server"

export const auth0 = new Auth0Client({
  async onCallback(error, context, session) {
    // redirect the user to a custom error page
    if (error || !session) {
      return NextResponse.redirect(
        new URL(`/error?error=${error?.message || 'Auth0 callback error - missing session.'}`, process.env.APP_BASE_URL)
      )
    }
    // TODO create an API route to create the user in the database
    // fix the 1 kings redirect issue

    const res = await fetch(`${process.env.APP_BASE_URL}/api/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.tokenSet.idToken}`,
      },
      body: JSON.stringify({ email: session.user.email }),
    });

    // console.log({ RESPONSE: res });

    // complete the redirect to the provided returnTo URL
    return NextResponse.redirect(
      new URL(context.returnTo || "/", process.env.APP_BASE_URL)
    )
  },
})