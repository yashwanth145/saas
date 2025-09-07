import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { prompt, wordCount, assistantType } = await req.json();

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY2);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let enhancedPrompt = prompt;
    if (assistantType === "creative") {
      enhancedPrompt = `Write a creative piece based on the following prompt: ${prompt}. Aim for approximately ${wordCount} words.`;
    } else if (assistantType === "technical") {
      enhancedPrompt = `Write a technical explanation based on the following prompt: ${prompt}. Aim for approximately ${wordCount} words.`;
    } else if (assistantType === "academic") {
      enhancedPrompt = `Write an academic-style response based on the following prompt: ${prompt}. Aim for approximately ${wordCount} words.`;
    } else {
      enhancedPrompt = `Generate a response based on the following prompt: ${prompt}. Aim for approximately ${wordCount} words.`;
    }

    const result = await model.generateContent(enhancedPrompt);
    const text = result.response.text();

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Error with Gemini API:", error);
    return NextResponse.json({ error: "Failed to generate text" }, { status: 500 });
  }
}