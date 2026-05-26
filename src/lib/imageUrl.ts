// Normalize image URLs. Google Drive "share" links don't work as <img src>,
// so convert them to a direct thumbnail URL that browsers can load.
export function resolveImageUrl(url?: string | null): string {
  if (!url) return "";
  const u = url.trim();
  if (!u) return "";

  // Match common Google Drive URL shapes and extract the file id.
  // - https://drive.google.com/file/d/{ID}/view?...
  // - https://drive.google.com/open?id={ID}
  // - https://drive.google.com/uc?id={ID}&export=...
  // - https://drive.google.com/thumbnail?id={ID}
  // - https://docs.google.com/uc?id={ID}
  let id: string | null = null;

  const fileMatch = u.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]{10,})/);
  if (fileMatch) id = fileMatch[1];

  if (!id) {
    const qMatch = u.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
    if (qMatch && /google\.com/.test(u)) id = qMatch[1];
  }

  if (id) {
    return `https://drive.google.com/thumbnail?id=${id}&sz=w2000`;
  }

  return u;
}
