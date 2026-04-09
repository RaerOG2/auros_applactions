export function getChatInitials(value?: string | null) {
  const safe = (value || "AU").trim();
  return safe.slice(0, 2).toUpperCase();
}

export function getAvatarGradient(seed?: string | null) {
  const safe = seed || "auros";

  const palettes = [
    ["#8a6a21", "#d4af37"],
    ["#5d5a52", "#b9b2a4"],
    ["#6f4d1f", "#e7c977"],
    ["#4c5661", "#a8b2bf"],
    ["#7b5b20", "#f0cc67"],
  ];

  const index =
    safe.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) %
    palettes.length;

  return palettes[index];
}