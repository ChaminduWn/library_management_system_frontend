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

interface User {
  id: number;
  email: string;
  role: "USER" | "LIBRARIAN";
  isBlacklisted: boolean;
  createdAt?: string;
}

const userSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  role: z.enum(["USER", "LIBRARIAN"]),
});

type UserForm = z.infer<typeof userSchema>;

export default function UserManagement() {
  const { auth } = useContext(AuthContext)!;
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<UserForm>({
    resolver: zodResolver(userSchema),
  });

  useEffect(() => {
    if (!auth.isLoggedIn || auth.role !== "LIBRARIAN") {
      router.push("/login");
    } else {
      fetchUsers();
    }
  }, [auth, router]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/users", {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      toast({
        title: "Error",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: UserForm) => {
    try {
      const url = editingUser ? `http://localhost:8080/api/users/${editingUser.id}` : "http://localhost:8080/api/users";
      const method = editingUser ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save user");
      setIsAddOpen(false);
      setEditingUser(null);
      reset();
      fetchUsers();
      toast({
        title: "Success",
        description: "User saved successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  const toggleBlacklist = async (id: number, current: boolean) => {
    console.log("Blacklist button clicked!", { id, current, newStatus: !current });
    
    try {
      const res = await fetch(`http://localhost:8080/api/users/${id}/blacklist`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${auth.token}` 
        },
        body: JSON.stringify({ isBlacklisted: !current }),
      });
      
      console.log("Response status:", res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error response:", errorText);
        throw new Error("Failed to update blacklist status");
      }
      
      await fetchUsers();
      toast({
        title: "Success",
        description: `User ${!current ? "blacklisted" : "unblacklisted"} successfully`,
      });
    } catch (err) {
      console.error("Blacklist error:", err);
      toast({
        title: "Error",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setIsAddOpen(true);
    setValue("email", user.email);
    setValue("role", user.role);
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">User Management</h1>
      
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => { setEditingUser(null); reset(); }}>Add User</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
            <DialogDescription>Enter the user details below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input placeholder="Email" {...register("email")} />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            {!editingUser && (
              <div>
                <Input type="password" placeholder="Password" {...register("password")} />
                {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
              </div>
            )}
            <Select onValueChange={(v) => setValue("role", v as "USER" | "LIBRARIAN")}>
              <SelectTrigger>
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="LIBRARIAN">Librarian</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit">Save</Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Blacklisted</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <span className={user.isBlacklisted ? "text-red-600 font-semibold" : "text-green-600"}>
                    {user.isBlacklisted ? "Yes" : "No"}
                  </span>
                </TableCell>
                <TableCell>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => openEdit(user)}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="sm"
                      variant={user.isBlacklisted ? "default" : "destructive"}
                      onClick={() => {
                        console.log("Button click event fired");
                        toggleBlacklist(user.id, user.isBlacklisted);
                      }}
                    >
                      {user.isBlacklisted ? "Unblacklist" : "Blacklist"}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}