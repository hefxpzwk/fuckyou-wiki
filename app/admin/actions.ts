"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearAdminSession, createAdminSession, requireAdmin } from "@/lib/admin-auth";
import { approveContributionRequest, getContributionRequest, getEntryBySlug, rejectContributionRequest } from "@/lib/wiki";
import { getStringList, getText, normalizeSeverity, requireText } from "@/lib/form-utils";
import { preserveMarkdownImages, stripMarkdownImages } from "@/lib/markdown-sanitize";

export async function loginAdmin(formData: FormData) {
  try {
    await createAdminSession(requireText(formData, "idToken", "로그인 토큰"));
  } catch {
    redirect("/login?adminError=1");
  }
  redirect("/admin/contributions");
}

export async function logoutAdmin() {
  await clearAdminSession();
  redirect("/login");
}

export async function approveContribution(formData: FormData) {
  const admin = await requireAdmin();

  const id = getText(formData, "id");
  const contribution = await getContributionRequest(id);
  const targetSlug = contribution?.type === "create" ? contribution.proposedSlug : contribution?.targetSlug;
  const existingEntry = targetSlug ? await getEntryBySlug(targetSlug) : null;
  const rawContent = requireText(formData, "content", "본문");
  const content = existingEntry ? preserveMarkdownImages(existingEntry.content, rawContent) : stripMarkdownImages(rawContent);
  const slug = await approveContributionRequest(id, admin.uid, {
    title: requireText(formData, "title", "제목"),
    summary: requireText(formData, "summary", "요약"),
    category: requireText(formData, "category", "분류"),
    tags: getStringList(formData, "tags"),
    aliases: getStringList(formData, "aliases"),
    severity: normalizeSeverity(getText(formData, "severity")),
    thumbnail: getText(formData, "thumbnail") || "/images/wiki-cover.png",
    related: getStringList(formData, "related"),
    content
  });

  revalidatePath("/");
  revalidatePath("/wiki");
  revalidatePath("/categories");
  revalidatePath(`/wiki/${slug}`);
  redirect(`/wiki/${slug}`);
}

export async function rejectContribution(formData: FormData) {
  const admin = await requireAdmin();

  const id = getText(formData, "id");
  await rejectContributionRequest(id, admin.uid, getText(formData, "rejectionReason"));
  revalidatePath("/admin/contributions");
  redirect("/admin/contributions");
}
