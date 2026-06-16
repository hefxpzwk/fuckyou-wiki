import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isAdminUid, verifyFirebaseIdToken } from "@/lib/firebase-admin";

const cookieName = "fw_admin_token";

export async function createAdminSession(idToken: string) {
  const decoded = await verifyFirebaseIdToken(idToken);

  if (!isAdminUid(decoded.uid)) {
    throw new Error("관리자 권한이 없습니다.");
  }

  const cookieStore = await cookies();
  cookieStore.set(cookieName, idToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(cookieName);
}

export async function getAdminUser() {
  const cookieStore = await cookies();
  const idToken = cookieStore.get(cookieName)?.value;

  if (!idToken) {
    return null;
  }

  try {
    const decoded = await verifyFirebaseIdToken(idToken);
    return isAdminUid(decoded.uid) ? decoded : null;
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const user = await getAdminUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
