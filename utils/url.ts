interface ProxyStrategy {
  name: string;
  getUrl: (target: string) => string;
  extractContent: (response: Response) => Promise<string>;
}

// List of CORS proxies to try in order
const PROXIES: ProxyStrategy[] = [
  {
    name: "AllOrigins",
    getUrl: (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}&t=${Date.now()}`,
    extractContent: async (res) => {
      const data = await res.json();
      if (!data.contents) throw new Error("No content returned from proxy");
      return data.contents;
    }
  },
  {
    name: "CorsProxy",
    getUrl: (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    extractContent: async (res) => await res.text()
  }
];

export async function fetchTextFromUrl(url: string): Promise<string> {
  // 1. Validate URL format
  try {
    new URL(url);
  } catch (e) {
    throw new Error("Invalid URL format. Please include https://");
  }

  let lastError: Error | null = null;

  // 2. Try proxies sequentially
  for (const proxy of PROXIES) {
    try {
      console.log(`Attempting fetch via ${proxy.name}...`);
      const proxyUrl = proxy.getUrl(url);

      // Setup timeout (15 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(proxyUrl, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const htmlContent = await proxy.extractContent(response);
      
      if (!htmlContent || htmlContent.length < 50) {
        throw new Error("Received empty or too short content");
      }

      // 3. Process the content if successful
      return processHtmlContent(htmlContent);

    } catch (error: any) {
      console.warn(`Proxy ${proxy.name} failed:`, error);
      lastError = error;
      
      // Try next proxy
      continue;
    }
  }

  // 4. Handle final failure
  console.error("All proxies failed.");
  const errorMessage = lastError?.message || "Unknown error";
  
  if (errorMessage.includes("NetworkError") || errorMessage.includes("fetch") || errorMessage.includes("Failed to fetch")) {
     throw new Error("Network error. Could not connect to the website via any proxy. The site might be blocking access or you may have an adblocker preventing the connection.");
  }
  
  throw new Error(`Could not fetch content: ${errorMessage}`);
}

function processHtmlContent(htmlContent: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');

  // Remove clutter
  const selectorsToRemove = [
    'script', 'style', 'noscript', 'iframe', 'svg',
    'nav', 'footer', 'header', 'aside', 'form',
    '.nav', '.footer', '.header', '.menu', '#menu', '.sidebar',
    '.ad', '.ads', '.advertisement', '.popup', '.modal',
    '[role="alert"]', '[role="banner"]', '[role="navigation"]',
    'button', 'input', 'textarea', 'link'
  ];

  selectorsToRemove.forEach(selector => {
    const elements = doc.querySelectorAll(selector);
    elements.forEach(el => el.remove());
  });

  // Extract text
  // Fallback to textContent if body is null
  const text = (doc.body?.innerText || doc.body?.textContent || "").trim();

  if (text.length < 50) {
     throw new Error("Could not extract enough text. The site might be using complex JavaScript rendering.");
  }

  // Clean up whitespace
  return text.replace(/\s+/g, ' ').trim();
}