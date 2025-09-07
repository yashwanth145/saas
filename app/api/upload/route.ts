
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import PDFParser from 'pdf2json';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI("AIzaSyAUGJLk9ag27tbf-kmMaMNmY_jnNeFLVg4");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Define interface for PDFParser to avoid using `any`
interface PDFParserInstance {
  on(event: string, callback: (data: unknown) => void): void;
  loadPDF(path: string): void;
  getRawTextContent(): string;
}



export async function POST(req: NextRequest) {
  const formData: FormData = await req.formData();
  const uploadedFiles = formData.getAll('filepond');
  let fileName = '';
  let parsedText = '';

  if (!uploadedFiles || uploadedFiles.length === 0) {
    return new NextResponse(
      JSON.stringify({ error: 'No valid file uploaded.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const uploadedFile = uploadedFiles[0];
  if (!(uploadedFile instanceof File)) {
    return new NextResponse(
      JSON.stringify({ error: 'Uploaded file is not valid.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    fileName = uuidv4();
    const tempFilePath = `/tmp/${fileName}.pdf`;
    const fileBuffer = Buffer.from(await uploadedFile.arrayBuffer());
    await fs.writeFile(tempFilePath, fileBuffer);

    // Create PDFParser instance with proper typing
    const pdfParser = new PDFParser(null, true) as PDFParserInstance;
    parsedText = await new Promise<string>((resolve) => {
      pdfParser.on('pdfParser_dataReady', () => resolve(pdfParser.getRawTextContent()));
      pdfParser.loadPDF(tempFilePath);
    });

    const prompt = `
      You are an expert resume reviewer.
      Review the following resume text and provide:
      1. Suggestions for improvement
      2. Feedback on formatting, clarity, and impact
      3. Tips to make it stand out for recruiters
      Resume Content:
      ${parsedText}
    `;

    const aiResponse = await model.generateContent(prompt);


const reviewText =
  aiResponse?.response?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No review generated';
    const response = new NextResponse(JSON.stringify({ review: reviewText }));
    response.headers.set('Content-Type', 'application/json');
    response.headers.set('FileName', fileName);
    return response;
  } catch (error) {
    console.error('Error processing resume:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Error processing resume.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}