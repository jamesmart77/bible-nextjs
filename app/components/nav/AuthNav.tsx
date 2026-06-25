"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import { IconButton, Link as ChakraLink } from "@chakra-ui/react";
import { RiAccountCircleLine } from "react-icons/ri";
import SignInModal from "@/app/components/nav/SignInModal";

type AuthNavProps = {
  initialIsSignedIn: boolean;
};

export default function AuthNav({ initialIsSignedIn }: AuthNavProps) {
  const [isSignedIn, setIsSignedIn] = useState(initialIsSignedIn);

  useEffect(() => {
    let ignore = false;

    async function checkSession() {
      try {
        const response = await fetch("/api/auth/session", {
          cache: "no-store",
          credentials: "same-origin",
        });
        const payload = await response.json();

        if (!ignore) {
          setIsSignedIn(Boolean(payload?.authenticated));
        }
      } catch {
        if (!ignore) {
          setIsSignedIn(initialIsSignedIn);
        }
      }
    }

    checkSession();

    return () => {
      ignore = true;
    };
  }, [initialIsSignedIn]);

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
