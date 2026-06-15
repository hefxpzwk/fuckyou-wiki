import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-shell">
      <section className="page-title">
        <p className="eyebrow">404</p>
        <h1>항목을 찾을 수 없습니다</h1>
        <p>문서 파일명이 바뀌었거나 아직 작성되지 않은 항목입니다.</p>
        <Link className="primary-link fit-link" href="/wiki">
          항목 목록으로 이동
        </Link>
      </section>
    </main>
  );
}
