import type { Metadata } from "next";
import OfflineLibrary from "./OfflineLibrary";

export const metadata: Metadata = {
  title: "Offline | JustScripture",
  description: "Read passages saved for offline use.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OfflinePage() {
  return <OfflineLibrary />;
}
