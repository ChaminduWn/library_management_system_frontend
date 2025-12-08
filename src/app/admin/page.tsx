"use client";

import { useContext, useEffect } from "react";
import { AuthContext } from "@/context/AuthContext"; 
import { useRouter } from "next/navigation"; 
import Link from "next/link";

export default function AdminDashboard() {
  const authContext = useContext(AuthContext);
  const router = useRouter();

  if (!authContext) {
    return null;
  }

  const { auth } = authContext;

  useEffect(() => {
    if (!auth.isLoggedIn || auth.role !== "LIBRARIAN") {
      router.push("/login");
    }
  }, [auth]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="mt-2 text-gray-700">A central hub to oversee all library operations. Only LIBRARIAN can access this page.</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link href="/admin/books" className="p-4 text-center text-white bg-blue-500 rounded shadow hover:bg-blue-600">
          Book Management
        </Link>
        <Link href="/admin/categories" className="p-4 text-center text-white bg-green-500 rounded shadow hover:bg-green-600">
          Category Management
        </Link>
        <Link href="/admin/users" className="p-4 text-center text-white bg-purple-500 rounded shadow hover:bg-purple-600">
          User Management
        </Link>
        <Link href="/admin/inventory" className="p-4 text-center text-white bg-yellow-500 rounded shadow hover:bg-yellow-600">
          Inventory Control
        </Link>
      </div>
    </div>
  );
}