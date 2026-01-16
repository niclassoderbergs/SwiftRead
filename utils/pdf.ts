// No top-level imports from pdfjs-dist to avoid initial load crashes
// We use dynamic imports inside the function instead

export async function extractTextFromPdf(file: File): Promise<string> {
  try {
    // Dynamically import the library
    // @ts-ignore
    const pdfjsModule = await import('pdfjs-dist');
    
    // Handle ESM/CommonJS interop (sometimes the library is on .default)
    const pdfjs = pdfjsModule.default || pdfjsModule;

    // Configure worker
    if (!pdfjs.GlobalWorkerOptions.workerSrc) {
      const PDFJS_VERSION = '3.11.174';
      pdfjs.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.mjs`;
    }

    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF document
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';

    // Iterate through all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // Extract text items and join them
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
        
      fullText += pageText + ' ';
    }

    // Basic cleanup of extra whitespace
    return fullText.replace(/\s+/g, ' ').trim();
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error("Could not read the PDF file. Please check that it is not corrupted or password protected.");
  }
}