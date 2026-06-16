"use client";

import { onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyProfile } from "@/app/me/actions";
import type { WikiEntry } from "@/lib/wiki";
import { submitContribution } from "@/app/contribute/actions";
import { getFirebaseAuth, getGoogleProvider } from "@/lib/firebase-client";
import { stripMarkdownImages } from "@/lib/markdown-sanitize";

type ContributionFormProps = {
  type: "create" | "edit";
  entry?: WikiEntry;
};

export function ContributionForm({ type, entry }: ContributionFormProps) {
  const [user, setUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState("");
  const [nickname, setNickname] = useState("");
  const [authError, setAuthError] = useState("");
  const editableContent = stripMarkdownImages(entry?.content ?? "");

  useEffect(() => {
    try {
      const auth = getFirebaseAuth();
      return onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        setAuthError("");

        if (!currentUser) {
          setIdToken("");
          return;
        }

        const token = await currentUser.getIdToken();
        setIdToken(token);
        const profile = await getMyProfile(token);
        setNickname(profile.nickname);
      });
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Firebase 로그인 설정을 확인해 주세요.");
      return undefined;
    }
  }, []);

  async function login() {
    try {
      const auth = getFirebaseAuth();
      const credential = await signInWithPopup(auth, getGoogleProvider());
      setUser(credential.user);
      const token = await credential.user.getIdToken();
      setIdToken(token);
      const profile = await getMyProfile(token);
      setNickname(profile.nickname);
      setAuthError("");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Google 로그인에 실패했습니다.");
    }
  }

  async function logout() {
    await signOut(getFirebaseAuth());
    setUser(null);
    setIdToken("");
  }

  if (!user) {
    return (
      <section className="auth-panel" aria-labelledby="contribution-login-title">
        <h2 id="contribution-login-title">로그인 필요</h2>
        <p>기여하려면 Google 로그인이 필요합니다. 기여자 이름은 마이페이지 닉네임으로 표시됩니다.</p>
        {authError ? <p className="error-message">{authError}</p> : null}
        <button className="primary-button" type="button" onClick={login}>
          Google로 로그인
        </button>
      </section>
    );
  }

  return (
    <>
      <section className="auth-panel" aria-label="로그인 상태">
        <div>
          <strong>{user.displayName || user.email?.split("@")[0] || "Google 사용자"}</strong>
          <p>기여자 닉네임: {nickname}</p>
        </div>
        <div className="button-row">
          <Link className="secondary-button" href="/me">닉네임 수정</Link>
          <button className="secondary-button" type="button" onClick={logout}>
            로그아웃
          </button>
        </div>
      </section>

      <form className="stacked-form" action={submitContribution}>
        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="targetSlug" value={entry?.slug ?? ""} />
        <input type="hidden" name="idToken" value={idToken} />
        <label className="website-field">
          웹사이트
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>

        {type === "create" ? (
          <label>
            문서 slug
            <input name="slug" defaultValue="" maxLength={120} placeholder="new-fuckyou" />
          </label>
        ) : null}

        <label>
          제목
          <input name="title" required defaultValue={entry?.title ?? ""} maxLength={120} />
        </label>

        <label>
          요약
          <textarea name="summary" required defaultValue={entry?.summary ?? ""} rows={3} />
        </label>

        <div className="form-grid">
          <label>
            분류
            <input name="category" required defaultValue={entry?.category ?? ""} maxLength={80} />
          </label>

          <label>
            강도
            <select name="severity" defaultValue={entry?.severity ?? "medium"}>
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
          </label>
        </div>

        <label>
          태그
          <input name="tags" defaultValue={entry?.tags.join(", ") ?? ""} placeholder="쉼표로 구분" />
        </label>

        <label>
          별칭
          <input name="aliases" defaultValue={entry?.aliases.join(", ") ?? ""} placeholder="쉼표로 구분" />
        </label>

        <label>
          관련 항목 slug
          <input name="related" defaultValue={entry?.related.join(", ") ?? ""} placeholder="쉼표로 구분" />
        </label>

        <label>
          본문
          <textarea name="content" required defaultValue={editableContent} rows={18} />
        </label>

        <label className="check-row">
          <input name="quotePermission" type="checkbox" required />
          내가 제출한 내용을 관리자가 수정하거나 일부 인용해 문서에 반영해도 됩니다.
        </label>

        <button className="primary-button" type="submit" disabled={!idToken}>
          검토 요청 보내기
        </button>
      </form>
    </>
  );
}
