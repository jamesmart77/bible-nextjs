"use client";

import { useRef, useState, type SubmitEventHandler } from "react";
import { useRouter } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";
import { Button, Input, Text } from "@chakra-ui/react";

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

export default function SignInModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA | null>(null);
  const router = useRouter();

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setError("Enter a valid email address.");
      return;
    }

    if (!SITE_KEY) {
      setError("Recaptcha is not configured.");
      return;
    }

    setLoading(true);

    try {
      const recaptchaToken = await recaptchaRef.current?.executeAsync();
      recaptchaRef.current?.reset();

      if (!recaptchaToken) {
        throw new Error("Recaptcha verification failed.");
      }

      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), recaptchaToken }),
      });

      const payload = await response.json();
      setLoading(false);

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to sign in.");
      }

      setSuccessMessage(
        "Sign in successful!",
      );
      setEmail("");
      setTimeout(() => {
        setIsOpen(false);
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setLoading(false);
      setError(`Error signing in. Details: ${err?.message || "Unknown error"}`);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(true)}
        disabled={!SITE_KEY}
      >
        Log in
      </Button>

      {isOpen ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.45)",
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "480px",
              background: "white",
              borderRadius: "1rem",
              padding: "1.5rem",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <Text as="h2" fontSize="xl" fontWeight="bold">
                Sign in
              </Text>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsOpen(false);
                  setError(null);
                  setSuccessMessage(null);
                }}
                aria-label="Close sign in modal"
              >
                ×
              </Button>
            </div>

            <form onSubmit={handleSubmit}>
              <label
                htmlFor="signin-email"
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: 600,
                }}
              >
                Email address
              </label>
              <Input
                id="signin-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                mb="0.75rem"
              />
              {error ? (
                <Text color="red.500" mb="0.75rem">
                  {error}
                </Text>
              ) : null}
              {successMessage ? (
                <Text color="green.600" mb="0.75rem">
                  {successMessage}
                </Text>
              ) : null}

              <Text fontSize="sm" color="gray.500" mb="1rem">
                This app creates one session per email. A lightweight reCAPTCHA
                challenge is required to prevent abuse.
              </Text>

              <Button type="submit" colorScheme="teal" loading={loading}>
                Sign in
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsOpen(false);
                  setError(null);
                  setSuccessMessage(null);
                }}
                disabled={loading}
                style={{ marginLeft: "0.75rem" }}
              >
                Cancel
              </Button>
            </form>

            <ReCAPTCHA
              sitekey={SITE_KEY}
              size="invisible"
              ref={recaptchaRef}
              onChange={() => void 0}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
