"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getLaunchPassage } from "@/lib/navigation/lastPassage";

export default function RestoreLastPassage() {
  const router = useRouter();
  const checkedLaunch = useRef(false);

  useEffect(() => {
    // This lives in the persistent root layout. Check once, including when the
    // entry page isn't Home, so later navigation to Home never restores again.
    if (checkedLaunch.current) return;
    checkedLaunch.current = true;
    const passage = getLaunchPassage();
    if (passage) router.replace(passage);
  }, [router]);

  return null;
}
