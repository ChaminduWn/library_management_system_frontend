'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  User, 
  LogOut, 
  Menu, 
  LayoutDashboard, 
  Settings, 
  Users, 
  FolderOpen,
  BookMarked,
  Info
} from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const { auth, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getUserInitials = () => {
    const email = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  };

  const getUserEmail = () => {
    return typeof window !== 'undefined' ? localStorage.getItem('userEmail') || 'User' : 'User';
  };

  const navItems = auth.role === 'LIBRARIAN' 
    ? [
        { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { label: 'Books Management', path: '/admin/books', icon: BookMarked },
        { label: 'Categories', path: '/admin/categories', icon: FolderOpen },
        { label: 'Users', path: '/admin/users', icon: Users },
        { label: 'Reservations', path: '/admin/reservation', icon: BookOpen },

        
      ]
    : [
        { label: 'Books', path: '/books', icon: BookOpen },
        { label: 'About', path: '/about', icon: Info },
      ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => router.push('/')}
          >
            <div className="relative p-2 transition-all duration-300 shadow-lg bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl group-hover:shadow-xl group-hover:scale-105">
              <BookOpen className="w-6 h-6 text-white" />
              <div className="absolute inset-0 transition-opacity opacity-0 bg-white/20 rounded-xl group-hover:opacity-100" />
            </div>
            <div>
              <h1 className="text-xl font-bold transition-colors text-slate-900 group-hover:text-blue-600">
                Library Management
              </h1>
              <p className="text-xs text-slate-500">Digital Library System</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          {auth.isLoggedIn && (
            <nav className="items-center hidden space-x-1 md:flex">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.path}
                    variant="ghost"
                    onClick={() => router.push(item.path)}
                    className="gap-2 text-slate-700 hover:text-blue-600 hover:bg-blue-50"
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
          )}

          {/* User Section */}
          {auth.isLoggedIn ? (
            <div className="flex items-center space-x-3">
              {/* Desktop User Menu */}
              <div className="hidden md:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 gap-2 px-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="font-semibold text-white bg-gradient-to-br from-blue-600 to-blue-700">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium text-slate-900">{getUserEmail()}</span>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs h-5 ${
                            auth.role === 'LIBRARIAN' 
                              ? 'bg-purple-100 text-purple-700 hover:bg-purple-100' 
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                          }`}
                        >
                          {auth.role === 'LIBRARIAN' ? '👨‍💼 Librarian' : '👤 Member'}
                        </Badge>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium text-slate-900">{getUserEmail()}</p>
                        <p className="text-xs text-slate-500">
                          {auth.role === 'LIBRARIAN' ? 'Librarian Account' : 'Member Account'}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/profile')} className="cursor-pointer">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Mobile Menu */}
              <div className="md:hidden">
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="w-6 h-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                    <SheetHeader>
                      <SheetTitle className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="text-lg font-semibold text-white bg-gradient-to-br from-blue-600 to-blue-700">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start">
                          <span className="text-base font-semibold">{getUserEmail()}</span>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${
                              auth.role === 'LIBRARIAN' 
                                ? 'bg-purple-100 text-purple-700' 
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {auth.role === 'LIBRARIAN' ? '👨‍💼 Librarian' : '👤 Member'}
                          </Badge>
                        </div>
                      </SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col mt-6 space-y-2">
                      {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Button
                            key={item.path}
                            variant="ghost"
                            onClick={() => {
                              router.push(item.path);
                              setMobileMenuOpen(false);
                            }}
                            className="justify-start h-12 gap-3 text-base"
                          >
                            <Icon className="w-5 h-5" />
                            {item.label}
                          </Button>
                        );
                      })}
                      <div className="my-2 border-t" />
                      <Button
                        variant="ghost"
                        onClick={() => {
                          router.push('/profile');
                          setMobileMenuOpen(false);
                        }}
                        className="justify-start h-12 gap-3 text-base"
                      >
                        <User className="w-5 h-5" />
                        Profile
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          router.push('/settings');
                          setMobileMenuOpen(false);
                        }}
                        className="justify-start h-12 gap-3 text-base"
                      >
                        <Settings className="w-5 h-5" />
                        Settings
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="justify-start h-12 gap-3 text-base text-red-600 hover:text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-5 h-5" />
                        Logout
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                onClick={() => router.push('/login')}
                className="hidden sm:flex"
              >
                Login
              </Button>
              <Button
                onClick={() => router.push('/register')}
                className="transition-all shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl"
              >
                Register
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}