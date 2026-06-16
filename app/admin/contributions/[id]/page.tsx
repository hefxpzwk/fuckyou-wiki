import Link from "next/link";
import { notFound } from "next/navigation";
import { approveContribution, rejectContribution } from "@/app/admin/actions";
import { AdminContributionReview } from "@/components/admin-contribution-review";
import { requireAdmin } from "@/lib/admin-auth";
import { getContributionRequest, getEntryBySlug } from "@/lib/wiki";

type Props = {
  params: Promise<{ id: string }>;
};

export const metadata = {
  title: "기여 상세 검토 | Fuckyou Wiki"
};

export default async function AdminContributionDetailPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const contribution = await getContributionRequest(id);

  if (!contribution) {
    notFound();
  }

  const existingEntry = contribution.targetSlug ? await getEntryBySlug(contribution.targetSlug) : null;

  return (
    <main className="page-shell">
      <Link className="back-link" href="/admin/contributions">검토 목록</Link>

      <section className="page-title">
        <p className="eyebrow">{contribution.type === "create" ? "new entry" : "edit request"}</p>
        <h1>{contribution.proposedTitle}</h1>
        <p>
          {contribution.contributorName} · {contribution.createdAt} ·{" "}
          {contribution.quotePermission ? "인용/수정 허용" : "인용/수정 동의 없음"}
        </p>
      </section>

      <AdminContributionReview contribution={contribution} existingEntry={existingEntry} approveAction={approveContribution} />

      <section className="content-section">
        <h2>거절</h2>
        <form className="stacked-form" action={rejectContribution}>
          <input type="hidden" name="id" value={contribution.id} />
          <label>
            거절 사유
            <textarea name="rejectionReason" rows={3} />
          </label>
          <button className="danger-button" type="submit">거절</button>
        </form>
      </section>
    </main>
  );
}
