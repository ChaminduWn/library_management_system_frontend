"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, BookOpen, Filter, X } from "lucide-react";

interface Book {
  id: number;
  title: string;
  author: string;
  genre?: string;
  language?: string;
  status: "AVAILABLE" | "RESERVED";
  imageUrl?: string;
  image_url?: string; // Alternative naming
  category?: { id: number; name: string };
}

export default function UserBookDiscovery() {
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    category: "",
    author: "",
    genre: "",
    language: "",
  });
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allBooks, filters]);

  const fetchBooks = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/books");
      if (res.ok) {
        const data = await res.json();
        setAllBooks(data);
        
        const uniqueCategories = [...new Set(
          data
            .map((book: Book) => book.category?.name)
            .filter((cat: string | undefined) => cat !== undefined)
        )] as string[];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  const applyFilters = () => {
    let result = [...allBooks];

    if (filters.category && filters.category !== "all") {
      result = result.filter(
        (book) => book.category?.name === filters.category
      );
    }

    if (filters.author.trim()) {
      const authorSearch = filters.author.trim().toLowerCase();
      result = result.filter((book) =>
        book.author.toLowerCase().includes(authorSearch)
      );
    }

    if (filters.genre.trim()) {
      const genreSearch = filters.genre.trim().toLowerCase();
      result = result.filter(
        (book) => book.genre && book.genre.toLowerCase().includes(genreSearch)
      );
    }

    if (filters.language.trim()) {
      const languageSearch = filters.language.trim().toLowerCase();
      result = result.filter(
        (book) =>
          book.language && book.language.toLowerCase().includes(languageSearch)
      );
    }

    setFilteredBooks(result);
  };

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      author: "",
      genre: "",
      language: "",
    });
  };

  const hasActiveFilters = () => {
    return filters.category || filters.author || filters.genre || filters.language;
  };

  // Handle multiple possible image URL formats and prepend base URL if needed
  const getBookImage = (book: Book) => {
    const imageUrl = book.imageUrl || book.image_url;
    if (!imageUrl) return null;
    
    // If URL starts with /images/, prepend the backend URL
    if (imageUrl.startsWith('/images/')) {
      return `http://localhost:8080${imageUrl}`;
    }
    
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // Otherwise, assume it's a relative path and prepend backend URL
    return `http://localhost:8080/${imageUrl}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Book Library</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Discover your next great read
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 space-x-2 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">
                {showFilters ? "Hide" : "Show"} Filters
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Filters Section */}
        {showFilters && (
          <div className="p-6 mb-8 bg-white border border-gray-100 shadow-md rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center text-lg font-semibold text-gray-900">
                <Search className="w-5 h-5 mr-2 text-blue-600" />
                Search & Filter
              </h2>
              {hasActiveFilters() && (
                <button
                  onClick={clearFilters}
                  className="flex items-center space-x-1 text-sm font-medium text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Category
                </label>
                <Select
                  value={filters.category || "all"}
                  onValueChange={(v) => handleFilterChange("category", v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Author
                </label>
                <Input
                  placeholder="Search by author..."
                  value={filters.author}
                  onChange={(e) => handleFilterChange("author", e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Genre
                </label>
                <Input
                  placeholder="Search by genre..."
                  value={filters.genre}
                  onChange={(e) => handleFilterChange("genre", e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Language
                </label>
                <Input
                  placeholder="Search by language..."
                  value={filters.language}
                  onChange={(e) => handleFilterChange("language", e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{filteredBooks.length}</span> of{" "}
            <span className="font-semibold text-gray-900">{allBooks.length}</span> books
            {hasActiveFilters() && (
              <span className="px-2 py-1 ml-2 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                Filtered
              </span>
            )}
          </div>
        </div>

        {/* Books Grid */}
        {filteredBooks.length === 0 ? (
          <div className="p-12 text-center bg-white shadow-md rounded-xl">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              No books found
            </h3>
            <p className="mb-4 text-gray-600">
              Try adjusting your filters to find more books
            </p>
            {hasActiveFilters() && (
              <button
                onClick={clearFilters}
                className="px-6 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredBooks.map((book) => {
              const imageUrl = getBookImage(book);
              return (
                <Link
                  key={book.id}
                  href={`/books/${book.id}`}
                  className="group"
                >
                  <div className="flex flex-col h-full overflow-hidden transition-all duration-300 bg-white border border-gray-100 shadow-md rounded-xl hover:shadow-xl">
                    {/* Book Cover */}
                    <div className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={book.title}
                          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            // Fallback if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.innerHTML = `
                              <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                                <div class="text-center p-4">
                                  <svg class="w-16 h-16 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                  </svg>
                                  <p class="text-sm font-medium text-gray-600">${book.title}</p>
                                </div>
                              </div>
                            `;
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-100 to-purple-100">
                          <div className="p-4 text-center">
                            <BookOpen className="w-16 h-16 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm font-medium text-gray-600 line-clamp-2">
                              {book.title}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <div className="absolute top-3 right-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${
                            book.status === "AVAILABLE"
                              ? "bg-green-500 text-white"
                              : "bg-orange-500 text-white"
                          }`}
                        >
                          {book.status}
                        </span>
                      </div>
                    </div>

                    {/* Book Details */}
                    <div className="flex flex-col flex-1 p-5">
                      <h3 className="mb-2 text-lg font-bold text-gray-900 transition-colors line-clamp-2 group-hover:text-blue-600">
                        {book.title}
                      </h3>
                      
                      <p className="mb-3 text-sm text-gray-600">
                        by <span className="font-medium text-gray-900">{book.author}</span>
                      </p>

                      <div className="mt-auto space-y-1 text-sm text-gray-600">
                        {book.category && (
                          <div className="flex items-center">
                            <span className="w-20 font-medium">Category:</span>
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                              {book.category.name}
                            </span>
                          </div>
                        )}
                        {book.genre && (
                          <div className="flex items-center">
                            <span className="w-20 font-medium">Genre:</span>
                            <span>{book.genre}</span>
                          </div>
                        )}
                        {book.language && (
                          <div className="flex items-center">
                            <span className="w-20 font-medium">Language:</span>
                            <span>{book.language}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}