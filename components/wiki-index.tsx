"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import type { WikiEntryMeta } from "@/lib/wiki";

type WikiIndexProps = {
  entries: WikiEntryMeta[];
  compact?: boolean;
};

export function WikiIndex({ entries, compact = false }: WikiIndexProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const categories = useMemo(
    () => Array.from(new Set(entries.map((entry) => entry.category))).sort((a, b) => a.localeCompare(b, "ko")),
    [entries]
  );

  const filteredEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return entries.filter((entry) => {
      const matchesCategory = category === "all" || entry.category === category;
      const searchable = [entry.title, entry.summary, entry.category, ...entry.tags, ...entry.aliases]
        .join(" ")
        .toLowerCase();
      return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [category, entries, query]);

  return (
    <section className="wiki-index" id="search">
      {!compact ? (
        <div className="filter-bar">
          <label className="search-box">
            <span className="sr-only">항목 검색</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="제목, 태그, 요약 검색"
              type="search"
            />
          </label>
          <div className="category-tabs" aria-label="분류 필터">
            <button className={category === "all" ? "active" : ""} onClick={() => setCategory("all")} type="button">
              전체
            </button>
            {categories.map((item) => (
              <button className={category === item ? "active" : ""} key={item} onClick={() => setCategory(item)} type="button">
                {item}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="entry-grid">
        {filteredEntries.map((entry) => (
          <Link className="entry-card" href={`/wiki/${entry.slug}`} key={entry.slug}>
            <span className="entry-thumb" aria-hidden="true">
              <Image src={entry.thumbnail} alt="" fill sizes="96px" />
            </span>
            <span className="entry-content">
              <span className="entry-category">{entry.category}</span>
              <strong>{entry.title}</strong>
              <span>{entry.summary}</span>
              <span className="tag-row">
                {entry.tags.slice(0, 4).map((tag) => (
                  <em key={tag}>{tag}</em>
                ))}
              </span>
            </span>
          </Link>
        ))}
      </div>

      {filteredEntries.length === 0 ? <p className="empty-state">조건에 맞는 항목이 없습니다.</p> : null}
    </section>
  );
}
