"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function AuthSync() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) {
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          id: session.user.email || "user-" + Date.now(),
          name:
            session.user.name ||
            session.user.email?.split("@")[0] ||
            "Користувач",
        })
      );
    } else {
      localStorage.removeItem("currentUser");
    }
  }, [session]);

  return null;
}
