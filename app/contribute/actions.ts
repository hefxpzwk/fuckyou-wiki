"use server";

import { redirect } from "next/navigation";
import { verifyFirebaseIdToken } from "@/lib/firebase-admin";
import { createContributionRequest, ensureUserProfile, getEntryBySlug, normalizeSlug } from "@/lib/wiki";
import { getBoolean, getStringList, getText, normalizeSeverity, requireText } from "@/lib/form-utils";
import { stripMarkdownImages } from "@/lib/markdown-sanitize";

export async function submitContribution(formData: FormData) {
  if (getText(formData, "website")) {
    redirect("/contribute/thanks");
  }

  const type = getText(formData, "type") === "edit" ? "edit" : "create";
  const targetSlug = getText(formData, "targetSlug") || null;
  const title = requireText(formData, "title", "제목");
  const idToken = requireText(formData, "idToken", "로그인 토큰");
  const user = await verifyFirebaseIdToken(idToken);
  const existingEntry = targetSlug ? await getEntryBySlug(targetSlug) : null;

  const profile = await ensureUserProfile({
    uid: user.uid,
    email: user.email ?? null,
    displayName: user.name ?? null
  });

  await createContributionRequest({
    type,
    targetSlug,
    contributorUid: user.uid,
    contributorName: profile.nickname,
    contributorEmail: user.email ?? null,
    proposedSlug: type === "create" ? normalizeSlug(getText(formData, "slug") || title) : targetSlug,
    proposedTitle: title,
    proposedSummary: requireText(formData, "summary", "요약"),
    proposedCategory: requireText(formData, "category", "분류"),
    proposedTags: getStringList(formData, "tags"),
    proposedAliases: getStringList(formData, "aliases"),
    proposedSeverity: normalizeSeverity(getText(formData, "severity")),
    proposedThumbnail: existingEntry?.thumbnail ?? "/images/wiki-cover.png",
    proposedRelated: getStringList(formData, "related"),
    proposedContent: stripMarkdownImages(requireText(formData, "content", "본문")),
    quotePermission: getBoolean(formData, "quotePermission")
  });

  redirect("/contribute/thanks");
}
