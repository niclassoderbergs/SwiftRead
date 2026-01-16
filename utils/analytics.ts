// Simple analytics system using LocalStorage to simulate a backend database

export interface ReadSession {
  id: string;
  timestamp: number;
  wordCount: number;
  wpm: number;
  country: string;
  countryCode: string;
}

export interface AnalyticsSummary {
  uniqueUsers: number;
  totalTextsRead: number;
  avgWordCount: number;
  medianWordCount: number;
  sessions: ReadSession[];
  topCountries: { [key: string]: number };
}

const STORAGE_KEY = 'swiftread_analytics_v1';
const USER_ID_KEY = 'swiftread_user_id';

// Generate a random ID
const uuid = () => Math.random().toString(36).substring(2, 15);

// Get or create a persistent User ID for this browser
export const getUserId = (): string => {
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = uuid();
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
};

// Seed some fake data so the dashboard looks interesting immediately
const seedFakeData = () => {
  if (localStorage.getItem(STORAGE_KEY)) return;

  const fakeSessions: ReadSession[] = [];
  const countries = [
    { name: 'Sweden', code: 'SE' },
    { name: 'United States', code: 'US' },
    { name: 'Germany', code: 'DE' },
    { name: 'Norway', code: 'NO' },
    { name: 'United Kingdom', code: 'GB' }
  ];

  // Generate 50 fake sessions
  for (let i = 0; i < 50; i++) {
    const randomCountry = countries[Math.floor(Math.random() * countries.length)];
    fakeSessions.push({
      id: uuid(),
      timestamp: Date.now() - Math.floor(Math.random() * 1000000000),
      wordCount: Math.floor(Math.random() * 2000) + 100, // 100 to 2100 words
      wpm: Math.floor(Math.random() * 400) + 300,
      country: randomCountry.name,
      countryCode: randomCountry.code
    });
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(fakeSessions));
};

// Initialize
seedFakeData();

export const logReadSession = async (wordCount: number, wpm: number) => {
  // 1. Fetch Location (Best effort)
  let country = 'Unknown';
  let countryCode = 'UN';

  try {
    const res = await fetch('https://ipapi.co/json/');
    if (res.ok) {
      const data = await res.json();
      country = data.country_name || 'Unknown';
      countryCode = data.country_code || 'UN';
    }
  } catch (e) {
    console.warn("Could not fetch location data");
  }

  // 2. Create Session Object
  const newSession: ReadSession = {
    id: uuid(),
    timestamp: Date.now(),
    wordCount,
    wpm,
    country,
    countryCode
  };

  // 3. Save to Local Storage
  const existingData = localStorage.getItem(STORAGE_KEY);
  const sessions: ReadSession[] = existingData ? JSON.parse(existingData) : [];
  sessions.unshift(newSession); // Add to top
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
};

export const getAnalytics = (): AnalyticsSummary => {
  const data = localStorage.getItem(STORAGE_KEY);
  const sessions: ReadSession[] = data ? JSON.parse(data) : [];

  // Calculate Stats
  const totalTextsRead = sessions.length;
  
  // Unique users is tricky without a backend, we simulated it by assuming 
  // the fake data comes from different users, plus the current user.
  // In a real app, we would count distinct userIds.
  // For this demo, we'll calculate based on a multiplier of sessions to simulate traffic.
  const uniqueUsers = Math.floor(sessions.length * 0.4) + 1; 

  const wordCounts = sessions.map(s => s.wordCount).sort((a, b) => a - b);
  const totalWords = wordCounts.reduce((a, b) => a + b, 0);
  const avgWordCount = totalTextsRead > 0 ? Math.round(totalWords / totalTextsRead) : 0;
  
  let medianWordCount = 0;
  if (wordCounts.length > 0) {
    const mid = Math.floor(wordCounts.length / 2);
    medianWordCount = wordCounts.length % 2 !== 0 ? wordCounts[mid] : (wordCounts[mid - 1] + wordCounts[mid]) / 2;
  }

  const topCountries: { [key: string]: number } = {};
  sessions.forEach(s => {
    topCountries[s.country] = (topCountries[s.country] || 0) + 1;
  });

  return {
    uniqueUsers,
    totalTextsRead,
    avgWordCount,
    medianWordCount,
    sessions,
    topCountries
  };
};

export const clearAnalytics = () => {
    localStorage.removeItem(STORAGE_KEY);
    seedFakeData();
}