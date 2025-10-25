/* QR utilities - lightweight dummy implementations for demo/viva */

export function generateQRCodePayload(obj: unknown): string {
  try {
    return JSON.stringify(obj);
  } catch {
    return String(obj);
  }
}

export function generateQRCodeDataURL(text: string): string {
  // Very small inline SVG QR-like placeholder. Not a real QR generator.
  const safe = String(text).replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'>\n  <rect width='200' height='200' fill='#fff'/>\n  <text x='10' y='20' font-size='12' fill='#000'>${safe}</text>\n  <rect x='20' y='30' width='40' height='40' fill='#000'/>\n  <rect x='140' y='30' width='40' height='40' fill='#000'/>\n  <rect x='20' y='130' width='40' height='40' fill='#000'/>\n</svg>`;
  const base64 = Buffer.from(svg).toString("base64");
  return `data:image/svg+xml;base64,${base64}`;
}
