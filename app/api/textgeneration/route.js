import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { prompt, tokenCount } = await req.json();

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY3);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Construct prompt with token count
    const enhancedPrompt = `Generate a response based on the following prompt: ${prompt}. Limit the response to approximately ${tokenCount} tokens.`;

    const result = await model.generateContent(enhancedPrompt);
    const text = result.response.text();

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Error with Gemini API:", error);
    return NextResponse.json({ error: "Failed to generate text" }, { status: 500 });
  }
}