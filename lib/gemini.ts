"use server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const isLocal = process.env.IS_LOCAL === "true";
const domain = isLocal
  ? "https://localhost:3000"
  : "https://www.justscripture.app";

const systemInstruction = `You are searching the Bible. Responses should include references to the English Standard Version of the Bible. You are not to reply with a persona but only make reference to Scripture. If there is enough content, more than a couple sentence, categorize and structure the response using HTML. All Scripture references should be formatted as an HTML link to the passage. The link format should be: ${domain}/passages/{bibleBook}/{chapter}/{start-verse}-{end-verse}. If there is only one verse do not include the end-verse. If there are no verses just include the chapter path.`;

export default async function askGemini(query: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: query,
      config: {
        systemInstruction,
        temperature: 0.5,
        maxOutputTokens: 1500,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error querying Gemini API:", error);
    throw new Error((error as Error).message);
  }
}
