"use client";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface Book {
  id: number;
  title: string;
  author: string;
  genre?: string;
  language?: string;
  isbn?: string;
  status: "AVAILABLE" | "RESERVED" | "UNDER_MAINTENANCE";
  imageUrl?: string;
  category?: { id: number; name: string };
}

interface Category {
  id: number;
  name: string;
}

const bookSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  genre: z.string().optional(),
  language: z.string().optional(),
  isbn: z.string().optional(),
  imageUrl: z.string().optional(),
  categoryId: z.number().optional(),
  status: z.enum(["AVAILABLE", "RESERVED", "UNDER_MAINTENANCE"]).optional(),
});

type BookForm = z.infer<typeof bookSchema>;

export default function BookManagement() {
  const { auth } = useContext(AuthContext)!;
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<BookForm>({
    resolver: zodResolver(bookSchema),
  });

  useEffect(() => {
    if (!auth.isLoggedIn || auth.role !== "LIBRARIAN") {
      router.push("/login");
    } else {
      fetchBooks();
      fetchCategories();
    }
  }, [auth, router]);

  const fetchBooks = async () => {
    const res = await fetch("http://localhost:8081/api/books", {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    const data = await res.json();
    setBooks(data);
  };

  const fetchCategories = async () => {
    const res = await fetch("http://localhost:8081/api/categories", {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    const data = await res.json();
    setCategories(data);
  };

  const onSubmit = async (data: BookForm) => {
    const url = editingBook ? `http://localhost:8081/api/books/${editingBook.id}` : "http://localhost:8081/api/books";
    const method = editingBook ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.token}` },
      body: JSON.stringify(data),
    });
    setIsAddOpen(false);
    setEditingBook(null);
    reset();
    fetchBooks();
  };

  const deleteBook = async (id: number) => {
    await fetch(`http://localhost:8081/api/books/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    fetchBooks();
  };

  const openEdit = (book: Book) => {
    setEditingBook(book);
    setIsAddOpen(true);
    setValue("title", book.title);
    setValue("author", book.author);
    setValue("genre", book.genre);
    setValue("language", book.language);
    setValue("isbn", book.isbn);
    setValue("imageUrl", book.imageUrl);
    setValue("categoryId", book.category?.id);
    setValue("status", book.status);
  };

  const uploadCover = async (id: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    await fetch(`http://localhost:8081/api/books/${id}/cover`, {
      method: "POST",
      headers: { Authorization: `Bearer ${auth.token}` },
      body: formData,
    });
    fetchBooks();
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Book Management</h1>
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => { setEditingBook(null); reset(); }}>Add Book</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBook ? "Edit Book" : "Add New Book"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input placeholder="Title" {...register("title")} />
            <Input placeholder="Author" {...register("author")} />
            <Input placeholder="Genre" {...register("genre")} />
            <Input placeholder="Language" {...register("language")} />
            <Input placeholder="ISBN" {...register("isbn")} />
            <Input placeholder="Image URL" {...register("imageUrl")} />
            <Select onValueChange={(v) => setValue("categoryId", Number(v))}>
              <SelectTrigger>Category</SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={(v) => setValue("status", v as any)}>
              <SelectTrigger>Status</SelectTrigger>
              <SelectContent>
                <SelectItem value="AVAILABLE">Available</SelectItem>
                <SelectItem value="RESERVED">Reserved</SelectItem>
                <SelectItem value="UNDER_MAINTENANCE">Under Maintenance</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit">Save</Button>
          </form>
        </DialogContent>
      </Dialog>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {books.map((book) => (
            <TableRow key={book.id}>
              <TableCell>{book.title}</TableCell>
              <TableCell>{book.author}</TableCell>
              <TableCell>{book.status}</TableCell>
              <TableCell className="space-x-2">
                <Button onClick={() => openEdit(book)}>Edit</Button>
                <Button variant="destructive" onClick={() => deleteBook(book.id)}>Delete</Button>
                <Input type="file" onChange={(e) => e.target.files && uploadCover(book.id, e.target.files[0])} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}