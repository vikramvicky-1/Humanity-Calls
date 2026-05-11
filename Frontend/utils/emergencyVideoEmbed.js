/** Returns { type: 'youtube'|'cloudinary'|'url', src } for embedding */
export function parseVideoForEmbed(videoUrl) {
  if (!videoUrl || typeof videoUrl !== "string") return null;
  const u = videoUrl.trim();

  const ytMatch = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/);
  if (ytMatch) {
    return { type: "youtube", src: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0` };
  }

  if (/\.(mp4|webm|mov|mkv)(\?|$)/i.test(u) || u.includes("res.cloudinary.com") && /\/video\//.test(u)) {
    return { type: "mp4", src: u };
  }

  if (u.includes("youtube.com/embed")) {
    return { type: "youtube", src: u };
  }

  return { type: "mp4", src: u };
}
