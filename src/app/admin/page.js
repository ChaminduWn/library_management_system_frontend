"use client";
import { useContext, useEffect } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { auth } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoggedIn || auth.role !== "LIBRARIAN") {
      router.push("/login");
    }
  }, [auth]);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Only LIBRARIAN can see this page.</p>
    </div>
  );
}
