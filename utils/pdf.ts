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
    // It is critical that the worker version matches the library version exactly
    if (!pdfjs.GlobalWorkerOptions.workerSrc) {
      // Use the version exported by the library, or fallback to a specific stable version
      const version = pdfjs.version || '3.11.174';
      const majorVersion = parseInt(version.split('.')[0]);

      // Determine worker URL based on version
      // v5+ and v4+ typically use .mjs (and v5 dropped .min.mjs in some builds)
      // v3 and below typically use .js
      let workerFilename = 'pdf.worker.min.js';
      
      if (majorVersion >= 4) {
        workerFilename = 'pdf.worker.mjs';
      }

      // Use unpkg to fetch the worker script that matches the installed version
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/${workerFilename}`;
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
      // Newer PDF.js versions might have items with different structures, but .str is standard for text items
      const pageText = textContent.items
        .map((item: any) => item.str || '')
        .join(' ');
        
      fullText += pageText + ' ';
    }

    // Basic cleanup of extra whitespace
    return fullText.replace(/\s+/g, ' ').trim();
  } catch (error: any) {
    console.error("Error parsing PDF:", error);
    
    let friendlyMessage = "Could not read the PDF file.";
    
    if (error.message?.includes('fake worker')) {
       friendlyMessage += " (Worker configuration failed. Try refreshing the page.)";
    } else if (error.name === 'PasswordException') {
       friendlyMessage = "The PDF is password protected.";
    }

    throw new Error(`${friendlyMessage} Details: ${error.message}`);
  }
}