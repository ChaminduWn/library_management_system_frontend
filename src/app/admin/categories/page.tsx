"use client";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface Category {
  id: number;
  name: string;
}

const categorySchema = z.object({
  name: z.string().min(1, "Name required"),
});

type CategoryForm = z.infer<typeof categorySchema>;

export default function CategoryManagement() {
  const { auth } = useContext(AuthContext)!;
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
  });

  useEffect(() => {
    if (!auth.isLoggedIn || auth.role !== "LIBRARIAN") {
      router.push("/login");
    } else {
      fetchCategories();
    }
  }, [auth, router]);

  const fetchCategories = async () => {
    const res = await fetch("http://localhost:8081/api/categories", {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    const data = await res.json();
    setCategories(data);
  };

  const onSubmit = async (data: CategoryForm) => {
    const url = editingCategory ? `http://localhost:8081/api/categories/${editingCategory.id}` : "http://localhost:8081/api/categories";
    const method = editingCategory ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.token}` },
      body: JSON.stringify(data),
    });
    setIsAddOpen(false);
    setEditingCategory(null);
    reset();
    fetchCategories();
  };

  const deleteCategory = async (id: number) => {
    await fetch(`http://localhost:8081/api/categories/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    fetchCategories();
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setIsAddOpen(true);
    setValue("name", cat.name);
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Category Management</h1>
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => { setEditingCategory(null); reset(); }}>Add Category</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input placeholder="Name" {...register("name")} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            <Button type="submit">Save</Button>
          </form>
        </DialogContent>
      </Dialog>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((cat) => (
            <TableRow key={cat.id}>
              <TableCell>{cat.name}</TableCell>
              <TableCell className="space-x-2">
                <Button onClick={() => openEdit(cat)}>Edit</Button>
                <Button variant="destructive" onClick={() => deleteCategory(cat.id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}