import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getAdminApp() {
  const existing = getApps()[0];

  if (existing) {
    return existing;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase Admin 환경변수 FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY가 필요합니다.");
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey
    })
  });
}

export function isFirebaseAdminConfigured() {
  return Boolean(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY);
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

export function getAdminFirestore() {
  return getFirestore(getAdminApp());
}

export async function verifyFirebaseIdToken(idToken: string) {
  if (!idToken) {
    throw new Error("로그인이 필요합니다.");
  }

  return getAdminAuth().verifyIdToken(idToken);
}

export function isAdminUid(uid: string) {
  return getAdminUids().has(uid);
}

export function getAdminUids() {
  return new Set(
    (process.env.FIREBASE_ADMIN_UIDS ?? "")
      .split(",")
      .map((uid) => uid.trim())
      .filter(Boolean)
  );
}

function normalizePrivateKey(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  return value
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\\n/g, "\n");
}
