import type { Metadata } from "next";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";
import { AuthNavLink } from "@/components/auth-nav-link";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Fuckyou Wiki",
  description: "행동, 말투, 상황별 fuckyou를 정리하고 검토된 기여를 반영하는 위키",
  openGraph: {
    title: "Fuckyou Wiki",
    description: "카테고리, 태그, 이미지가 있는 로컬 콘텐츠 기반 위키",
    images: ["/images/wiki-cover.png"]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <header className="site-header">
          <Link className="brand" href="/">
            <strong>Fuckyou Wiki</strong>
          </Link>
          <nav aria-label="주요 메뉴">
            <Link href="/wiki">항목</Link>
            <Link href="/categories">분류</Link>
            <Link href="/wiki#search">검색</Link>
            <Link href="/contribute/new">기여</Link>
            <AuthNavLink className="nav-login-link" />
            <Link href="/admin/contributions">관리</Link>
          </nav>
        </header>
        {children}
        <footer className="site-footer">
          <div>
            <strong>Fuckyou Wiki</strong>
            <p>행동과 말의 사례를 정리하고 검토된 기여를 반영하는 위키입니다.</p>
          </div>
          <nav aria-label="하단 메뉴">
            <Link href="/wiki">항목</Link>
            <Link href="/categories">분류</Link>
            <Link href="/wiki#search">검색</Link>
            <Link href="/contribute/new">기여</Link>
            <AuthNavLink />
            <Link href="/admin/contributions">관리</Link>
          </nav>
          <p className="footer-note">
            이 위키는 공격적 표현과 행동을 설명하기 위한 문서이며, 사용을 권장하기 위한 목적이 아닙니다.
          </p>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
