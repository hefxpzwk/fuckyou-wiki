import { WikiIndex } from "@/components/wiki-index";
import { getAllEntries } from "@/lib/wiki";

export const metadata = {
  title: "항목 | Fuckyou Wiki"
};

export default function WikiPage() {
  const entries = getAllEntries();

  return (
    <main className="page-shell">
      <section className="page-title">
        <p className="eyebrow">all entries</p>
        <h1>위키 항목</h1>
        <p>제목, 요약, 태그, 분류로 검색하고 원하는 항목의 상세 설명으로 들어갈 수 있습니다.</p>
      </section>
      <WikiIndex entries={entries} />
    </main>
  );
}
