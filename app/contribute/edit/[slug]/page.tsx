import { notFound } from "next/navigation";
import { ContributionForm } from "@/components/contribution-form";
import { getEntryBySlug } from "@/lib/wiki";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const entry = await getEntryBySlug(slug);

  return {
    title: entry ? `${entry.title} 수정 제안 | Fuckyou Wiki` : "수정 제안 | Fuckyou Wiki"
  };
}

export default async function EditContributionPage({ params }: Props) {
  const { slug } = await params;
  const entry = await getEntryBySlug(slug);

  if (!entry) {
    notFound();
  }

  return (
    <main className="page-shell">
      <section className="page-title">
        <p className="eyebrow">edit request</p>
        <h1>{entry.title} 수정 제안</h1>
        <p>원하는 부분만 고쳐 제출하세요. 관리자는 바뀐 섹션만 확인하고 필요한 부분만 문서에 반영합니다.</p>
      </section>

      <section className="process-strip" aria-label="수정 요청 처리 과정">
        <span>원문 수정</span>
        <span>변경 섹션 검토</span>
        <span>필요 부분 적용</span>
        <span>최종 승인</span>
      </section>

      <ContributionForm type="edit" entry={entry} />
    </main>
  );
}
