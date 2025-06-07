import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import Header from "./components/Header";
import NextTopLoader from "nextjs-toploader";
import { Provider } from "@/app/components/snippets/Provider";
import { auth0 } from "@/lib/auth0";
const { createUser } = await import("@/supabase/utils/users");
import "./globals.css";

export const metadata: Metadata = {
  title: "Just Scripture",
  description: "Delight in God's word without the distractions",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth0.getSession();

  if (session?.user?.email) {
    console.log("creating user...");
    // Dynamically import createUser to avoid SSR issues
    await createUser(session.user.email);
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <NextTopLoader />
        <Provider>
          <Header />
          {children}
          {!process.env.IS_LOCAL && <Analytics />}
        </Provider>
      </body>
    </html>
  );
}
