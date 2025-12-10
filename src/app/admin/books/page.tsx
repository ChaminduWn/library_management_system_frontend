// app/admin/books/page.tsx
"use client";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, BookOpen, Search, Upload, Image as ImageIcon, Filter } from "lucide-react";

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
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
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
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [uploadingCoverId, setUploadingCoverId] = useState<number | null>(null);
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors }, setValue, reset, watch } = useForm<BookForm>({
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

  useEffect(() => {
    let filtered = books;

    if (searchQuery) {
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.isbn?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(book => book.status === statusFilter);
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(book => book.category?.id.toString() === categoryFilter);
    }

    setFilteredBooks(filtered);
  }, [searchQuery, statusFilter, categoryFilter, books]);

  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/books", {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch books");
      const data = await res.json();
      setBooks(data);
      setFilteredBooks(data);
    } catch (err) {
      toast({
        title: "Error",
        description: (err as Error).message,
      });
    } finally {
      setIsLoading(false);
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
        description: `Book ${editingBook ? 'updated' : 'created'} successfully`,
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
        description: "Book deleted successfully",
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
    setUploadingCoverId(id);
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
        description: "Cover uploaded successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: (err as Error).message,
      });
    } finally {
      setUploadingCoverId(null);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsAddOpen(open);
    if (!open) {
      setEditingBook(null);
      reset();
    }
  };

  const availableBooks = books.filter(b => b.status === "AVAILABLE").length;
  const reservedBooks = books.filter(b => b.status === "RESERVED").length;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Book Management</h1>
            <p className="mt-2 text-slate-600">Manage your library's book collection</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button 
                size="lg" 
                className="gap-2 transition-all shadow-lg hover:shadow-xl"
                onClick={() => { setEditingBook(null); reset(); }}
              >
                <Plus className="w-5 h-5" />
                Add Book
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {editingBook ? "Edit Book" : "Add New Book"}
                </DialogTitle>
                <DialogDescription>Fill in the book details below.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input id="title" placeholder="Book title" {...register("title")} />
                    {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="author">Author *</Label>
                    <Input id="author" placeholder="Author name" {...register("author")} />
                    {errors.author && <p className="text-sm text-red-500">{errors.author.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="genre">Genre</Label>
                    <Input id="genre" placeholder="e.g., Fiction, Non-fiction" {...register("genre")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Input id="language" placeholder="e.g., English" {...register("language")} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="isbn">ISBN</Label>
                  <Input id="isbn" placeholder="ISBN number" {...register("isbn")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input id="imageUrl" placeholder="https://example.com/image.jpg" {...register("imageUrl")} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select 
                      value={watch("categoryId")?.toString() || ""} 
                      onValueChange={(v) => setValue("categoryId", v ? Number(v) : undefined)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select 
                      value={watch("status") || "AVAILABLE"} 
                      onValueChange={(v) => setValue("status", v as "AVAILABLE" | "RESERVED")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AVAILABLE">Available</SelectItem>
                        <SelectItem value="RESERVED">Reserved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingBook ? "Update Book" : "Create Book"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => handleDialogClose(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="shadow-md border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="w-5 h-5 text-slate-600" />
                Total Books
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{books.length}</div>
            </CardContent>
          </Card>

          <Card className="shadow-md border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="w-5 h-5 bg-green-500 rounded-full" />
                Available
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{availableBooks}</div>
            </CardContent>
          </Card>

          <Card className="shadow-md border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="w-5 h-5 rounded-full bg-amber-500" />
                Reserved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">{reservedBooks}</div>
            </CardContent>
          </Card>
        </div>

        {/* Books Table Card */}
        <Card className="shadow-md border-slate-200">
          <CardHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Books</CardTitle>
                  <CardDescription>Manage your complete book inventory</CardDescription>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                  <Input
                    placeholder="Search by title, author, or ISBN..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="AVAILABLE">Available</SelectItem>
                      <SelectItem value="RESERVED">Reserved</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-12 text-center text-slate-500">Loading books...</div>
            ) : filteredBooks.length === 0 ? (
              <div className="py-12 text-center">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-slate-500">
                  {searchQuery || statusFilter !== "all" || categoryFilter !== "all" 
                    ? "No books found matching your filters" 
                    : "No books yet. Add your first book!"}
                </p>
              </div>
            ) : (
              <div className="overflow-hidden border rounded-lg border-slate-200">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 hover:bg-slate-50">
                        <TableHead className="font-semibold text-slate-700">Cover</TableHead>
                        <TableHead className="font-semibold text-slate-700">Title</TableHead>
                        <TableHead className="font-semibold text-slate-700">Author</TableHead>
                        <TableHead className="font-semibold text-slate-700">Genre</TableHead>
                        <TableHead className="font-semibold text-slate-700">ISBN</TableHead>
                        <TableHead className="font-semibold text-slate-700">Category</TableHead>
                        <TableHead className="font-semibold text-slate-700">Status</TableHead>
                        <TableHead className="font-semibold text-right text-slate-700">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBooks.map((book) => (
                        <TableRow key={book.id} className="transition-colors hover:bg-slate-50/50">
                          <TableCell>
                            <div className="relative w-12 h-16 overflow-hidden border rounded bg-slate-100 border-slate-200">
                              {book.imageUrl ? (
                                <img 
                                  src={book.imageUrl} 
                                  alt={book.title}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <div className="flex items-center justify-center w-full h-full">
                                  <ImageIcon className="w-6 h-6 text-slate-300" />
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium max-w-[200px] truncate">{book.title}</TableCell>
                          <TableCell>{book.author}</TableCell>
                          <TableCell>{book.genre || "-"}</TableCell>
                          <TableCell className="font-mono text-sm">{book.isbn || "-"}</TableCell>
                          <TableCell>
                            {book.category ? (
                              <Badge variant="secondary" className="font-normal">
                                {book.category.name}
                              </Badge>
                            ) : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={book.status === "AVAILABLE" ? "default" : "secondary"}
                              className={book.status === "AVAILABLE" ? "bg-green-500 hover:bg-green-600" : "bg-amber-500 hover:bg-amber-600"}
                            >
                              {book.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => openEdit(book)}
                                className="gap-1"
                              >
                                <Pencil className="w-3 h-3" />
                                Edit
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="gap-1 text-red-600 border-red-200 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    Delete
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Book</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{book.title}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteBook(book.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                              <label className="cursor-pointer">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="gap-1"
                                  disabled={uploadingCoverId === book.id}
                                  asChild
                                >
                                  <span>
                                    <Upload className="w-3 h-3" />
                                    {uploadingCoverId === book.id ? "Uploading..." : "Cover"}
                                  </span>
                                </Button>
                                <input 
                                  type="file" 
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) => uploadCover(book.id, e.target.files?.[0] ?? null)}
                                  disabled={uploadingCoverId === book.id}
                                />
                              </label>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}