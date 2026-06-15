import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const contentDirectory = path.join(process.cwd(), "content", "fuckyous");
const fallbackThumbnail = "/images/wiki-cover.png";

export type WikiEntryMeta = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  aliases: string[];
  severity: "low" | "medium" | "high";
  thumbnail: string;
  related: string[];
  createdAt: string;
  updatedAt: string;
};

export type WikiEntry = WikiEntryMeta & {
  content: string;
};

type Frontmatter = {
  title?: string;
  summary?: string;
  category?: string;
  tags?: string[];
  aliases?: string[];
  severity?: "low" | "medium" | "high";
  thumbnail?: string;
  related?: string[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export function getAllEntries(): WikiEntryMeta[] {
  ensureContentDirectory();

  return fs
    .readdirSync(contentDirectory)
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => readEntry(fileName))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt, "ko"));
}

export function getEntryBySlug(slug: string): WikiEntry | null {
  ensureContentDirectory();

  const fileName = `${slug}.md`;
  const filePath = path.join(contentDirectory, fileName);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  return readEntry(fileName);
}

export function getCategories(entries = getAllEntries()) {
  return Array.from(new Set(entries.map((entry) => entry.category))).sort((a, b) => a.localeCompare(b, "ko"));
}

function readEntry(fileName: string): WikiEntry {
  const slug = fileName.replace(/\.md$/, "");
  const filePath = path.join(contentDirectory, fileName);
  const source = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(source);
  const frontmatter = data as Frontmatter;

  return {
    slug,
    title: frontmatter.title ?? slug,
    summary: frontmatter.summary ?? "요약을 작성해 주세요.",
    category: frontmatter.category ?? "미분류",
    tags: frontmatter.tags ?? [],
    aliases: frontmatter.aliases ?? [],
    severity: frontmatter.severity ?? "medium",
    thumbnail: frontmatter.thumbnail ?? fallbackThumbnail,
    related: frontmatter.related ?? [],
    createdAt: normalizeDate(frontmatter.createdAt),
    updatedAt: normalizeDate(frontmatter.updatedAt),
    content: content.trim()
  };
}

function normalizeDate(value: string | Date | undefined) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return value ?? "2026-06-15";
}

function ensureContentDirectory() {
  if (!fs.existsSync(contentDirectory)) {
    fs.mkdirSync(contentDirectory, { recursive: true });
  }
}
