import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SerwistProvider } from "@serwist/turbopack/react";
import Header from "./components/nav/Header";
import NextTopLoader from "nextjs-toploader";
import { Provider as ChakraProvider } from "@/app/components/chakra-snippets/Provider";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "JustScripture",
  metadataBase: new URL("https://www.justscripture.app"),
  title: "JustScripture",
  description: "Delight in God's word without the distractions",
  openGraph: {
    title: "JustScripture",
    description: "Delight in God's word without the distractions",
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
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "JustScripture",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF7F0" },
    { media: "(prefers-color-scheme: dark)", color: "#161218" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SerwistProvider
          swUrl="/serwist/sw.js"
          disable={process.env.NODE_ENV !== "production"}
          cacheOnNavigation={false}
          reloadOnOnline={false}
        >
          <NextTopLoader />
          <ChakraProvider>
            <Header />
            {children}
            {!process.env.IS_LOCAL && <Analytics />}
          </ChakraProvider>
        </SerwistProvider>
      </body>
    </html>
  );
}
