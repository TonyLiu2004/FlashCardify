import { NextResponse } from 'next/server';
import pdf from 'pdf-parse';

const cleanText = (text: string) => {
  return text
    .replace(/[^a-zA-Z0-9\s.,!?]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export async function POST(req: Request) {
  console.log("Caught Request");
  try {
    const body = await req.json();
    const { file, fileType } = body;

    //console.log("File Type:", fileType);
    const fileBuffer = Buffer.from(file, 'base64');

    if (fileType === 'application/pdf') {
      //console.log("Processing PDF...");
      const pdfData = await pdf(fileBuffer);
      //console.log("Extracted PDF Text (before cleaning):", pdfData.text);

      const cleanedText = cleanText(pdfData.text);
      //console.log("Cleaned PDF Text:", cleanedText);

      return NextResponse.json({ message: "PDF processed successfully", extractedText: cleanedText }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing PDF file:', error);
    return NextResponse.json({ error: 'Error processing file' }, { status: 500 });
  }
}
