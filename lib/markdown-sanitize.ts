export function stripMarkdownImages(markdown: string) {
  return markdown
    .split("\n")
    .filter((line) => !line.trim().match(/^!\[[^\]]*]\([^)]+\)\s*$/))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function getMarkdownImageLines(markdown: string) {
  return markdown
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.match(/^!\[[^\]]*]\([^)]+\)\s*$/));
}

export function preserveMarkdownImages(original: string, next: string) {
  const imageLines = getMarkdownImageLines(original);

  if (imageLines.length === 0) {
    return stripMarkdownImages(next);
  }

  const sanitizedNext = stripMarkdownImages(next);
  const lines = sanitizedNext.split("\n");
  const firstHeadingIndex = lines.findIndex((line) => line.trim().startsWith("## "));
  const insertAt = firstHeadingIndex === -1 ? 0 : firstHeadingIndex;
  const nextLines = [...lines.slice(0, insertAt), ...imageLines, "", ...lines.slice(insertAt)];

  return nextLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
