import { MyPagePanel } from "@/components/my-page-panel";

export const metadata = {
  title: "마이페이지 | Fuckyou Wiki"
};

export default function MyPage() {
  return (
    <main className="page-shell narrow-shell">
      <section className="page-title">
        <p className="eyebrow">account</p>
        <h1>마이페이지</h1>
        <p>계정 닉네임을 수정하면 기존 기여자 표기도 새 닉네임으로 표시됩니다.</p>
      </section>

      <MyPagePanel />
    </main>
  );
}
