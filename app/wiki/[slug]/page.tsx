import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { getAllEntries, getEntryBySlug } from "@/lib/wiki";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllEntries().map((entry) => ({
    slug: entry.slug
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = getEntryBySlug(slug);

  if (!entry) {
    return {
      title: "항목 없음 | Fuckyou Wiki"
    };
  }

  return {
    title: `${entry.title} | Fuckyou Wiki`,
    description: entry.summary,
    openGraph: {
      title: entry.title,
      description: entry.summary,
      images: [entry.thumbnail]
    }
  };
}

export default async function EntryPage({ params }: Props) {
  const { slug } = await params;
  const entry = getEntryBySlug(slug);

  if (!entry) {
    notFound();
  }

  const headings = getHeadings(entry.content);
  let headingIndex = 0;
  const markdownComponents: Components = {
    h2({ children }) {
      const heading = headings[headingIndex++];
      return <h2 id={heading?.id}>{children}</h2>;
    },
    h3({ children }) {
      const heading = headings[headingIndex++];
      return <h3 id={heading?.id}>{children}</h3>;
    }
  };

  return (
    <main className="article-shell">
      <Link className="back-link" href="/wiki">항목 목록</Link>

      <div className="article-layout">
        <article className="wiki-article">
          <header className="article-header">
            <div>
              <p className="eyebrow">{entry.category}</p>
              <h1>{entry.title}</h1>
              <p>{entry.summary}</p>
            </div>
          </header>

          <div className="article-meta" aria-label="항목 정보">
            <span>태그: {entry.tags.join(", ")}</span>
            <span>업데이트: {entry.updatedAt}</span>
          </div>

          <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>{entry.content}</ReactMarkdown>

          {entry.related.length > 0 ? (
            <section className="related-block" aria-labelledby="related-title">
              <h2 id="related-title">관련 항목</h2>
              <div className="related-list">
                {entry.related.map((relatedSlug) => {
                  const related = getEntryBySlug(relatedSlug);
                  return related ? (
                    <Link key={related.slug} href={`/wiki/${related.slug}`}>
                      {related.title}
                    </Link>
                  ) : null;
                })}
              </div>
            </section>
          ) : null}
        </article>

        {headings.length > 0 ? (
          <aside className="quick-nav" aria-labelledby="quick-nav-title">
            <strong id="quick-nav-title">빠른 이동</strong>
            <ol>
              {headings.map((heading) => (
                <li className={`depth-${heading.depth}`} key={heading.id}>
                  <a href={`#${heading.id}`}>{heading.title}</a>
                </li>
              ))}
            </ol>
          </aside>
        ) : null}
      </div>
    </main>
  );
}

function getHeadings(content: string) {
  const seen = new Map<string, number>();

  return Array.from(content.matchAll(/^(#{2,3})\s+(.+)$/gm)).map((match) => {
    const title = match[2].replace(/[*_`[\]]/g, "").trim();
    const baseId = toHeadingId(title);
    const count = seen.get(baseId) ?? 0;
    seen.set(baseId, count + 1);

    return {
      depth: match[1].length,
      id: count === 0 ? baseId : `${baseId}-${count + 1}`,
      title
    };
  });
}

function toHeadingId(title: string) {
  return encodeURIComponent(
    title
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .trim()
      .replace(/\s+/g, "-")
  );
}
