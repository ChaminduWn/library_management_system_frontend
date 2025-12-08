"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Book {
  id: number;
  title: string;
  author: string;
  genre?: string;
  language?: string;
  status: "AVAILABLE" | "RESERVED";
  imageUrl?: string;
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

  // Fetch all books on mount
  useEffect(() => {
    fetchBooks();
  }, []);

  // Apply filters whenever books or filters change
  useEffect(() => {
    applyFilters();
  }, [allBooks, filters]);

  const fetchBooks = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/books");
      if (res.ok) {
        const data = await res.json();
        setAllBooks(data);
        
        // Extract unique categories from books
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

    // Filter by category
    if (filters.category && filters.category !== "all") {
      result = result.filter(
        (book) => book.category?.name === filters.category
      );
    }

    // Filter by author (case-insensitive partial match)
    if (filters.author.trim()) {
      const authorSearch = filters.author.trim().toLowerCase();
      result = result.filter((book) =>
        book.author.toLowerCase().includes(authorSearch)
      );
    }

    // Filter by genre (case-insensitive partial match)
    if (filters.genre.trim()) {
      const genreSearch = filters.genre.trim().toLowerCase();
      result = result.filter(
        (book) => book.genre && book.genre.toLowerCase().includes(genreSearch)
      );
    }

    // Filter by language (case-insensitive partial match)
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

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Browse Books</h1>
        <button
          onClick={clearFilters}
          className="px-4 py-2 text-sm text-gray-600 border rounded hover:bg-gray-50"
        >
          Clear Filters
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Select
          value={filters.category || "all"}
          onValueChange={(v) => handleFilterChange("category", v)}
        >
          <SelectTrigger>
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

        <Input
          placeholder="Search by Author"
          value={filters.author}
          onChange={(e) => handleFilterChange("author", e.target.value)}
        />

        <Input
          placeholder="Search by Genre"
          value={filters.genre}
          onChange={(e) => handleFilterChange("genre", e.target.value)}
        />

        <Input
          placeholder="Search by Language"
          value={filters.language}
          onChange={(e) => handleFilterChange("language", e.target.value)}
        />
      </div>

      <div className="text-sm text-gray-600">
        Showing {filteredBooks.length} of {allBooks.length} books
      </div>

      <div className="space-y-4">
        {filteredBooks.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No books found matching your filters.</p>
            <button
              onClick={clearFilters}
              className="mt-2 text-blue-600 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          filteredBooks.map((book) => (
            <div
              key={book.id}
              className="flex items-start p-4 space-x-4 transition-shadow border rounded-lg shadow-sm hover:shadow-md"
            >
              {book.imageUrl && (
                <img
                  src={book.imageUrl}
                  alt={book.title}
                  className="object-cover w-24 rounded h-36"
                />
              )}
              <div className="flex-1">
                <Link href={`/books/${book.id}`}>
                  <h2 className="text-xl font-semibold text-blue-600 hover:underline">
                    {book.title}
                  </h2>
                </Link>
                <p className="mt-1 text-gray-700">
                  <strong>Author:</strong> {book.author}
                </p>
                {book.genre && (
                  <p className="text-gray-600">
                    <strong>Genre:</strong> {book.genre}
                  </p>
                )}
                {book.language && (
                  <p className="text-gray-600">
                    <strong>Language:</strong> {book.language}
                  </p>
                )}
                {book.category && (
                  <p className="text-gray-600">
                    <strong>Category:</strong> {book.category.name}
                  </p>
                )}
                <p
                  className={`mt-2 font-medium ${
                    book.status === "AVAILABLE"
                      ? "text-green-600"
                      : "text-orange-600"
                  }`}
                >
                  Status: {book.status}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}