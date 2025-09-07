import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const image = formData.get("image");

    if (!image) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    const base64Image = buffer.toString("base64");

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY1);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" });

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Image,
          mimeType: image.type,
        },
      },
      "Remove the background from this image and return the result as an image.",
    ]);

    let imageUrl = "";
    for (const part of result.response.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.mimeType.startsWith("image/")) {
        imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageUrl) {
      throw new Error("No image data returned");
    }

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Error with Gemini API:", error);
    return NextResponse.json({ error: "Failed to remove background" }, { status: 500 });
  }
}