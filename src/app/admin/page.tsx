"use client";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext"; 
import { useRouter } from "next/navigation"; 
import Link from "next/link";

interface Stats {
  totalBooks: number;
  totalUsers: number;
  
  blacklistedUsers: number;
}

interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  availableCopies: number;
  totalCopies: number;
}

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  isBlacklisted: boolean;
}

export default function AdminDashboard() {
  const authContext = useContext(AuthContext);
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalBooks: 0,
    totalUsers: 0,
    
    blacklistedUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!authContext) {
    return null;
  }

  const { auth } = authContext;

  // Fetch dashboard statistics
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the auth token (adjust based on your auth implementation)
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

      // Fetch books data
      const booksResponse = await fetch('http://localhost:8080/api/books', { headers });
      const books: Book[] = await booksResponse.json();

      // Fetch users data
      const usersResponse = await fetch('http://localhost:8080/api/users', { headers });
      const users: User[] = await usersResponse.json();

      // Calculate statistics
      const totalBooks = books.length;
      const totalUsers = users.filter(u => u.role === 'USER').length;
      const blacklistedUsers = users.filter(u => u.isBlacklisted).length;
      
      

      setStats({
        totalBooks,
        totalUsers,
        
        blacklistedUsers
      });

      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!auth.isLoggedIn || auth.role !== "LIBRARIAN") {
      router.push("/login");
    } else {
      fetchDashboardData();
    }
  }, [auth]);

  if (!auth.isLoggedIn || auth.role !== "LIBRARIAN") {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your library operations efficiently</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 mb-6 text-red-700 bg-red-100 border border-red-400 rounded-lg">
            <p className="font-medium">Error: {error}</p>
            <button 
              onClick={fetchDashboardData}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-6 bg-white border-l-4 border-blue-500 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm font-medium text-gray-600">Total Books</p>
                <h3 className="text-3xl font-bold text-gray-800">{stats.totalBooks}</h3>
              </div>
              <div className="p-4 bg-blue-100 rounded-full">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border-l-4 border-green-500 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm font-medium text-gray-600">Total Users</p>
                <h3 className="text-3xl font-bold text-gray-800">{stats.totalUsers}</h3>
              </div>
              <div className="p-4 bg-green-100 rounded-full">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border-l-4 border-red-500 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm font-medium text-gray-600">Blacklisted Users</p>
                <h3 className="text-3xl font-bold text-gray-800">{stats.blacklistedUsers}</h3>
              </div>
              <div className="p-4 bg-red-100 rounded-full">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Management Cards */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
          <Link href="/admin/books" className="group">
            <div className="p-8 transition-all duration-300 bg-white border-t-4 border-blue-500 rounded-lg shadow-lg hover:shadow-xl group-hover:scale-105">
              <div className="flex flex-col items-center text-center">
                <div className="p-4 mb-4 transition-colors bg-blue-100 rounded-full group-hover:bg-blue-200">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-800">Book Management</h3>
                <p className="mb-4 text-sm text-gray-600">Add, edit, and manage book inventory</p>
                <div className="flex items-center font-medium text-blue-600 transition-transform group-hover:translate-x-2">
                  Manage Books
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/categories" className="group">
            <div className="p-8 transition-all duration-300 bg-white border-t-4 border-green-500 rounded-lg shadow-lg hover:shadow-xl group-hover:scale-105">
              <div className="flex flex-col items-center text-center">
                <div className="p-4 mb-4 transition-colors bg-green-100 rounded-full group-hover:bg-green-200">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-800">Category Management</h3>
                <p className="mb-4 text-sm text-gray-600">Organize books by categories</p>
                <div className="flex items-center font-medium text-green-600 transition-transform group-hover:translate-x-2">
                  Manage Categories
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/admin/users" className="group">
            <div className="p-8 transition-all duration-300 bg-white border-t-4 border-purple-500 rounded-lg shadow-lg hover:shadow-xl group-hover:scale-105">
              <div className="flex flex-col items-center text-center">
                <div className="p-4 mb-4 transition-colors bg-purple-100 rounded-full group-hover:bg-purple-200">
                  <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-800">User Management</h3>
                <p className="mb-4 text-sm text-gray-600">Manage library members and access</p>
                <div className="flex items-center font-medium text-purple-600 transition-transform group-hover:translate-x-2">
                  Manage Users
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="p-6 bg-white rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Quick Actions</h2>
            <button 
              onClick={fetchDashboardData}
              className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 transition-colors rounded-lg bg-blue-50 hover:bg-blue-100"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Data
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Link href="/admin/books/add" className="flex items-center justify-center p-4 transition-colors rounded-lg bg-blue-50 hover:bg-blue-100">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm font-medium text-blue-600">Add Book</span>
            </Link>
            <Link href="/admin/users/add" className="flex items-center justify-center p-4 transition-colors rounded-lg bg-green-50 hover:bg-green-100">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span className="text-sm font-medium text-green-600">Add User</span>
            </Link>
            <Link href="/admin/reports" className="flex items-center justify-center p-4 transition-colors rounded-lg bg-purple-50 hover:bg-purple-100">
              <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium text-purple-600">Reports</span>
            </Link>
            <Link href="/admin/settings" className="flex items-center justify-center p-4 transition-colors rounded-lg bg-yellow-50 hover:bg-yellow-100">
              <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium text-yellow-600">Settings</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}