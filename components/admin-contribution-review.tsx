"use client";

import { useMemo, useState } from "react";
import type { ContributionRequest, WikiEntry } from "@/lib/wiki";

type AdminContributionReviewProps = {
  contribution: ContributionRequest;
  existingEntry: WikiEntry | null;
  approveAction: (formData: FormData) => void | Promise<void>;
};

type MarkdownSection = {
  key: string;
  title: string;
  text: string;
};

type FieldChange = {
  key: string;
  label: string;
  currentValue: string;
  proposedValue: string;
};

export function AdminContributionReview({ contribution, existingEntry, approveAction }: AdminContributionReviewProps) {
  const baseContent = existingEntry?.content ?? "";
  const proposedContent = contribution.proposedContent;
  const [title, setTitle] = useState(existingEntry?.title ?? contribution.proposedTitle);
  const [summary, setSummary] = useState(existingEntry?.summary ?? contribution.proposedSummary);
  const [category, setCategory] = useState(existingEntry?.category ?? contribution.proposedCategory);
  const [severity, setSeverity] = useState(existingEntry?.severity ?? contribution.proposedSeverity);
  const [tags, setTags] = useState((existingEntry?.tags ?? contribution.proposedTags).join(", "));
  const [aliases, setAliases] = useState((existingEntry?.aliases ?? contribution.proposedAliases).join(", "));
  const [thumbnail, setThumbnail] = useState(existingEntry?.thumbnail ?? contribution.proposedThumbnail);
  const [related, setRelated] = useState((existingEntry?.related ?? contribution.proposedRelated).join(", "));
  const [content, setContent] = useState(existingEntry ? baseContent : proposedContent);
  const [appliedKeys, setAppliedKeys] = useState<string[]>([]);

  const fieldChanges: FieldChange[] = [
    {
      key: "title",
      label: "제목",
      currentValue: existingEntry?.title ?? "",
      proposedValue: contribution.proposedTitle
    },
    {
      key: "summary",
      label: "요약",
      currentValue: existingEntry?.summary ?? "",
      proposedValue: contribution.proposedSummary
    },
    {
      key: "category",
      label: "분류",
      currentValue: existingEntry?.category ?? "",
      proposedValue: contribution.proposedCategory
    },
    {
      key: "severity",
      label: "강도",
      currentValue: existingEntry?.severity ?? "",
      proposedValue: contribution.proposedSeverity
    },
    {
      key: "tags",
      label: "태그",
      currentValue: existingEntry?.tags.join(", ") ?? "",
      proposedValue: contribution.proposedTags.join(", ")
    },
    {
      key: "aliases",
      label: "별칭",
      currentValue: existingEntry?.aliases.join(", ") ?? "",
      proposedValue: contribution.proposedAliases.join(", ")
    },
    {
      key: "related",
      label: "관련 항목",
      currentValue: existingEntry?.related.join(", ") ?? "",
      proposedValue: contribution.proposedRelated.join(", ")
    }
  ].filter((field) => normalizeValue(field.currentValue) !== normalizeValue(field.proposedValue));

  const changedSections = useMemo(() => {
    const originalSections = new Map(parseMarkdownSections(baseContent).map((section) => [section.key, section]));

    return parseMarkdownSections(proposedContent)
      .map((proposed) => ({
        proposed,
        original: originalSections.get(proposed.key) ?? null
      }))
      .filter(({ original, proposed }) => !original || normalizeValue(original.text) !== normalizeValue(proposed.text));
  }, [baseContent, proposedContent]);

  function applyField(key: string, value: string) {
    if (key === "title") setTitle(value);
    if (key === "summary") setSummary(value);
    if (key === "category") setCategory(value);
    if (key === "severity" && (value === "low" || value === "medium" || value === "high")) setSeverity(value);
    if (key === "tags") setTags(value);
    if (key === "aliases") setAliases(value);
    if (key === "related") setRelated(value);
    setAppliedKeys((current) => (current.includes(key) ? current : [...current, key]));
  }

  function applySection(section: MarkdownSection) {
    setContent((current) => applyMarkdownSection(current, section));
    setAppliedKeys((current) => (current.includes(section.key) ? current : [...current, section.key]));
  }

  return (
    <section className="content-section">
      <div className="review-toolbar">
        <div>
          <h2>수정 요청 항목 검토</h2>
          <p>왼쪽 값이 승인 시 그대로 반영됩니다. 오른쪽 수정안을 적용하지 않아도 현재 왼쪽 값으로 승인할 수 있습니다.</p>
        </div>
        <div className="review-counts" aria-label="검토 상태">
          <span>{fieldChanges.length + changedSections.length}개 수정안</span>
          <span>{appliedKeys.length}개 적용</span>
        </div>
      </div>

      <form className="stacked-form approval-form item-review-form" action={approveAction}>
        <input type="hidden" name="id" value={contribution.id} />

        <section className="review-item-list" aria-label="문서 정보 수정안">
          <ReviewFieldRow
            label="제목"
            name="title"
            value={title}
            onChange={setTitle}
            change={fieldChanges.find((field) => field.key === "title")}
            applied={appliedKeys.includes("title")}
            onApply={applyField}
          />
          <ReviewFieldRow
            label="요약"
            name="summary"
            value={summary}
            onChange={setSummary}
            change={fieldChanges.find((field) => field.key === "summary")}
            applied={appliedKeys.includes("summary")}
            onApply={applyField}
            multiline
          />
          <ReviewFieldRow
            label="분류"
            name="category"
            value={category}
            onChange={setCategory}
            change={fieldChanges.find((field) => field.key === "category")}
            applied={appliedKeys.includes("category")}
            onApply={applyField}
          />

          <div className="review-row">
            <div className="review-final-field">
              <strong>강도</strong>
              <select name="severity" value={severity} onChange={(event) => setSeverity(event.target.value as typeof severity)}>
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </select>
            </div>
            <ReviewSuggestion
              change={fieldChanges.find((field) => field.key === "severity")}
              applied={appliedKeys.includes("severity")}
              onApply={applyField}
            />
          </div>

          <ReviewFieldRow
            label="태그"
            name="tags"
            value={tags}
            onChange={setTags}
            change={fieldChanges.find((field) => field.key === "tags")}
            applied={appliedKeys.includes("tags")}
            onApply={applyField}
          />
          <ReviewFieldRow
            label="별칭"
            name="aliases"
            value={aliases}
            onChange={setAliases}
            change={fieldChanges.find((field) => field.key === "aliases")}
            applied={appliedKeys.includes("aliases")}
            onApply={applyField}
          />

          <div className="review-row">
            <div className="review-final-field">
              <strong>대표 이미지</strong>
              <input name="thumbnail" value={thumbnail} onChange={(event) => setThumbnail(event.target.value)} />
            </div>
            <div className="review-suggestion muted-suggestion">
              이미지는 사용자 수정 대상이 아닙니다.
            </div>
          </div>

          <ReviewFieldRow
            label="관련 항목"
            name="related"
            value={related}
            onChange={setRelated}
            change={fieldChanges.find((field) => field.key === "related")}
            applied={appliedKeys.includes("related")}
            onApply={applyField}
          />
        </section>

        <div className="review-row body-review-row">
          <label className="review-final-field">
            <strong>본문</strong>
            <textarea name="content" required rows={24} value={content} onChange={(event) => setContent(event.target.value)} />
          </label>
          <div className="review-suggestion body-suggestion-list">
            <div className="suggestion-header">
              <span>사용자 본문 수정안</span>
              <span>{changedSections.length}개</span>
            </div>
            {changedSections.length === 0 ? <p className="empty-state">본문 섹션 수정안이 없습니다.</p> : null}
            {changedSections.map(({ original, proposed }) => (
              <article className="section-suggestion" key={proposed.key}>
                <div className="suggestion-header">
                  <span>{original ? proposed.title : `${proposed.title} (새 섹션)`}</span>
                  <div className="button-row">
                    {appliedKeys.includes(proposed.key) ? <span className="status-pill">적용됨</span> : null}
                    <button className="secondary-button" type="button" onClick={() => applySection(proposed)}>
                      적용
                    </button>
                  </div>
                </div>
                <pre>{proposed.text}</pre>
              </article>
            ))}
          </div>
        </div>

        <div className="button-row">
          {existingEntry ? (
            <button className="secondary-button" type="button" onClick={() => setContent(baseContent)}>
              원문으로 되돌리기
            </button>
          ) : null}
          <button className="secondary-button" type="button" onClick={() => setContent(proposedContent)}>
            제안문 전체로 교체
          </button>
          <button className="primary-button" type="submit">승인하고 반영</button>
        </div>
      </form>
    </section>
  );
}

function ReviewFieldRow({
  label,
  name,
  value,
  onChange,
  change,
  applied,
  onApply,
  multiline = false
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  change?: FieldChange;
  applied: boolean;
  onApply: (key: string, value: string) => void;
  multiline?: boolean;
}) {
  return (
    <div className="review-row">
      <label className="review-final-field">
        <strong>{label}</strong>
        {multiline ? (
          <textarea name={name} required value={value} rows={3} onChange={(event) => onChange(event.target.value)} />
        ) : (
          <input name={name} required value={value} onChange={(event) => onChange(event.target.value)} />
        )}
      </label>
      <ReviewSuggestion change={change} applied={applied} onApply={onApply} />
    </div>
  );
}

function ReviewSuggestion({
  change,
  applied,
  onApply
}: {
  change?: FieldChange;
  applied: boolean;
  onApply: (key: string, value: string) => void;
}) {
  if (!change) {
    return <div className="review-suggestion muted-suggestion">사용자 수정 없음</div>;
  }

  return (
    <div className="review-suggestion">
      <div className="suggestion-header">
        <span>사용자 수정안</span>
        <div className="button-row">
          {applied ? <span className="status-pill">적용됨</span> : null}
          <button className="secondary-button" type="button" onClick={() => onApply(change.key, change.proposedValue)}>
            적용
          </button>
        </div>
      </div>
      <pre>{change.proposedValue || "(비어 있음)"}</pre>
    </div>
  );
}

function parseMarkdownSections(markdown: string): MarkdownSection[] {
  const normalized = markdown.trim();

  if (!normalized) {
    return [];
  }

  const headingMatches = Array.from(normalized.matchAll(/^##\s+(.+)$/gm));

  if (headingMatches.length === 0) {
    return [
      {
        key: "__body__",
        title: "본문 전체",
        text: normalized
      }
    ];
  }

  const sections: MarkdownSection[] = [];
  const firstHeadingIndex = headingMatches[0].index ?? 0;
  const intro = normalized.slice(0, firstHeadingIndex).trim();

  if (intro) {
    sections.push({
      key: "__intro__",
      title: "문서 시작 부분",
      text: intro
    });
  }

  for (let index = 0; index < headingMatches.length; index += 1) {
    const match = headingMatches[index];
    const start = match.index ?? 0;
    const end = headingMatches[index + 1]?.index ?? normalized.length;
    const title = match[1].trim();

    sections.push({
      key: sectionKey(title),
      title,
      text: normalized.slice(start, end).trim()
    });
  }

  return sections;
}

function applyMarkdownSection(markdown: string, section: MarkdownSection) {
  const current = markdown.trim();

  if (!current) {
    return section.text;
  }

  if (section.key === "__body__") {
    return section.text;
  }

  if (section.key === "__intro__") {
    const firstHeadingIndex = current.search(/^##\s+.+$/m);
    return firstHeadingIndex === -1
      ? section.text
      : [section.text.trim(), current.slice(firstHeadingIndex).trim()].filter(Boolean).join("\n\n");
  }

  const sections = parseMarkdownSections(current);
  const target = sections.find((item) => item.key === section.key);

  if (!target) {
    return [current, section.text].filter(Boolean).join("\n\n");
  }

  const start = current.indexOf(target.text);

  if (start === -1) {
    return [current, section.text].filter(Boolean).join("\n\n");
  }

  return `${current.slice(0, start).trimEnd()}\n\n${section.text}\n\n${current.slice(start + target.text.length).trimStart()}`.trim();
}

function sectionKey(title: string) {
  return title.toLowerCase().replace(/\s+/g, " ").trim();
}

function normalizeValue(value: string) {
  return value.replace(/\s+/g, " ").trim();
}
