import { IAMetadata, IASearchResult, WaybackAvailability, CDXRecord } from '../types';

export const getMockMetadata = (identifier: string): IAMetadata => ({
  created: 1625097600,
  item_size: 1024500,
  metadata: {
    identifier: identifier,
    title: `Mock Item: ${identifier}`,
    creator: "Internet Archive (Mock)",
    date: "2023-01-01",
    mediatype: "web",
    description: "This is a mock response because 'Mock Mode' is enabled or the API call failed.",
    subject: ["mock", "test", "archive"],
  },
  files: [
    { name: "main.pdf", source: "original", format: "PDF", size: "500KB" },
    { name: "data.xml", source: "metadata", format: "XML", size: "2KB" }
  ],
  files_count: 2
});

export const getMockSearchResults = (query: string, count = 10): IASearchResult[] => {
  return Array.from({ length: count }).map((_, i) => ({
    identifier: `mock-result-${query.replace(/\s+/g, '-')}-${i}`,
    title: `Result for "${query}" #${i + 1}`,
    mediatype: i % 2 === 0 ? "texts" : "image",
    date: "2023-05-20",
    downloads: Math.floor(Math.random() * 5000)
  }));
};

export const getMockAvailability = (url: string): WaybackAvailability => ({
  url,
  archived_snapshots: {
    closest: {
      available: true,
      status: "200",
      timestamp: "20231015120000",
      url: `http://web.archive.org/web/20231015120000/${url}`
    }
  }
});

export const getMockCDX = (url: string): CDXRecord[] => {
  return Array.from({ length: 15 }).map((_, i) => ({
    urlkey: url,
    timestamp: `2023${(i % 12 + 1).toString().padStart(2, '0')}01120000`,
    original: url,
    mimetype: "text/html",
    statuscode: "200",
    digest: "3I42H3S6NNFQ2MSVX7XZKYAYSCX5QBYJ",
    length: "1234"
  }));
};

export const getMockViews = (): Record<string, number> => {
  const data: Record<string, number> = {};
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0].replace(/-/g, '');
    data[key] = Math.floor(Math.random() * 100) + 20;
  }
  return data;
};