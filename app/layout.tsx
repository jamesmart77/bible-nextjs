import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import Header from "./components/Header";
import NextTopLoader from "nextjs-toploader";
import { Provider as ChakraProvider } from "@/app/components/chakra-snippets/Provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "JustScripture",
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
        <ChakraProvider>
          <Header />
          {children}
          {!process.env.IS_LOCAL && <Analytics />}
        </ChakraProvider>
      </body>
    </html>
  );
}
