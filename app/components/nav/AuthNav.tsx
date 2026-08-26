"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import NextLink from "next/link";
import { IconButton, Link as ChakraLink } from "@chakra-ui/react";
import { RiAccountCircleLine } from "react-icons/ri";
import SignInModal from "@/app/components/nav/SignInModal";
import { AUTH_SESSION_CHANGED_EVENT } from "@/lib/auth-events";

type AuthNavProps = {
  initialIsSignedIn: boolean;
};

export default function AuthNav({ initialIsSignedIn }: AuthNavProps) {
  const [isSignedIn, setIsSignedIn] = useState(initialIsSignedIn);
  const initialIsSignedInRef = useRef(initialIsSignedIn);

  useEffect(() => {
    initialIsSignedInRef.current = initialIsSignedIn;
    setIsSignedIn(initialIsSignedIn);
  }, [initialIsSignedIn]);

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/session", {
        cache: "no-store",
        credentials: "same-origin",
      });

      if (!response.ok) return;

      const payload = await response.json();
      setIsSignedIn(Boolean(payload?.authenticated));
    } catch {
      setIsSignedIn(initialIsSignedInRef.current);
    }
  }, []);

  useEffect(() => {
    const refreshSession = () => void checkSession();

    refreshSession();
    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, refreshSession);
    window.addEventListener("pageshow", refreshSession);

    return () => {
      window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, refreshSession);
      window.removeEventListener("pageshow", refreshSession);
    };
  }, [checkSession]);

  if (isSignedIn) {
    return (
      <ChakraLink asChild title="Account">
        <NextLink href="/account">
          <IconButton
            rounded="full"
            aria-label="Navigate to account page"
            variant="ghost"
            size="md"
            color="var(--js-text-primary)"
            _hover={{ bg: "var(--js-bg-muted)" }}
          >
            <RiAccountCircleLine />
          </IconButton>
        </NextLink>
      </ChakraLink>
    );
  }

  return <SignInModal onSignedIn={() => setIsSignedIn(true)} />;
}
