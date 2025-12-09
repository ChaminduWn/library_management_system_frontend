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
import { UserPlus, Search, Edit2, Shield, ShieldOff, Loader2, Mail, Lock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

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
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors }, setValue, reset, watch } = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: "USER"
    }
  });

  const selectedRole = watch("role");

  useEffect(() => {
    if (!auth.isLoggedIn || auth.role !== "LIBRARIAN") {
      router.push("/login");
    } else {
      fetchUsers();
    }
  }, [auth, router]);

  useEffect(() => {
    let filtered = users;

    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (roleFilter !== "ALL") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [searchQuery, roleFilter, users]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/users", {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      toast({
        title: "Error",
        description: (err as Error).message,
        
      });
    } finally {
      setIsLoading(false);
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
        description: editingUser ? "User updated successfully" : "User created successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: (err as Error).message,
        
      });
    }
  };

  const toggleBlacklist = async (id: number, current: boolean) => {
    try {
      const res = await fetch(`http://localhost:8080/api/users/${id}/blacklist`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify({ isBlacklisted: !current }),
      });
      if (!res.ok) throw new Error("Failed to update blacklist");
      fetchUsers();
      toast({
        title: "Success",
        description: current ? "User removed from blacklist" : "User added to blacklist",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: (err as Error).message,
        
      });
    }
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setIsAddOpen(true);
    setValue("email", user.email);
    setValue("role", user.role);
  };

  const stats = {
    total: users.length,
    librarians: users.filter(u => u.role === "LIBRARIAN").length,
    blacklisted: users.filter(u => u.isBlacklisted).length,
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="mx-auto space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-4xl font-bold text-slate-900 dark:text-slate-100">
              <Users className="w-10 h-10 text-blue-600" />
              User Management
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Manage users, roles, and access control
            </p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => { setEditingUser(null); reset(); }} 
                size="lg"
                className="text-white transition-all bg-blue-600 shadow-lg hover:bg-blue-700 hover:shadow-xl"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {editingUser ? "Edit User" : "Create New User"}
                </DialogTitle>
                <DialogDescription>
                  {editingUser ? "Update user information and permissions" : "Add a new user to the system"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </Label>
                  <Input 
                    id="email"
                    placeholder="user@example.com" 
                    {...register("email")}
                    className="h-11"
                  />
                  {errors.email && (
                    <p className="flex items-center gap-1 text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {!editingUser && (
                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Password
                    </Label>
                    <Input 
                      id="password"
                      type="password" 
                      placeholder="Enter secure password" 
                      {...register("password")}
                      className="h-11"
                    />
                    {errors.password && (
                      <p className="text-sm text-red-500">{errors.password.message}</p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="role" className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Role
                  </Label>
                  <Select 
                    value={selectedRole} 
                    onValueChange={(v) => setValue("role", v as "USER" | "LIBRARIAN")}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          User
                        </div>
                      </SelectItem>
                      <SelectItem value="LIBRARIAN">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full" />
                          Librarian
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1 bg-blue-600 h-11 hover:bg-blue-700">
                    {editingUser ? "Update User" : "Create User"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddOpen(false)}
                    className="flex-1 h-11"
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
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardDescription>Total Users</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardDescription>Librarians</CardDescription>
              <CardTitle className="text-3xl">{stats.librarians}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-3">
              <CardDescription>Blacklisted</CardDescription>
              <CardTitle className="text-3xl">{stats.blacklisted}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute w-5 h-5 transform -translate-y-1/2 left-3 top-1/2 text-slate-400" />
                <Input
                  placeholder="Search by email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-[200px] h-11">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Roles</SelectItem>
                  <SelectItem value="USER">Users</SelectItem>
                  <SelectItem value="LIBRARIAN">Librarians</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No users found</p>
                <p className="text-sm">Try adjusting your search filters</p>
              </div>
            ) : (
              <div className="overflow-hidden border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-900">
                      <TableHead className="font-semibold">Email</TableHead>
                      <TableHead className="font-semibold">Role</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Created</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.role === "LIBRARIAN" ? "default" : "secondary"}
                            className={user.role === "LIBRARIAN" ? "bg-purple-100 text-purple-800 hover:bg-purple-200" : ""}
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.isBlacklisted ? (
                            <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                              <ShieldOff className="w-3 h-3" />
                              Blacklisted
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="flex items-center gap-1 text-green-700 border-green-300 w-fit">
                              <Shield className="w-3 h-3" />
                              Active
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              onClick={() => openEdit(user)} 
                              variant="ghost"
                              size="sm"
                              className="hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Edit2 className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              variant={user.isBlacklisted ? "outline" : "ghost"}
                              size="sm"
                              onClick={() => toggleBlacklist(user.id, user.isBlacklisted)}
                              className={user.isBlacklisted 
                                ? "hover:bg-green-50 hover:text-green-600 hover:border-green-300" 
                                : "hover:bg-red-50 hover:text-red-600"
                              }
                            >
                              {user.isBlacklisted ? (
                                <>
                                  <Shield className="w-4 h-4 mr-1" />
                                  Unblock
                                </>
                              ) : (
                                <>
                                  <ShieldOff className="w-4 h-4 mr-1" />
                                  Block
                                </>
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}