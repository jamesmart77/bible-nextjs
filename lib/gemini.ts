'use server';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const isLocal = process.env.IS_LOCAL === "true";
const domain = isLocal ? "https://localhost:3000" : "https://justscripture.app";

const systemInstruction =
  `You are searching the Bible. Responses should include references to the English Standard Version of the Bible and not be longer than 3 sentences. You are not to reply with a persona but only make reference to Scripture. All Scripture references should be formatted as an HTML link to the passage. The link format should be: ${domain}/passages/{bibleBook}/{chapter}/{start-verse}-{end-verse}. If there is only one verse do not include the end-verse.`;

export default async function askGemini(query: string) {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-lite",
    contents: query,
    config: {
      systemInstruction,
      temperature: 0.5,
      maxOutputTokens: 750,
    },
  });
  return response.text;
}
