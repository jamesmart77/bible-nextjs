import { Auth0Client } from "@auth0/nextjs-auth0/server"
import { SessionData } from "@auth0/nextjs-auth0/types";
import { NextResponse } from "next/server"

async function registerUser(session: SessionData, passageContext?: string){
  const res = await fetch(`${process.env.APP_BASE_URL}/api/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.tokenSet.idToken}`,
      },
      body: JSON.stringify({ email: session.user.email, passageContext }),
    });

    const data = await res.json();
    
    if (res.status === 201 || res.status === 302) {
      return;
    }

    throw new Error(`Status: ${res.status}. Error creating user: ${data.message}`);
}

export const auth0 = new Auth0Client({
  async onCallback(error, context, session) {
    if (error || !session) {
      return NextResponse.redirect(
        new URL(`/error?error=${error?.message || 'Auth0 callback error - missing session.'}`, process.env.APP_BASE_URL)
      )
    }

    try {
      await registerUser(session, context.returnTo || '/');
    } catch (err) {
      const errorMsg = encodeURIComponent("Error occurred during user signin and registration.");
      return NextResponse.redirect(
        new URL(`/error?error=${errorMsg}`, process.env.APP_BASE_URL)
      )
    }

    return NextResponse.redirect(
      new URL(context.returnTo || "/", process.env.APP_BASE_URL)
    )
  },
})