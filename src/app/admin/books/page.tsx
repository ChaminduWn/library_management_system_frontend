// app/admin/books/page.tsx
"use client";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";

interface Book {
  id: number;
  title: string;
  author: string;
  genre?: string;
  language?: string;
  isbn?: string;
  status: "AVAILABLE" | "RESERVED";
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
  status: z.enum(["AVAILABLE", "RESERVED"]).optional(),
});

type BookForm = z.infer<typeof bookSchema>;

export default function BookManagement() {
  const { auth } = useContext(AuthContext)!;
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { toast } = useToast();
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
    try {
      const res = await fetch("http://localhost:8080/api/books", {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch books");
      const data = await res.json();
      setBooks(data);
    } catch (err) {
      toast({
        title: "Error",
        description: (err as Error).message,
      });
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/categories", {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      toast({
        title: "Error",
        description: (err as Error).message,
      });
    }
  };

  const onSubmit = async (data: BookForm) => {
    try {
      const payload = {
        ...data,
        category: data.categoryId ? { id: data.categoryId } : null,
      };
      delete payload.categoryId;

      const url = editingBook ? `http://localhost:8080/api/books/${editingBook.id}` : "http://localhost:8080/api/books";
      const method = editingBook ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save book");
      setIsAddOpen(false);
      setEditingBook(null);
      reset();
      fetchBooks();
      toast({
        title: "Success",
        description: "Book saved successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: (err as Error).message,
      });
    }
  };

  const deleteBook = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:8080/api/books/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!res.ok) throw new Error("Failed to delete book");
      fetchBooks();
      toast({
        title: "Success",
        description: "Book deleted",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: (err as Error).message,
      });
    }
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
    setValue("categoryId", book.category?.id ?? undefined);
    setValue("status", book.status);
  };

  const uploadCover = async (id: number, file: File | null) => {
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`http://localhost:8080/api/books/${id}/cover`, {
        method: "POST",
        headers: { Authorization: `Bearer ${auth.token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to upload cover");
      fetchBooks();
      toast({
        title: "Success",
        description: "Cover uploaded",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: (err as Error).message,
      });
    }
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
            <DialogDescription>Fill in the book details below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input placeholder="Title" {...register("title")} />
              {errors.title && <p className="text-red-500">{errors.title.message}</p>}
            </div>
            <div>
              <Input placeholder="Author" {...register("author")} />
              {errors.author && <p className="text-red-500">{errors.author.message}</p>}
            </div>
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
            <Select onValueChange={(v) => setValue("status", v as "AVAILABLE" | "RESERVED")}>
              <SelectTrigger>Status</SelectTrigger>
              <SelectContent>
                <SelectItem value="AVAILABLE">Available</SelectItem>
                <SelectItem value="RESERVED">Reserved</SelectItem>
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
            <TableHead>Genre</TableHead>
            <TableHead>Language</TableHead>
            <TableHead>ISBN</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {books.map((book) => (
            <TableRow key={book.id}>
              <TableCell>{book.title}</TableCell>
              <TableCell>{book.author}</TableCell>
              <TableCell>{book.genre}</TableCell>
              <TableCell>{book.language}</TableCell>
              <TableCell>{book.isbn}</TableCell>
              <TableCell>{book.category?.name}</TableCell>
              <TableCell>{book.status}</TableCell>
              <TableCell>
                {book.imageUrl ? <img src={book.imageUrl} alt="cover" className="object-cover w-10 h-10" /> : "No Image"}
              </TableCell>
              <TableCell className="space-x-2">
                <Button onClick={() => openEdit(book)}>Edit</Button>
                <Button variant="destructive" onClick={() => deleteBook(book.id)}>Delete</Button>
                <Input type="file" onChange={(e) => uploadCover(book.id, e.target.files?.[0] ?? null)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}