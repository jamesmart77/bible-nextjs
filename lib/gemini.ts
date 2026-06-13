"use server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
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
  "All Scripture references must be HTML anchor tags (<a>) with hrefs formatted exactly as: ${domain}/passages/{bibleBook}/{chapter}/{start-verse}-{end-verse}.",
  "Never link esv.org or any other external site for scripture references.",
  "If the reference is a single verse omit the end-verse; if it is a chapter include only the chapter path.",
  "Return only final HTML fragments (no <html>, <body> wrapper) and nothing else.",
].join(" ");

export default async function askGemini(query: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: query,
      config: {
        systemInstruction,
        temperature: 0.1,
        maxOutputTokens: 1500,
      },
    });
    console.log("Response text: ", response.text);
    return response.text;
  } catch (error) {
    console.error("Error querying Gemini API:", error);
    throw new Error((error as Error).message);
  }
}
