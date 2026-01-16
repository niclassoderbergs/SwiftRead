export async function fetchTextFromUrl(url: string): Promise<string> {
  // 1. Validate URL format first to separate user error from network error
  try {
    new URL(url);
  } catch (e) {
    throw new Error("Invalid URL format. Please include https://");
  }

  try {
    // Use a CORS proxy. allorigins.win is generally reliable.
    // We add a timestamp to prevent caching old responses.
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}&t=${Date.now()}`;
    
    // 2. Setup timeout (15 seconds) so it doesn't hang indefinitely
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(proxyUrl, { 
      signal: controller.signal 
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Proxy network error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Check if the proxy actually got content
    if (!data.contents) {
      throw new Error("The proxy could not retrieve content from this URL.");
    }

    const htmlContent = data.contents;

    // 3. Parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // 4. Remove clutter (Expanded list)
    const selectorsToRemove = [
      'script', 'style', 'noscript', 'iframe', 'svg',
      'nav', 'footer', 'header', 'aside', 'form',
      '.nav', '.footer', '.header', '.menu', '#menu', '.sidebar',
      '.ad', '.ads', '.advertisement', '.popup', '.modal',
      '[role="alert"]', '[role="banner"]', '[role="navigation"]',
      'button', 'input', 'textarea'
    ];

    selectorsToRemove.forEach(selector => {
      const elements = doc.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });

    // 5. Extract text
    // innerText is often better than textContent as it respects hidden elements, 
    // but we fallback to textContent if needed.
    const text = (doc.body.innerText || doc.body.textContent || "").trim();

    if (text.length < 50) {
       // Heuristic: If we got very little text, the site is likely a Single Page App (SPA)
       // that requires JavaScript to render content, which this proxy method cannot handle.
       throw new Error("Could not extract enough text. The site might block scrapers or requires JavaScript to load content.");
    }

    // Clean up whitespace: replace multiple spaces/newlines with single space
    return text.replace(/\s+/g, ' ').trim();

  } catch (error: any) {
    console.error("Error fetching URL:", error);
    
    if (error.name === 'AbortError') {
      throw new Error("Request timed out. The website took too long to respond.");
    }
    
    // If it's a TypeError here (after the initial URL check), it's likely a network failure (CORS/DNS), not a bad URL string
    if (error instanceof TypeError && error.message.includes('fetch')) {
       throw new Error("Network error. The proxy could not reach the website or the connection failed.");
    }

    throw new Error(error.message || "Could not fetch content.");
  }
}