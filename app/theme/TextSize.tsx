"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type TextSize = "default" | "large" | "extra-large";

type TextSizeContextValue = {
  textSize: TextSize;
  setTextSize: (textSize: TextSize) => void;
};

const STORAGE_KEY = "justscripture-text-size";
const TEXT_SIZES: TextSize[] = ["default", "large", "extra-large"];

const TextSizeContext = createContext<TextSizeContextValue | undefined>(
  undefined,
);

function isTextSize(value: string | null): value is TextSize {
  return TEXT_SIZES.includes(value as TextSize);
}

function applyTextSize(textSize: TextSize) {
  document.documentElement.dataset.textSize = textSize;
}

function getStoredTextSize(): TextSize {
  try {
    const storedTextSize = localStorage.getItem(STORAGE_KEY);
    return isTextSize(storedTextSize) ? storedTextSize : "default";
  } catch {
    return "default";
  }
}

function storeTextSize(textSize: TextSize) {
  try {
    localStorage.setItem(STORAGE_KEY, textSize);
  } catch {
    // The setting still applies for this visit when storage is unavailable.
  }
}

export function TextSizeProvider({ children }: { children: React.ReactNode }) {
  const [textSize, setTextSizeState] = useState<TextSize>("default");

  useEffect(() => {
    const initialTextSize = getStoredTextSize();

    setTextSizeState(initialTextSize);
    applyTextSize(initialTextSize);
  }, []);

  const setTextSize = useCallback((nextTextSize: TextSize) => {
    setTextSizeState(nextTextSize);
    applyTextSize(nextTextSize);
    storeTextSize(nextTextSize);
  }, []);

  return (
    <TextSizeContext.Provider value={{ textSize, setTextSize }}>
      {children}
    </TextSizeContext.Provider>
  );
}

export function useTextSize() {
  const context = useContext(TextSizeContext);

  if (!context) {
    throw new Error("useTextSize must be used within a TextSizeProvider");
  }

  return context;
}
