"use client";

import { onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getMyProfile, saveMyNickname } from "@/app/me/actions";
import { getFirebaseAuth, getGoogleProvider } from "@/lib/firebase-client";

export function MyPagePanel() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState("");
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    try {
      return onAuthStateChanged(getFirebaseAuth(), async (currentUser) => {
        setUser(currentUser);
        setMessage("");

        if (!currentUser) {
          setIdToken("");
          setNickname("");
          return;
        }

        const token = await currentUser.getIdToken();
        setIdToken(token);
        const profile = await getMyProfile(token);
        setNickname(profile.nickname);
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "로그인 정보를 불러오지 못했습니다.");
      return undefined;
    }
  }, []);

  async function login() {
    const credential = await signInWithPopup(getFirebaseAuth(), getGoogleProvider());
    setUser(credential.user);
    const token = await credential.user.getIdToken();
    setIdToken(token);
    const profile = await getMyProfile(token);
    setNickname(profile.nickname);
  }

  async function logout() {
    await signOut(getFirebaseAuth());
    router.push("/login");
  }

  function save(formData: FormData) {
    startTransition(async () => {
      formData.set("idToken", idToken);
      const profile = await saveMyNickname(formData);
      setNickname(profile.nickname);
      setMessage("닉네임을 저장했습니다.");
      router.refresh();
    });
  }

  if (!user) {
    return (
      <section className="auth-panel login-panel">
        <p>마이페이지를 사용하려면 Google 로그인이 필요합니다.</p>
        <button className="primary-button" type="button" onClick={login}>
          Google로 로그인
        </button>
      </section>
    );
  }

  return (
    <section className="auth-panel login-panel">
      <h2>계정</h2>
      <p>
        <strong>{user.email}</strong>
      </p>
      {message ? <p className="status-message">{message}</p> : null}
      <form className="stacked-form compact-form" action={save}>
        <input type="hidden" name="idToken" value={idToken} />
        <label>
          닉네임
          <input name="nickname" value={nickname} maxLength={40} onChange={(event) => setNickname(event.target.value)} />
        </label>
        <div className="button-row">
          <button className="primary-button" type="submit" disabled={isPending}>
            저장
          </button>
          <button className="secondary-button" type="button" onClick={logout}>
            로그아웃
          </button>
        </div>
      </form>
    </section>
  );
}
