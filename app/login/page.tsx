import { LoginStatusPanel } from "@/components/login-status-panel";

type Props = {
  searchParams: Promise<{ adminError?: string }>;
};

export const metadata = {
  title: "로그인 | Fuckyou Wiki"
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <main className="page-shell narrow-shell">
      <section className="page-title">
        <p className="eyebrow">login</p>
        <h1>로그인</h1>
        <p>Google 계정으로 로그인하면 문서 추가와 수정 요청을 보낼 수 있습니다.</p>
      </section>

      <LoginStatusPanel hasAdminError={params.adminError === "1"} />
    </main>
  );
}
