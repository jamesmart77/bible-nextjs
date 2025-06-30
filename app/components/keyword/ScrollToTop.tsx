"use client";
import { IconButton } from "@chakra-ui/react";
import { RiArrowUpDoubleLine } from "react-icons/ri";
import { useEffect, useState } from "react";

export default function ScrollToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShow(window.scrollY > 150); // 150px threshold from the top
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!show) return null;
  return (
    <IconButton
      aria-label="Scroll to top"
      onClick={scrollToTop}
      position="fixed"
      bottom={{ base: "8rem", sm: "1rem" }}
      zIndex={1000}
      colorPalette="cyan"
      variant="subtle"
      size="lg"
    >
      <RiArrowUpDoubleLine />
    </IconButton>
  );
}
