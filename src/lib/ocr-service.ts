import Tesseract from 'tesseract.js';
import { OCRResult } from '@/types';

export interface OCRProgress {
  status: string;
  progress: number;
}

/**
 * Load PDF.js dynamically from CDN to avoid build issues
 */
async function loadPdfJs(): Promise<any> {
  // Check if already loaded
  if ((window as any).pdfjsLib) {
    return (window as any).pdfjsLib;
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc = 
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(pdfjsLib);
    };
    script.onerror = () => reject(new Error('Failed to load PDF.js'));
    document.head.appendChild(script);
  });
}

/**
 * Convert a PDF page to a canvas image
 */
async function pdfPageToImage(page: any, scale: number = 2.0): Promise<HTMLCanvasElement> {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) {
    throw new Error('Could not get canvas context');
  }
  
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  
  await page.render({
    canvasContext: context,
    viewport: viewport,
  }).promise;
  
  return canvas;
}

/**
 * Extract text from a PDF file by converting pages to images and using OCR
 */
export async function extractTextFromPDF(
  file: File,
  onProgress?: (progress: OCRProgress) => void
): Promise<OCRResult> {
  onProgress?.({ status: 'Loading PDF library...', progress: 5 });
  
  try {
    // Load PDF.js dynamically
    const pdfjsLib = await loadPdfJs();
    
    onProgress?.({ status: 'Loading PDF...', progress: 10 });
    
    // Load the PDF
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    onProgress?.({ status: 'Converting pages to images...', progress: 15 });
    
    const numPages = Math.min(pdf.numPages, 5); // Process first 5 pages max
    let allText = '';
    
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      onProgress?.({ 
        status: `Processing page ${pageNum} of ${numPages}...`, 
        progress: 15 + (pageNum / numPages) * 65 
      });
      
      const page = await pdf.getPage(pageNum);
      
      // First try to extract text directly from PDF (if it has selectable text)
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      if (pageText.trim().length > 50) {
        // PDF has selectable text, use it directly
        allText += pageText + '\n\n';
      } else {
        // PDF is scanned/image-based, use OCR
        const canvas = await pdfPageToImage(page);
        
        const result = await Tesseract.recognize(canvas, 'eng', {
          logger: (m) => {
            if (m.status === 'recognizing text' && typeof m.progress === 'number') {
              const baseProgress = 15 + ((pageNum - 1) / numPages) * 65;
              const pageProgress = (m.progress * 65) / numPages;
              onProgress?.({
                status: `Recognizing text on page ${pageNum}...`,
                progress: baseProgress + pageProgress,
              });
            }
          },
        });
        
        allText += result.data.text + '\n\n';
      }
    }
    
    onProgress?.({ status: 'Parsing extracted text...', progress: 85 });
    
    const parsedResult = parseExtractedText(allText);
    parsedResult.confidence = 85; // Estimated confidence
    
    onProgress?.({ status: 'Complete!', progress: 100 });
    
    return parsedResult;
  } catch (error) {
    console.error('OCR error:', error);
    throw new Error('Failed to extract text from PDF. Please ensure the file is a valid PDF.');
  }
}

/**
 * Parse extracted text to identify title, abstract, keywords, and authors
 */
function parseExtractedText(text: string): OCRResult {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  let title = '';
  let abstract = '';
  let keywords: string[] = [];
  let authors: string[] = [];
  let year: string | undefined;
  
  // Try to find the title (usually first substantial line, often in caps or larger)
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i];
    if (line.length > 10 && line.length < 300) {
      // Skip lines that look like headers or page numbers
      if (!/^(page|abstract|keywords|introduction|\d+)$/i.test(line)) {
        title = line;
        break;
      }
    }
  }
  
  // Find abstract section
  const abstractPatterns = [
    /abstract[:\s]*([\s\S]*?)(?=\n\s*(keywords|introduction|1\.|background))/i,
    /abstract[:\s]*([\s\S]{100,2000})/i,
  ];
  
  for (const pattern of abstractPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      abstract = match[1].trim().replace(/\s+/g, ' ');
      if (abstract.length > 50) break;
    }
  }
  
  // Find keywords
  const keywordsMatch = text.match(/keywords?[:\s]*([^\n]+)/i);
  if (keywordsMatch && keywordsMatch[1]) {
    keywords = keywordsMatch[1]
      .split(/[,;]/)
      .map(k => k.trim())
      .filter(k => k.length > 2 && k.length < 50);
  }
  
  // Try to extract authors (usually after title, before abstract)
  const authorPatterns = [
    /(?:by|authors?)[:\s]*([^\n]+)/i,
    /(?:submitted by|prepared by)[:\s]*([^\n]+)/i,
  ];
  
  for (const pattern of authorPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      authors = match[1]
        .split(/[,&]/)
        .map(a => a.trim())
        .filter(a => a.length > 3 && a.length < 100 && !/\d/.test(a));
      if (authors.length > 0) break;
    }
  }
  
  // Try to find year
  const yearMatch = text.match(/\b(20\d{2}|19\d{2})\b/);
  if (yearMatch) {
    year = yearMatch[1];
  }
  
  // If we couldn't find an abstract, use the first substantial paragraph after title
  if (!abstract && lines.length > 2) {
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 100);
    if (paragraphs.length > 0) {
      abstract = paragraphs[0].replace(/\s+/g, ' ').substring(0, 1000);
    }
  }
  
  return {
    title: title || 'Untitled Document',
    abstract: abstract || '',
    keywords,
    authors,
    year,
    rawText: text,
    confidence: 0,
  };
}

/**
 * Extract text from an image file using Tesseract OCR
 */
export async function extractTextFromImage(
  file: File,
  onProgress?: (progress: OCRProgress) => void
): Promise<OCRResult> {
  onProgress?.({ status: 'Initializing OCR...', progress: 10 });
  
  const result = await Tesseract.recognize(file, 'eng', {
    logger: (m) => {
      if (m.status === 'recognizing text' && typeof m.progress === 'number') {
        onProgress?.({
          status: 'Recognizing text...',
          progress: 20 + (m.progress * 60),
        });
      }
    },
  });
  
  onProgress?.({ status: 'Parsing extracted text...', progress: 85 });
  
  const parsedResult = parseExtractedText(result.data.text);
  parsedResult.confidence = result.data.confidence;
  
  onProgress?.({ status: 'Complete!', progress: 100 });
  
  return parsedResult;
}
