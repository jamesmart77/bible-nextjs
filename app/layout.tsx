import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from '@vercel/analytics/next';
import { auth0 } from "@/lib/auth0"
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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


  return (
    <html lang="en">
      <header>
        {!session && (
          <>
            <a href="/auth/login?screen_hint=signup">Sign up</a>
            {' '}
            <a href="/auth/login">Log in</a>
          </>
        )}
        {session && (
          <>
          <span>Welcome, {session.user.name}!</span>
          <a href="/auth/logout">Log out</a>
          </>
        )}
      </header>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
