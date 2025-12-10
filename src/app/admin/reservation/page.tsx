"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, User, BookOpen, CheckCircle, XCircle, Filter, Search, AlertCircle, Edit2, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Reservation {
  id: number;
  userId: number;
  bookId: number;
  reservationDate: string;
  dueDate: string;
  status: "ACTIVE" | "RETURNED";
}

interface Book {
  id: number;
  title: string;
  author: string;
}

interface UserInfo {
  id: number;
  email: string;
}

interface EnrichedReservation extends Reservation {
  bookTitle?: string;
  bookAuthor?: string;
  userEmail?: string;
  isOverdue?: boolean;
  daysRemaining?: number;
}

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<EnrichedReservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<EnrichedReservation[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [overdueFilter, setOverdueFilter] = useState("all");
  const [editingReservation, setEditingReservation] = useState<number | null>(null);
  const [newDueDate, setNewDueDate] = useState("");

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reservations, searchTerm, statusFilter, overdueFilter]);

  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login as a librarian");
        setLoading(false);
        return;
      }

      const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      };

      // Fetch all data in parallel
      const [reservationsRes, booksRes, usersRes] = await Promise.all([
        fetch("http://localhost:8080/api/reservations", { headers }),
        fetch("http://localhost:8080/api/books", { headers }),
        fetch("http://localhost:8080/api/users", { headers })
      ]);

      if (reservationsRes.ok && booksRes.ok && usersRes.ok) {
        const reservationsData = await reservationsRes.json();
        const booksData = await booksRes.json();
        const usersData = await usersRes.json();

        setReservations(reservationsData);
        setBooks(booksData);
        setUsers(usersData);

        // Enrich reservations with book and user data
        const enriched = enrichReservations(reservationsData, booksData, usersData);
        setReservations(enriched);
      } else {
        setError("Failed to load data. Make sure you're logged in as a librarian.");
      }
    } catch (err) {
      setError("Error connecting to server");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const enrichReservations = (
    reservations: Reservation[],
    books: Book[],
    users: UserInfo[]
  ): EnrichedReservation[] => {
    return reservations.map(res => {
      const book = books.find(b => b.id === res.bookId);
      const user = users.find(u => u.id === res.userId);
      const today = new Date();
      const dueDate = new Date(res.dueDate);
      const daysRemaining = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        ...res,
        bookTitle: book?.title || "Unknown Book",
        bookAuthor: book?.author || "Unknown Author",
        userEmail: user?.email || "Unknown User",
        isOverdue: daysRemaining < 0 && res.status === "ACTIVE",
        daysRemaining
      };
    });
  };

  const applyFilters = () => {
    let filtered = [...reservations];

    // Search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(res =>
        res.bookTitle?.toLowerCase().includes(search) ||
        res.bookAuthor?.toLowerCase().includes(search) ||
        res.userEmail?.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(res => res.status === statusFilter);
    }

    // Overdue filter
    if (overdueFilter === "overdue") {
      filtered = filtered.filter(res => res.isOverdue);
    } else if (overdueFilter === "active") {
      filtered = filtered.filter(res => res.status === "ACTIVE" && !res.isOverdue);
    }

    // Sort by due date (overdue first, then by date)
    filtered.sort((a, b) => {
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    setFilteredReservations(filtered);
  };

  const handleUpdateStatus = async (reservationId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8080/api/reservations/${reservationId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        fetchAllData(); // Refresh data
      } else {
        setError("Failed to update reservation status");
      }
    } catch (err) {
      setError("Error updating reservation");
    }
  };

  const handleExtendDueDate = async (reservationId: number) => {
    if (!newDueDate) {
      setError("Please select a new due date");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8080/api/reservations/${reservationId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ dueDate: newDueDate })
      });

      if (res.ok) {
        setEditingReservation(null);
        setNewDueDate("");
        fetchAllData(); // Refresh data
      } else {
        setError("Failed to extend due date");
      }
    } catch (err) {
      setError("Error extending due date");
    }
  };

  const handleDeleteReservation = async (reservationId: number) => {
    if (!confirm("Are you sure you want to delete this reservation? This will make the book available again.")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8080/api/reservations/${reservationId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (res.ok) {
        fetchAllData(); // Refresh data
      } else {
        setError("Failed to delete reservation");
      }
    } catch (err) {
      setError("Error deleting reservation");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (reservation: EnrichedReservation) => {
    if (reservation.status === "RETURNED") {
      return (
        <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-white bg-gray-500 rounded-full">
          <CheckCircle className="w-3 h-3 mr-1" />
          Returned
        </span>
      );
    }

    if (reservation.isOverdue) {
      return (
        <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-white bg-red-500 rounded-full">
          <AlertCircle className="w-3 h-3 mr-1" />
          Overdue
        </span>
      );
    }

    if (reservation.daysRemaining !== undefined && reservation.daysRemaining <= 3) {
      return (
        <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-white bg-orange-500 rounded-full">
          <Clock className="w-3 h-3 mr-1" />
          Due Soon
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-white bg-green-500 rounded-full">
        <CheckCircle className="w-3 h-3 mr-1" />
        Active
      </span>
    );
  };

  const getStats = () => {
    const active = reservations.filter(r => r.status === "ACTIVE").length;
    const overdue = reservations.filter(r => r.isOverdue).length;
    const returned = reservations.filter(r => r.status === "RETURNED").length;
    const dueSoon = reservations.filter(r => 
      r.status === "ACTIVE" && 
      !r.isOverdue && 
      r.daysRemaining !== undefined && 
      r.daysRemaining <= 3
    ).length;

    return { active, overdue, returned, dueSoon };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          <p className="text-gray-600">Loading reservations...</p>
        </div>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="border-b shadow-md bg-gradient-to-r from-blue-600 to-blue-700">
  <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
    <div className="flex items-center space-x-4">
      {/* Icon */}
      <div className="p-3 shadow-sm bg-blue-500/30 backdrop-blur-sm rounded-xl">
        <Calendar className="text-white w-7 h-7" />
      </div>

      {/* Text */}
      <div>
        <h1 className="text-3xl font-bold tracking-wide text-white">
          Reservation Management
        </h1>
        <p className="mt-1 text-sm text-blue-100">
          Monitor and manage all book reservations
        </p>
      </div>
    </div>
  </div>
</div>


      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
          <div className="p-6 bg-white border-l-4 border-green-500 shadow-md rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{stats.active}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>

          <div className="p-6 bg-white border-l-4 border-red-500 shadow-md rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{stats.overdue}</p>
              </div>
              <AlertCircle className="w-12 h-12 text-red-500 opacity-20" />
            </div>
          </div>

          <div className="p-6 bg-white border-l-4 border-orange-500 shadow-md rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Due Soon</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{stats.dueSoon}</p>
              </div>
              <Clock className="w-12 h-12 text-orange-500 opacity-20" />
            </div>
          </div>

          <div className="p-6 bg-white border-l-4 border-gray-500 shadow-md rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Returned</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{stats.returned}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-gray-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center p-4 mb-6 space-x-3 border border-red-200 rounded-lg bg-red-50">
            <AlertCircle className="flex-shrink-0 w-6 h-6 text-red-600" />
            <div>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError("")}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="p-6 mb-8 bg-white shadow-md rounded-xl">
          <div className="flex items-center mb-4 space-x-2">
            <Filter className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Search
              </label>
              <div className="relative">
                <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <Input
                  placeholder="Search by book, author, or user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="RETURNED">Returned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Due Status
              </label>
              <Select value={overdueFilter} onValueChange={setOverdueFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="overdue">Overdue Only</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Reservations Table */}
        <div className="overflow-hidden bg-white shadow-md rounded-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">
                    Book
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">
                    User
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">
                    Reserved
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">
                    Due Date
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredReservations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="font-medium text-gray-600">No reservations found</p>
                      <p className="mt-1 text-sm text-gray-500">
                        Try adjusting your filters
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredReservations.map((reservation) => (
                    <tr key={reservation.id} className="transition-colors hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{reservation.bookTitle}</p>
                          <p className="text-sm text-gray-500">by {reservation.bookAuthor}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{reservation.userEmail}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700">{formatDate(reservation.reservationDate)}</p>
                      </td>
                      <td className="px-6 py-4">
                        {editingReservation === reservation.id ? (
                          <div className="flex items-center space-x-2">
                            <Input
                              type="date"
                              value={newDueDate}
                              onChange={(e) => setNewDueDate(e.target.value)}
                              className="w-40"
                              min={new Date().toISOString().split('T')[0]}
                            />
                            <button
                              onClick={() => handleExtendDueDate(reservation.id)}
                              className="px-3 py-1 text-xs text-white bg-green-600 rounded hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingReservation(null);
                                setNewDueDate("");
                              }}
                              className="px-3 py-1 text-xs text-gray-700 bg-gray-300 rounded hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm text-gray-700">{formatDate(reservation.dueDate)}</p>
                            {reservation.status === "ACTIVE" && reservation.daysRemaining !== undefined && (
                              <p className={`text-xs mt-1 ${
                                reservation.isOverdue ? "text-red-600 font-semibold" : 
                                reservation.daysRemaining <= 3 ? "text-orange-600" : 
                                "text-gray-500"
                              }`}>
                                {reservation.isOverdue 
                                  ? `${Math.abs(reservation.daysRemaining)} days overdue` 
                                  : `${reservation.daysRemaining} days remaining`}
                              </p>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(reservation)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {reservation.status === "ACTIVE" && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingReservation(reservation.id);
                                  setNewDueDate(reservation.dueDate);
                                }}
                                className="p-2 text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                                title="Extend due date"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(reservation.id, "RETURNED")}
                                className="px-3 py-1 text-xs text-white transition-colors bg-green-600 rounded hover:bg-green-700"
                              >
                                Mark Returned
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteReservation(reservation.id)}
                            className="p-2 text-red-600 transition-colors rounded-lg hover:bg-red-50"
                            title="Delete reservation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-center text-gray-600">
          Showing {filteredReservations.length} of {reservations.length} reservations
        </div>
      </div>
    </div>
  );
}