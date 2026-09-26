const LAST_PASSAGE_KEY = "justscripture:last-passage";

// Device detection, not viewport width: a narrow desktop window should not
// opt into mobile launch behavior. Include iPads using a desktop user agent.
export function isMobileDevice() {
  const browser = navigator as Navigator & {
    userAgentData?: { mobile?: boolean };
  };
  return browser.userAgentData?.mobile === true ||
    /Android|iPhone|iPad|iPod/i.test(browser.userAgent) ||
    (browser.platform === "MacIntel" && browser.maxTouchPoints > 1);
}

function passagePath(value: string | null): string | null {
  if (!value || value.length > 200) return null;
  try {
    // Only local passage paths, including an optional verse or verse range.
    // Reject schemes, queries, fragments and encoded path separators.
    const decoded = decodeURIComponent(value);
    if (!/^\/passages\/[1-3]?[A-Za-z ]+\/[1-9]\d{0,2}(?:\/[1-9]\d{0,2}(?:-[1-9]\d{0,2})?)?$/.test(decoded)) {
      return null;
    }
    return decoded.split("/").map(encodeURIComponent).join("/");
  } catch {
    return null;
  }
}

export function rememberPassage(url: string) {
  if (!isMobileDevice()) return;
  const path = passagePath(url);
  if (!path) return;
  try {
    localStorage.setItem(LAST_PASSAGE_KEY, path);
  } catch {
    // Reading must still work when browser storage is disabled or full.
  }
}

export function getLaunchPassage(): string | null {
  if (!isMobileDevice()) return null;
  const navigation = performance.getEntriesByType("navigation")[0] as
    PerformanceNavigationTiming | undefined;
  // A reload, history traversal, or an internal link is ordinary navigation,
  // not an app launch. Missing navigation information also defaults to Home.
  if (!navigation || navigation.type !== "navigate") return null;
  try {
    const initialUrl = new URL(navigation.name);
    if (initialUrl.pathname !== "/" || initialUrl.search || initialUrl.hash ||
        location.pathname !== "/" || location.search || location.hash) return null;
    if (document.referrer && new URL(document.referrer).origin === location.origin) return null;
    return passagePath(localStorage.getItem(LAST_PASSAGE_KEY));
  } catch {
    return null;
  }
}
