"use client";

import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase-client";

export function AuthNavLink({ className }: { className?: string }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    try {
      return onAuthStateChanged(getFirebaseAuth(), (user) => {
        setIsLoggedIn(Boolean(user));
      });
    } catch {
      return undefined;
    }
  }, []);

  return (
    <Link className={className} href={isLoggedIn ? "/me" : "/login"}>
      {isLoggedIn ? "마이페이지" : "로그인"}
    </Link>
  );
}
