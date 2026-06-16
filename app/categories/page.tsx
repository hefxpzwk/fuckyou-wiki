import Link from "next/link";
import Image from "next/image";
import { getAllEntries, getCategories } from "@/lib/wiki";

export const metadata = {
  title: "분류 | Fuckyou Wiki"
};

export default async function CategoriesPage() {
  const entries = await getAllEntries();
  const categories = getCategories(entries);

  return (
    <main className="page-shell">
      <section className="page-title">
        <p className="eyebrow">categories</p>
        <h1>분류</h1>
        <p>항목이 늘어나도 카테고리는 문서 frontmatter에서 자동 집계됩니다.</p>
      </section>

      <section className="category-grid" aria-label="분류 목록">
        {categories.map((category) => {
          const categoryEntries = entries.filter((entry) => entry.category === category);
          return (
            <div className="category-panel" key={category}>
              <h2>{category}</h2>
              <p>{categoryEntries.length}개 항목</p>
              <div className="category-links">
                {categoryEntries.map((entry) => (
                  <Link className="category-entry-link" href={`/wiki/${entry.slug}`} key={entry.slug}>
                    <span className="category-entry-thumb" aria-hidden="true">
                      <Image src={entry.thumbnail} alt="" fill sizes="48px" />
                    </span>
                    <span>{entry.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}
