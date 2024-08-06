/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Loading from "@/components/shared/Loading";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const router = useRouter();
  useEffect(() => {
    router.push("/users");
  }, []);
  return <Loading  />;
}
