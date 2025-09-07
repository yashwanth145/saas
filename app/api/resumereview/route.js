import { NextResponse } from "next/server";
import fs from "fs";
import nodePath from "path";   // ✅ renamed so it won't conflict
import pdfParse from "pdf-parse"; // ✅ renamed so it won't conflict

export async function POST(req) {
  try {
    const formData = await req.formData();
    const resume = formData.get("resume");

    if (!resume) {
      return NextResponse.json(
        { error: "Resume file is required" },
        { status: 400 }
      );
    }

    if (resume.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    // Save file as mypdf.pdf in project root
    const buffer = Buffer.from(await resume.arrayBuffer());
    const filePath = nodePath.join(process.cwd(), "mypdf.pdf");
    fs.writeFileSync(filePath, buffer);

    // Extract PDF content
    const data = await pdfParse(buffer);

    return NextResponse.json({
      text: data.text,
      info: data.info,
      numPages: data.numpages,
    });
  } catch (err) {
    console.error("Resume parse error:", err);
    return NextResponse.json(
      { error: "Failed to parse PDF", details: err.message },
      { status: 500 }
    );
  }
}
