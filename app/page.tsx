import Link from "next/link";
import { getAllEntries, getCategories } from "@/lib/wiki";
import { WikiIndex } from "@/components/wiki-index";

export default async function HomePage() {
  const entries = await getAllEntries();
  const categories = getCategories(entries);

  return (
    <main className="page-shell">
      <section className="page-title">
        <h1>Fuckyou Wiki</h1>
        <p>Fuckyou들을 종류별로 정리하는 위키입니다.</p>
        <p>
          현재 <Link href="/wiki">{entries.length}개 항목</Link>과 <Link href="/categories">{categories.length}개 분류</Link>가 있습니다.
        </p>
        <p>
          <Link className="primary-link fit-link" href="/contribute/new">새 뻐뀨 제안하기</Link>
        </p>
      </section>

      <section className="content-section">
        <h2>최근 항목</h2>
        <WikiIndex entries={entries.slice(0, 8)} compact />
      </section>
    </main>
  );
}
