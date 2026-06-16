"use client";

import { onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { useEffect, useState } from "react";
import Link from "next/link";
import { loginAdmin } from "@/app/admin/actions";
import { getFirebaseAuth, getGoogleProvider } from "@/lib/firebase-client";

export function LoginStatusPanel({ hasAdminError = false }: { hasAdminError?: boolean }) {
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState(hasAdminError ? "현재 로그인한 계정은 관리자 권한이 없습니다." : "");

  useEffect(() => {
    try {
      return onAuthStateChanged(getFirebaseAuth(), (currentUser) => {
        setUser(currentUser);
        setAuthError("");
      });
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Firebase 로그인 설정을 확인해 주세요.");
      return undefined;
    }
  }, []);

  async function login() {
    try {
      const credential = await signInWithPopup(getFirebaseAuth(), getGoogleProvider());
      setUser(credential.user);
      setAuthError("");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Google 로그인에 실패했습니다.");
    }
  }

  async function logout() {
    await signOut(getFirebaseAuth());
    setUser(null);
  }

  async function openAdmin() {
    if (!user) {
      await login();
      return;
    }

    const formData = new FormData();
    formData.set("idToken", await user.getIdToken(true));
    await loginAdmin(formData);
  }

  return (
    <section className="auth-panel login-panel" aria-labelledby="login-title">
      <h2 id="login-title">Google 로그인</h2>
      {authError ? <p className="error-message">{authError}</p> : null}
      {user ? (
        <>
          <p>
            <strong>{user.displayName || user.email?.split("@")[0] || "Google 사용자"}</strong> 계정으로 로그인되어 있습니다.
          </p>
          <div className="button-row">
            <Link className="primary-link" href="/me">
              마이페이지
            </Link>
            <Link className="primary-link" href="/contribute/new">
              새 뻐뀨 제안
            </Link>
            <button className="secondary-button" type="button" onClick={openAdmin}>
              관리 페이지
            </button>
            <button className="secondary-button" type="button" onClick={logout}>
              로그아웃
            </button>
          </div>
        </>
      ) : (
        <>
          <p>기여하려면 Google 계정으로 로그인해야 합니다.</p>
          <button className="primary-button" type="button" onClick={login}>
            Google로 로그인
          </button>
        </>
      )}
    </section>
  );
}
