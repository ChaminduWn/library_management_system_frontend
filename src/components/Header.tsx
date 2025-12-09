'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const router = useRouter();
  const { auth, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="text-white bg-blue-600 shadow-lg">
      <div className="container px-4 py-4 mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="p-2 text-blue-600 bg-white rounded-lg">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold cursor-pointer" onClick={() => router.push('/')}>
                Library Management
              </h1>
              <p className="text-xs text-blue-100">Your Digital Library System</p>
            </div>
          </div>

          {/* Navigation */}
          {auth.isLoggedIn && (
            <nav className="items-center hidden space-x-6 md:flex">
              <button
                onClick={() => router.push('/books')}
                className="font-medium transition-colors hover:text-blue-200"
              >
                Books
              </button>
              
              
              {auth.role === 'LIBRARIAN' && (
                <>
                  <button
                    onClick={() => router.push('/admin')}
                    className="font-medium transition-colors hover:text-blue-200"
                  >
                     Dashboard
                  </button>

                   <button
                    onClick={() => router.push('/admin/books')}
                    className="font-medium transition-colors hover:text-blue-200"
                  >
                    Books
                  </button>

                  <button
                    onClick={() => router.push('/admin/categories')}
                    className="font-medium transition-colors hover:text-blue-200"
                  >
                    Category
                  </button>
                  <button
                    onClick={() => router.push('/admin/users')}
                    className="font-medium transition-colors hover:text-blue-200"
                  >
                    Users
                  </button>
                </>
              )}

              <button
                onClick={() => router.push('/about')}
                className="font-medium transition-colors hover:text-blue-200"
              >
                About
              </button>
              
              <button
                onClick={() => router.push('/profile')}
                className="font-medium transition-colors hover:text-blue-200"
              >
                Profile
              </button>
            </nav>
          )}

          {/* User Info and Logout */}
          {auth.isLoggedIn ? (
            <div className="flex items-center space-x-4">
              <div className="hidden text-right sm:block">
                <div className="text-sm font-medium">
                  {typeof window !== 'undefined' && localStorage.getItem('userEmail') || 'User'}
                </div>
                <div className="text-xs text-blue-200">
                  {auth.role === 'LIBRARIAN' ? '👨‍💼 Librarian' : '👤 Member'}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 space-x-2 font-medium transition-colors bg-blue-700 rounded-lg hover:bg-blue-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push('/login')}
                className="px-4 py-2 font-medium transition-colors bg-blue-700 rounded-lg hover:bg-blue-800"
              >
                Login
              </button>
              <button
                onClick={() => router.push('/register')}
                className="px-4 py-2 font-medium text-blue-600 transition-colors bg-white rounded-lg hover:bg-blue-50"
              >
                Register
              </button>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        {auth.isLoggedIn && (
          <nav className="flex flex-wrap gap-3 mt-4 md:hidden">
            <button
              onClick={() => router.push('/books')}
              className="text-sm bg-blue-700 hover:bg-blue-800 px-3 py-1.5 rounded transition-colors"
            >
              Books
            </button>
            {auth.role === 'LIBRARIAN' && (
              <>
                <button
                  onClick={() => router.push('/admin')}
                  className="text-sm bg-blue-700 hover:bg-blue-800 px-3 py-1.5 rounded transition-colors"
                >
                  Manage Books
                </button>
                <button
                  onClick={() => router.push('/admin/users')}
                  className="text-sm bg-blue-700 hover:bg-blue-800 px-3 py-1.5 rounded transition-colors"
                >
                  Manage Users
                </button>
              </>
            )}
            <button
              onClick={() => router.push('/profile')}
              className="text-sm bg-blue-700 hover:bg-blue-800 px-3 py-1.5 rounded transition-colors"
            >
              Profile
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}