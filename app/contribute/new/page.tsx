import { ContributionForm } from "@/components/contribution-form";

export const metadata = {
  title: "새 뻐뀨 제안 | Fuckyou Wiki"
};

export default function NewContributionPage() {
  return (
    <main className="page-shell">
      <section className="page-title">
        <p className="eyebrow">contribute</p>
        <h1>새 뻐뀨 제안</h1>
        <p>Google 로그인 후 제출할 수 있고, 기본 닉네임은 Google 이름이지만 제출 전에 바꿀 수 있습니다.</p>
      </section>

      <section className="process-strip" aria-label="제안 처리 과정">
        <span>작성</span>
        <span>관리자 검토</span>
        <span>필요 부분 반영</span>
        <span>문서 공개</span>
      </section>

      <ContributionForm type="create" />
    </main>
  );
}
