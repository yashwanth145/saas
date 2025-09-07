import { NextResponse } from "next/server";
import pdfParse from "pdf-parse";

// Define the structure returned by pdf-parse (minimal we need)
interface PdfParseResult {
  text: string;
  info: Record<string, unknown>;
  numpages: number;
}

// Configuration constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const VALID_MIME_TYPES = ["application/pdf", "application/x-pdf"];

export async function POST(req: Request) {
  try {
    // Parse form data
    const formData = await req.formData();
    const resume = formData.get("resume");

    // Validate file existence
    if (!(resume instanceof File)) {
      return NextResponse.json(
        { error: "Resume file is required" },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (!VALID_MIME_TYPES.includes(resume.type)) {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    // Validate file size
    if (resume.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await resume.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse PDF with configuration
    const data = await pdfParse(buffer, { max: 50 }); // Limit to 50 pages

    // Validate and type-assert pdf-parse output
    if (!data || typeof data.text !== "string" || typeof data.numpages !== "number") {
      throw new Error("Invalid PDF parse result");
    }

    const parsedData = data as PdfParseResult;

    return NextResponse.json({
      text: parsedData.text,
      info: parsedData.info,
      numPages: parsedData.numpages,
    });
  } catch (err) {
    // Sanitize error message for production
    const errorMessage =
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err instanceof Error
        ? err.message
        : "Unknown error occurred";

    console.error("Resume parse error:", {
      message: errorMessage,
      stack: err instanceof Error ? err.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { error: "Failed to parse PDF", details: errorMessage },
      { status: 500 }
    );
  }
}