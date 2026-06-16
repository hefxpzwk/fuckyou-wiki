import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore, isFirebaseAdminConfigured } from "@/lib/firebase-admin";

const contentDirectory = path.join(process.cwd(), "content", "fuckyous");
const fallbackThumbnail = "/images/wiki-cover.png";
const defaultDate = "2026-06-16";

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
  contributors: string[];
  contributorUids: string[];
  createdAt: string;
  updatedAt: string;
};

export type WikiEntry = WikiEntryMeta & {
  content: string;
};

export type ContributionStatus = "pending" | "approved" | "rejected";
export type ContributionType = "create" | "edit";

export type ContributionRequest = {
  id: string;
  type: ContributionType;
  targetSlug: string | null;
  contributorUid: string;
  contributorName: string;
  contributorEmail: string | null;
  proposedSlug: string | null;
  proposedTitle: string;
  proposedSummary: string;
  proposedCategory: string;
  proposedTags: string[];
  proposedAliases: string[];
  proposedSeverity: "low" | "medium" | "high";
  proposedThumbnail: string;
  proposedRelated: string[];
  proposedContent: string;
  quotePermission: boolean;
  status: ContributionStatus;
  adminTitle: string | null;
  adminSummary: string | null;
  adminCategory: string | null;
  adminTags: string[] | null;
  adminAliases: string[] | null;
  adminSeverity: "low" | "medium" | "high" | null;
  adminThumbnail: string | null;
  adminRelated: string[] | null;
  adminContent: string | null;
  rejectionReason: string | null;
  reviewedBy: string | null;
  createdAt: string;
  reviewedAt: string | null;
};

export type ContributionInput = {
  type: ContributionType;
  targetSlug?: string | null;
  contributorUid: string;
  contributorName: string;
  contributorEmail?: string | null;
  proposedSlug?: string | null;
  proposedTitle: string;
  proposedSummary: string;
  proposedCategory: string;
  proposedTags: string[];
  proposedAliases: string[];
  proposedSeverity: "low" | "medium" | "high";
  proposedThumbnail: string;
  proposedRelated: string[];
  proposedContent: string;
  quotePermission: boolean;
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
  contributors?: string[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

type EntryDocument = {
  title?: string;
  summary?: string;
  category?: string;
  tags?: string[];
  aliases?: string[];
  severity?: "low" | "medium" | "high";
  thumbnail?: string;
  related?: string[];
  contributors?: string[];
  contributorUids?: string[];
  content?: string;
  createdAt?: string;
  updatedAt?: string;
};

type ContributionDocument = {
  type?: ContributionType;
  targetSlug?: string | null;
  contributorUid?: string;
  contributorName?: string;
  contributorEmail?: string | null;
  proposedSlug?: string | null;
  proposedTitle?: string;
  proposedSummary?: string;
  proposedCategory?: string;
  proposedTags?: string[];
  proposedAliases?: string[];
  proposedSeverity?: "low" | "medium" | "high";
  proposedThumbnail?: string;
  proposedRelated?: string[];
  proposedContent?: string;
  quotePermission?: boolean;
  status?: ContributionStatus;
  adminTitle?: string | null;
  adminSummary?: string | null;
  adminCategory?: string | null;
  adminTags?: string[] | null;
  adminAliases?: string[] | null;
  adminSeverity?: "low" | "medium" | "high" | null;
  adminThumbnail?: string | null;
  adminRelated?: string[] | null;
  adminContent?: string | null;
  rejectionReason?: string | null;
  reviewedBy?: string | null;
  createdAt?: string;
  reviewedAt?: string | null;
};

export async function getAllEntries(): Promise<WikiEntryMeta[]> {
  const entriesBySlug = new Map<string, WikiEntry>();

  for (const entry of getFileEntries()) {
    entriesBySlug.set(entry.slug, entry);
  }

  for (const entry of await getFirestoreEntries()) {
    entriesBySlug.set(entry.slug, entry);
  }

  return Array.from(entriesBySlug.values()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt, "ko"));
}

export async function getEntryBySlug(slug: string): Promise<WikiEntry | null> {
  return (await getFirestoreEntryBySlug(slug)) ?? getFileEntryBySlug(slug);
}

export function getCategories(entries: WikiEntryMeta[]) {
  return Array.from(new Set(entries.map((entry) => entry.category))).sort((a, b) => a.localeCompare(b, "ko"));
}

export async function upsertUserProfile(input: { uid: string; email?: string | null; displayName?: string | null; nickname: string }) {
  await getAdminFirestore()
    .collection("users")
    .doc(input.uid)
    .set(
      {
        uid: input.uid,
        email: input.email ?? null,
        displayName: input.displayName ?? null,
        nickname: input.nickname,
        updatedAt: today(),
        createdAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );
}

export async function ensureUserProfile(input: { uid: string; email?: string | null; displayName?: string | null }) {
  const db = getAdminFirestore();
  const userRef = db.collection("users").doc(input.uid);
  const snapshot = await userRef.get();
  const existing = snapshot.exists ? (snapshot.data() as UserDocument) : null;
  const fallbackNickname = input.displayName || input.email?.split("@")[0] || "Google 사용자";
  const nickname = normalizeNickname(existing?.nickname ?? fallbackNickname, fallbackNickname);

  await userRef.set(
    {
      uid: input.uid,
      email: input.email ?? null,
      displayName: input.displayName ?? null,
      nickname,
      updatedAt: today(),
      createdAt: existing?.createdAt ?? FieldValue.serverTimestamp()
    },
    { merge: true }
  );

  return {
    uid: input.uid,
    email: input.email ?? null,
    displayName: input.displayName ?? null,
    nickname
  };
}

export async function updateUserNickname(input: { uid: string; email?: string | null; displayName?: string | null; nickname: string }) {
  const fallbackNickname = input.displayName || input.email?.split("@")[0] || "Google 사용자";
  const nickname = normalizeNickname(input.nickname, fallbackNickname);

  await getAdminFirestore()
    .collection("users")
    .doc(input.uid)
    .set(
      {
        uid: input.uid,
        email: input.email ?? null,
        displayName: input.displayName ?? null,
        nickname,
        updatedAt: today(),
        createdAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );

  return {
    uid: input.uid,
    email: input.email ?? null,
    displayName: input.displayName ?? null,
    nickname
  };
}

export async function createContributionRequest(input: ContributionInput) {
  const now = today();

  await getAdminFirestore().collection("contributionRequests").add({
    type: input.type,
    targetSlug: input.targetSlug ?? null,
    contributorUid: input.contributorUid,
    contributorName: input.contributorName,
    contributorEmail: input.contributorEmail ?? null,
    proposedSlug: input.proposedSlug ?? null,
    proposedTitle: input.proposedTitle,
    proposedSummary: input.proposedSummary,
    proposedCategory: input.proposedCategory,
    proposedTags: input.proposedTags,
    proposedAliases: input.proposedAliases,
    proposedSeverity: input.proposedSeverity,
    proposedThumbnail: input.proposedThumbnail,
    proposedRelated: input.proposedRelated,
    proposedContent: input.proposedContent,
    quotePermission: input.quotePermission,
    status: "pending",
    adminTitle: null,
    adminSummary: null,
    adminCategory: null,
    adminTags: null,
    adminAliases: null,
    adminSeverity: null,
    adminThumbnail: null,
    adminRelated: null,
    adminContent: null,
    rejectionReason: null,
    reviewedBy: null,
    createdAt: now,
    reviewedAt: null
  });
}

export async function getContributionRequests(status?: ContributionStatus) {
  const collection = getAdminFirestore().collection("contributionRequests");
  const snapshot = status ? await collection.where("status", "==", status).get() : await collection.get();

  return snapshot.docs
    .map((document) => mapContributionDocument(document.id, document.data() as ContributionDocument))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getContributionRequest(id: string) {
  const document = await getAdminFirestore().collection("contributionRequests").doc(id).get();

  return document.exists ? mapContributionDocument(document.id, document.data() as ContributionDocument) : null;
}

export async function approveContributionRequest(
  id: string,
  reviewedBy: string,
  input: {
    title: string;
    summary: string;
    category: string;
    tags: string[];
    aliases: string[];
    severity: "low" | "medium" | "high";
    thumbnail: string;
    related: string[];
    content: string;
  }
) {
  const contribution = await getContributionRequest(id);

  if (!contribution || contribution.status !== "pending") {
    throw new Error("승인할 수 없는 제안입니다.");
  }

  const slug = contribution.type === "create" ? normalizeSlug(contribution.proposedSlug ?? input.title) : contribution.targetSlug;

  if (!slug) {
    throw new Error("문서 slug가 없습니다.");
  }

  const existing = await getEntryBySlug(slug);
  const now = today();
  const db = getAdminFirestore();

  const contributorUids = Array.from(new Set([...(existing?.contributorUids ?? []), contribution.contributorUid].filter(Boolean)));
  const contributorNames = await getNicknamesForUids(contributorUids);

  await db.collection("wikiEntries").doc(slug).set(
    {
      slug,
      title: input.title,
      summary: input.summary,
      category: input.category,
      tags: input.tags,
      aliases: input.aliases,
      severity: input.severity,
      thumbnail: input.thumbnail || fallbackThumbnail,
      related: input.related,
      contributorUids,
      contributors: contributorNames,
      content: input.content,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now
    },
    { merge: true }
  );

  await db.collection("contributionRequests").doc(id).set(
    {
      status: "approved",
      adminTitle: input.title,
      adminSummary: input.summary,
      adminCategory: input.category,
      adminTags: input.tags,
      adminAliases: input.aliases,
      adminSeverity: input.severity,
      adminThumbnail: input.thumbnail || fallbackThumbnail,
      adminRelated: input.related,
      adminContent: input.content,
      reviewedBy,
      reviewedAt: now
    },
    { merge: true }
  );

  return slug;
}

export async function rejectContributionRequest(id: string, reviewedBy: string, rejectionReason: string) {
  await getAdminFirestore()
    .collection("contributionRequests")
    .doc(id)
    .set(
      {
        status: "rejected",
        rejectionReason,
        reviewedBy,
        reviewedAt: today()
      },
      { merge: true }
    );
}

export function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function getFirestoreEntries(): Promise<WikiEntry[]> {
  if (!isFirebaseAdminConfigured()) {
    return [];
  }

  const snapshot = await getAdminFirestore().collection("wikiEntries").orderBy("updatedAt", "desc").get();

  return Promise.all(snapshot.docs.map((document) => mapEntryDocument(document.id, document.data() as EntryDocument)));
}

async function getFirestoreEntryBySlug(slug: string): Promise<WikiEntry | null> {
  if (!isFirebaseAdminConfigured()) {
    return null;
  }

  const document = await getAdminFirestore().collection("wikiEntries").doc(slug).get();

  return document.exists ? mapEntryDocument(document.id, document.data() as EntryDocument) : null;
}

function getFileEntries(): WikiEntry[] {
  ensureContentDirectory();

  return fs
    .readdirSync(contentDirectory)
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => readFileEntry(fileName));
}

function getFileEntryBySlug(slug: string): WikiEntry | null {
  ensureContentDirectory();

  const fileName = `${slug}.md`;
  const filePath = path.join(contentDirectory, fileName);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  return readFileEntry(fileName);
}

function readFileEntry(fileName: string): WikiEntry {
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
    contributors: frontmatter.contributors ?? [],
    contributorUids: [],
    createdAt: normalizeDate(frontmatter.createdAt),
    updatedAt: normalizeDate(frontmatter.updatedAt),
    content: content.trim()
  };
}

async function mapEntryDocument(slug: string, data: EntryDocument): Promise<WikiEntry> {
  const contributorUids = data.contributorUids ?? (await getContributorUidsForSlug(slug));
  const contributors = contributorUids.length > 0 ? await getNicknamesForUids(contributorUids) : data.contributors ?? [];

  return {
    slug,
    title: data.title ?? slug,
    summary: data.summary ?? "요약을 작성해 주세요.",
    category: data.category ?? "미분류",
    tags: data.tags ?? [],
    aliases: data.aliases ?? [],
    severity: data.severity ?? "medium",
    thumbnail: data.thumbnail ?? fallbackThumbnail,
    related: data.related ?? [],
    contributors,
    contributorUids,
    createdAt: data.createdAt ?? defaultDate,
    updatedAt: data.updatedAt ?? defaultDate,
    content: data.content ?? ""
  };
}

async function getContributorUidsForSlug(slug: string) {
  const snapshot = await getAdminFirestore().collection("contributionRequests").where("status", "==", "approved").get();
  const uids = snapshot.docs
    .map((document) => document.data() as ContributionDocument)
    .filter((item) => item.targetSlug === slug || item.proposedSlug === slug)
    .map((item) => item.contributorUid)
    .filter((uid): uid is string => Boolean(uid));

  return Array.from(new Set(uids));
}

type UserDocument = {
  uid?: string;
  email?: string | null;
  displayName?: string | null;
  nickname?: string;
  createdAt?: unknown;
};

async function getNicknamesForUids(uids: string[]) {
  const uniqueUids = Array.from(new Set(uids.filter(Boolean)));

  if (uniqueUids.length === 0) {
    return [];
  }

  const db = getAdminFirestore();
  const nicknames = await Promise.all(
    uniqueUids.map(async (uid) => {
      const snapshot = await db.collection("users").doc(uid).get();
      const data = snapshot.exists ? (snapshot.data() as UserDocument) : null;
      return data?.nickname || data?.displayName || data?.email?.split("@")[0] || "Google 사용자";
    })
  );

  return nicknames;
}

function normalizeNickname(value: string, fallback: string) {
  const normalized = value.replace(/\s+/g, " ").trim().slice(0, 40);
  return normalized || fallback;
}

function mapContributionDocument(id: string, data: ContributionDocument): ContributionRequest {
  return {
    id,
    type: data.type ?? "create",
    targetSlug: data.targetSlug ?? null,
    contributorUid: data.contributorUid ?? "",
    contributorName: data.contributorName ?? "익명",
    contributorEmail: data.contributorEmail ?? null,
    proposedSlug: data.proposedSlug ?? null,
    proposedTitle: data.proposedTitle ?? "",
    proposedSummary: data.proposedSummary ?? "",
    proposedCategory: data.proposedCategory ?? "미분류",
    proposedTags: data.proposedTags ?? [],
    proposedAliases: data.proposedAliases ?? [],
    proposedSeverity: data.proposedSeverity ?? "medium",
    proposedThumbnail: data.proposedThumbnail ?? fallbackThumbnail,
    proposedRelated: data.proposedRelated ?? [],
    proposedContent: data.proposedContent ?? "",
    quotePermission: data.quotePermission ?? false,
    status: data.status ?? "pending",
    adminTitle: data.adminTitle ?? null,
    adminSummary: data.adminSummary ?? null,
    adminCategory: data.adminCategory ?? null,
    adminTags: data.adminTags ?? null,
    adminAliases: data.adminAliases ?? null,
    adminSeverity: data.adminSeverity ?? null,
    adminThumbnail: data.adminThumbnail ?? null,
    adminRelated: data.adminRelated ?? null,
    adminContent: data.adminContent ?? null,
    rejectionReason: data.rejectionReason ?? null,
    reviewedBy: data.reviewedBy ?? null,
    createdAt: data.createdAt ?? defaultDate,
    reviewedAt: data.reviewedAt ?? null
  };
}

function normalizeDate(value: string | Date | undefined) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return value ?? defaultDate;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function ensureContentDirectory() {
  if (!fs.existsSync(contentDirectory)) {
    fs.mkdirSync(contentDirectory, { recursive: true });
  }
}
