"use server";
import { GoogleGenAI } from "@google/genai";
import { getServerSession } from "@/lib/session";

const isLocal = process.env.IS_LOCAL === "true";
const domain = isLocal
  ? "https://localhost:3000"
  : "https://www.justscripture.app";

const systemInstruction = [
  "You are a strict Bible search assistant. Use the English Standard Version (ESV) only.",
  "Return only semantic HTML fragments containing the answer and scripture links. Do NOT include any meta-text.",
  "Format the HTML using only the following tags: <p>, <em>, <strong>, <a>, <h3>, <h4>.",
  "Do not use backticks, code blocks, numbered lists, or any surrounding markdown or plaintext before or after the HTML.",
  "If you cannot locate relevant scripture, return a simple, factual HTML paragraph such as <p>No matching verses or passages found.</p> — do not invent or speculate.",
  `All Scripture references must be HTML anchor tags (<a>) with hrefs formatted exactly as: ${domain}/passages/{bibleBook}/{chapter}/{start-verse}-{end-verse}.`,
  "Never link esv.org or any other external site for scripture references.",
  "If the reference is a single verse omit the end-verse; if it is a chapter include only the chapter path.",
  "Return only final HTML fragments (no <html>, <body> wrapper) and nothing else.",
].join(" ");

export type AssistedSearchResult =
  | { ok: true; html: string }
  | { ok: false; message: string; requiresSignIn: boolean };

export default async function askGemini(query: string): Promise<AssistedSearchResult> {
  const session = await getServerSession();
  if (!session) {
    return { ok: false, message: "Log in to use Assisted search.", requiresSignIn: true };
  }

  if (!query.trim()) {
    return { ok: false, message: "Enter a Bible question to search.", requiresSignIn: false };
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    console.error("Assisted search configuration error: GEMINI_API_KEY is not set.");
    return { ok: false, message: "Assisted search is not configured. Please try again later.", requiresSignIn: false };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: query,
      config: {
        systemInstruction,
        temperature: 0.1,
        maxOutputTokens: 1500,
      },
    });
    const html = response.text?.trim();
    if (!html) {
      return { ok: false, message: "No answer was returned. Try rephrasing your question.", requiresSignIn: false };
    }
    return { ok: true, html };
  } catch (error) {
    console.error("Error querying Gemini API:", error);
    const status = error && typeof error === "object" && "status" in error
      ? Number(error.status)
      : undefined;
    const message = status === 429
      ? "Assisted search has reached its usage limit. Please try again later."
      : status === 400 || status === 401 || status === 403 || status === 404
        ? "Assisted search is unavailable due to a service configuration issue. Please try again later."
        : "Assisted search is temporarily unavailable. Please try again.";
    // Expected failures must be returned: React redacts thrown server errors in production.
    return { ok: false, message, requiresSignIn: false };
  }
}
