import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import Header from "./components/Header";
import { Provider } from "@/app/components/snippets/Provider";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";

export const metadata: Metadata = {
  title: "Just Scripture",
  description: "Delight in God's word without the distractions",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
