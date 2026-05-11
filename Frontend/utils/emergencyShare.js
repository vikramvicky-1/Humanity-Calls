/** Build social share URLs for the current origin + path */
export function buildEmergencyShareUrls({ pageUrl, title, summary }) {
  const enc = encodeURIComponent;
  const text = summary ? `${title} — ${summary}` : title;
  const combined = `${text}\n${pageUrl}`;
  return {
    whatsapp: `https://wa.me/?text=${enc(combined)}`,
    twitter: `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(pageUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${enc(pageUrl)}`,
    telegram: `https://t.me/share/url?url=${enc(pageUrl)}&text=${enc(text)}`,
  };
}

export async function copyEmergencyLink(url) {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}
