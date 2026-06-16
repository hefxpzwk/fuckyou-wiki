import Link from "next/link";
import { logoutAdmin } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin-auth";
import { getContributionRequests } from "@/lib/wiki";

export const metadata = {
  title: "기여 검토 | Fuckyou Wiki"
};

export default async function AdminContributionsPage() {
  await requireAdmin();
  const contributions = await getContributionRequests("pending");

  return (
    <main className="page-shell">
      <section className="page-title admin-title-row">
        <div>
          <p className="eyebrow">admin</p>
          <h1>기여 검토</h1>
          <p>대기 중인 제안을 확인하고 승인 또는 거절합니다.</p>
        </div>
        <form action={logoutAdmin}>
          <button className="secondary-button" type="submit">로그아웃</button>
        </form>
      </section>

      <section className="review-list" aria-label="대기 중인 기여 제안">
        {contributions.length === 0 ? <p className="empty-state">검토할 제안이 없습니다.</p> : null}
        {contributions.map((item) => (
          <Link className="review-item" href={`/admin/contributions/${item.id}`} key={item.id}>
            <span className="entry-category">{item.type === "create" ? "새 문서" : `수정: ${item.targetSlug}`}</span>
            <strong>{item.proposedTitle}</strong>
            <span>{item.proposedSummary}</span>
            <span className="tag-row">
              <em>{item.contributorName}</em>
              <em>{item.createdAt}</em>
            </span>
          </Link>
        ))}
      </section>
    </main>
  );
}
