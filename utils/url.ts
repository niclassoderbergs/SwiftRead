export async function fetchTextFromUrl(url: string): Promise<string> {
  try {
    // Validate URL format
    new URL(url);

    // Use a CORS proxy to bypass browser restrictions
    // using allorigins.win which is a reliable free proxy for this purpose
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const data = await response.json();
    const htmlContent = data.contents;

    if (!htmlContent) {
      throw new Error("No content received from URL");
    }

    // Parse the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // Remove unwanted elements that aren't main text
    const selectorsToRemove = [
      'script', 'style', 'noscript', 'iframe', 
      'nav', 'footer', 'header', 'aside', 
      '.nav', '.footer', '.header', '.menu', '#menu', '.sidebar'
    ];

    selectorsToRemove.forEach(selector => {
      const elements = doc.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });

    // Extract text content
    const text = doc.body.textContent || "";

    // Clean up whitespace: replace multiple spaces/newlines with single space
    return text.replace(/\s+/g, ' ').trim();

  } catch (error: any) {
    console.error("Error fetching URL:", error);
    if (error.code === 'ERR_INVALID_URL' || error instanceof TypeError) {
      throw new Error("Invalid URL format. Please include https://");
    }
    throw new Error(`Could not fetch content: ${error.message}`);
  }
}