import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import Header from "./components/nav/Header";
import NextTopLoader from "nextjs-toploader";
import { Provider as ChakraProvider } from "@/app/components/chakra-snippets/Provider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.justscripture.app"),
  title: "JustScripture",
  description: "Delight in God's word without the distractions",
  openGraph: {
    title: "JustScripture",
    description: "Delight in God's word without the distractions",
    url: "/",
    siteName: "JustScripture",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "JustScripture",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JustScripture",
    description: "Delight in God's word without the distractions",
    images: ["/og-image.png"],
  },
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
