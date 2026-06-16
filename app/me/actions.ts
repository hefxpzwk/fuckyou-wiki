"use server";

import { verifyFirebaseIdToken } from "@/lib/firebase-admin";
import { ensureUserProfile, updateUserNickname } from "@/lib/wiki";
import { getText, requireText } from "@/lib/form-utils";

export async function getMyProfile(idToken: string) {
  const user = await verifyFirebaseIdToken(idToken);

  return ensureUserProfile({
    uid: user.uid,
    email: user.email ?? null,
    displayName: user.name ?? null
  });
}

export async function saveMyNickname(formData: FormData) {
  const user = await verifyFirebaseIdToken(requireText(formData, "idToken", "로그인 토큰"));

  return updateUserNickname({
    uid: user.uid,
    email: user.email ?? null,
    displayName: user.name ?? null,
    nickname: getText(formData, "nickname")
  });
}
