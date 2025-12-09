"use client";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Book {
  id: number;
  title: string;
  author: string;
  status: "AVAILABLE" | "RESERVED" | "UNDER_MAINTENANCE";
}

export default function InventoryControl() {
  const { auth } = useContext(AuthContext)!;
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    if (!auth.isLoggedIn || auth.role !== "LIBRARIAN") {
      router.push("/login");
    } else {
      fetchBooks();
    }
  }, [auth, router]);

  const fetchBooks = async () => {
    const res = await fetch("http://localhost:8081/api/books", {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    const data = await res.json();
    setBooks(data);
  };

  const updateStatus = async (id: number, newStatus: Book["status"]) => {
    await fetch(`http://localhost:8081/api/books/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.token}` },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchBooks();
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Inventory Control</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Update Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {books.map((book) => (
            <TableRow key={book.id}>
              <TableCell>{book.title}</TableCell>
              <TableCell>{book.author}</TableCell>
              <TableCell>{book.status}</TableCell>
              <TableCell>
                <Select onValueChange={(v) => updateStatus(book.id, v as Book["status"])} defaultValue={book.status}>
                  <SelectTrigger className="w-[180px]">{book.status}</SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">Available</SelectItem>
                    <SelectItem value="RESERVED">Reserved</SelectItem>
                    <SelectItem value="UNDER_MAINTENANCE">Under Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}