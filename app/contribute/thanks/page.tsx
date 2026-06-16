import Link from "next/link";

export const metadata = {
  title: "제안 접수 | Fuckyou Wiki"
};

export default function ContributionThanksPage() {
  return (
    <main className="page-shell">
      <section className="page-title">
        <p className="eyebrow">received</p>
        <h1>제안이 접수되었습니다</h1>
        <p>관리자가 내용을 검토한 뒤 승인하면 위키 문서에 반영됩니다.</p>
        <p>
          <Link className="primary-link fit-link" href="/wiki">항목 목록으로 이동</Link>
        </p>
      </section>
    </main>
  );
}
