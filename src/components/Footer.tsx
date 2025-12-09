'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-6 mt-auto text-gray-300 bg-gray-800">
      <div className="container px-4 mx-auto">
        
        {/* Main Footer Content */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          
          {/* Left: Logo & Copyright */}
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 text-white rounded p-1.5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-sm">
              © {currentYear} Library Management
            </span>
          </div>

          {/* Center: Quick Links */}
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/about" className="transition-colors hover:text-white">
              Books
            </Link>
            <Link href="/about" className="transition-colors hover:text-white">
              About
            </Link>
            <Link href="/about" className="transition-colors hover:text-white">
              Contact
            </Link>
            <Link href="/about" className="transition-colors hover:text-white">
              FAQ
            </Link>
          </div>

          {/* Right: Contact */}
          <div className="text-sm text-center md:text-right">
            <a href="mailto:info@library.lk" className="transition-colors hover:text-white">
              info@library.lk
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}