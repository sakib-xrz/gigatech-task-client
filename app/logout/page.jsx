/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import useStore from "@/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Logout() {
  const { logOut } = useStore();
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      await logOut();
      router.push("/login");
    };

    logout();
  }, []);

  return null;
}
