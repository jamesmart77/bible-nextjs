import { useBreakpointValue } from "@chakra-ui/react";

/**
 * Hook to detect whether the current device should be considered desktop or mobile
 * based on Chakra UI breakpoints. Treats `md` and above as desktop.
 */
export default function useDeviceBreakpoint() {
  const isDesktop = useBreakpointValue({ base: false, md: true });

  return {
    isDesktop: Boolean(isDesktop),
    isMobile: !Boolean(isDesktop),
  } as const;
}
