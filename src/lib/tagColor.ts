import type { Tag } from "../types/posts";

const tagColorPalette = [
  "#ef4444",
  "#8b5cf6",
  "#c084fc",
  "#f97316",
  "#14b8a6",
  "#0ea5e9",
  "#f59e0b",
  "#ec4899",
  "#22c55e",
  "#3b82f6",
  "#7c3aed",
  "#f43f5e",
];

export function getTagColor(tag: Tag) {
  if (tag.color) return tag.color;

  const normalized = tag.name.trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < normalized.length; i += 1) {
    hash = (hash * 31 + normalized.charCodeAt(i)) >>> 0;
  }

  return tagColorPalette[hash % tagColorPalette.length];
}
