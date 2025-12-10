"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Calendar, Clock, User, Tag, Globe, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

interface Book {
  id: number;
  title: string;
  author: string;
  genre?: string;
  language?: string;
  status: "AVAILABLE" | "RESERVED";
  imageUrl?: string;
  image_url?: string;
  isbn?: string;
  category?: { id: number; name: string };
}

export default function BookDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params); // Unwrap the Promise
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reserving, setReserving] = useState(false);
  const [showReservationOptions, setShowReservationOptions] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState(false);

  useEffect(() => {
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/books/${id}`);
      if (res.ok) {
        const data = await res.json();
        setBook(data);
      } else {
        setError("Failed to load book details");
      }
    } catch (err) {
      setError("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  const handleReservation = async (days: number) => {
    setReserving(true);
    setError("");

    try {
      // Get JWT token from localStorage
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("Please login to reserve a book");
        setReserving(false);
        // Optionally redirect to login
        // router.push('/login');
        return;
      }

      // Decode JWT to get user ID (simple base64 decode)
      let userId: number | null = null;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.userId || payload.id || payload.sub;
        console.log("Decoded user ID:", userId);
        console.log("Full token payload:", payload);
      } catch (e) {
        console.error("Failed to decode token:", e);
        setError("Invalid authentication token. Please login again.");
        setReserving(false);
        return;
      }

      if (!userId) {
        setError("User ID not found. Please login again.");
        setReserving(false);
        return;
      }

      // Calculate dates
      const reservationDate = new Date().toISOString().split('T')[0];
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + days);
      const dueDateStr = dueDate.toISOString().split('T')[0];

      const reservationData = {
        userId: userId,
        bookId: book?.id,
        reservationDate: reservationDate,
        dueDate: dueDateStr,
        status: "ACTIVE"
      };

      console.log("Sending reservation:", reservationData);
      console.log("Token:", token);

      const res = await fetch("http://localhost:8080/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(reservationData)
      });

      console.log("Response status:", res.status);

      if (res.ok) {
        setReservationSuccess(true);
        setShowReservationOptions(false);
        // Refresh book data to show updated status
        await fetchBook();
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setReservationSuccess(false);
        }, 3000);
      } else {
        const errorData = await res.text();
        console.error("Reservation error:", errorData);
        
        if (res.status === 403) {
          setError("Access denied. Please make sure you're logged in as a regular user.");
        } else if (res.status === 401) {
          setError("Your session has expired. Please login again.");
        } else {
          setError(errorData || "Failed to reserve book");
        }
      }
    } catch (err) {
      console.error("Reservation error:", err);
      setError("Error processing reservation");
    } finally {
      setReserving(false);
    }
  };

  const getBookImage = (book: Book) => {
    const imageUrl = book.imageUrl || book.image_url;
    if (!imageUrl) return null;
    
    if (imageUrl.startsWith('/images/')) {
      return `http://localhost:8080${imageUrl}`;
    }
    
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    return `http://localhost:8080/${imageUrl}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          <p className="text-gray-600">Loading book details...</p>
        </div>
      </div>
    );
  }

  if (error && !book) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Error</h2>
          <p className="mb-4 text-gray-600">{error}</p>
          <button
            onClick={() => router.push('/books')}
            className="px-6 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Back to Books
          </button>
        </div>
      </div>
    );
  }

  if (!book) return null;

  const imageUrl = getBookImage(book);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <button
            onClick={() => router.push('/books')}
            className="flex items-center space-x-2 text-gray-600 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Library</span>
          </button>
        </div>
      </div>

      {/* Success Message */}
      {reservationSuccess && (
        <div className="px-4 pt-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center p-4 space-x-3 border border-green-200 rounded-lg bg-green-50">
            <CheckCircle className="flex-shrink-0 w-6 h-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-900">Reservation Successful!</h3>
              <p className="text-sm text-green-700">The book has been reserved for you.</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="overflow-hidden bg-white shadow-lg rounded-xl">
          <div className="grid grid-cols-1 gap-8 p-8 lg:grid-cols-2">
            {/* Left Column - Book Cover */}
            <div className="flex flex-col items-center">
              <div className="w-full max-w-md">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={book.title}
                    className="w-full h-auto rounded-lg shadow-xl"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg shadow-xl flex items-center justify-center">
                    <div className="p-8 text-center">
                      <BookOpen className="w-24 h-24 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-medium text-gray-600">{book.title}</p>
                    </div>
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="mt-6 text-center">
                  <span
                    className={`inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold shadow-lg ${
                      book.status === "AVAILABLE"
                        ? "bg-green-500 text-white"
                        : "bg-orange-500 text-white"
                    }`}
                  >
                    {book.status === "AVAILABLE" ? (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Available for Reservation
                      </>
                    ) : (
                      <>
                        <Clock className="w-5 h-5 mr-2" />
                        Currently Reserved
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column - Book Details */}
            <div className="flex flex-col">
              <div className="flex-1">
                <h1 className="mb-4 text-4xl font-bold text-gray-900">{book.title}</h1>
                
                <div className="mb-8 space-y-4">
                  <div className="flex items-start space-x-3">
                    <User className="flex-shrink-0 w-5 h-5 mt-1 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Author</p>
                      <p className="text-lg text-gray-900">{book.author}</p>
                    </div>
                  </div>

                  {book.category && (
                    <div className="flex items-start space-x-3">
                      <Tag className="flex-shrink-0 w-5 h-5 mt-1 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Category</p>
                        <span className="inline-block px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-full">
                          {book.category.name}
                        </span>
                      </div>
                    </div>
                  )}

                  {book.genre && (
                    <div className="flex items-start space-x-3">
                      <BookOpen className="flex-shrink-0 w-5 h-5 mt-1 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Genre</p>
                        <p className="text-lg text-gray-900">{book.genre}</p>
                      </div>
                    </div>
                  )}

                  {book.language && (
                    <div className="flex items-start space-x-3">
                      <Globe className="flex-shrink-0 w-5 h-5 mt-1 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Language</p>
                        <p className="text-lg text-gray-900">{book.language}</p>
                      </div>
                    </div>
                  )}

                  {book.isbn && (
                    <div className="flex items-start space-x-3">
                      <Tag className="flex-shrink-0 w-5 h-5 mt-1 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">ISBN</p>
                        <p className="font-mono text-lg text-gray-900">{book.isbn}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Reservation Section */}
              {book.status === "AVAILABLE" && (
                <div className="pt-6 border-t">
                  {!showReservationOptions ? (
                    <button
                      onClick={() => setShowReservationOptions(true)}
                      className="flex items-center justify-center w-full py-4 space-x-2 text-lg font-semibold text-white transition-colors bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700"
                    >
                      <Calendar className="w-6 h-6" />
                      <span>Reserve This Book</span>
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="mb-4 text-lg font-semibold text-gray-900">
                        Select Reservation Period
                      </h3>
                      
                      <button
                        onClick={() => handleReservation(7)}
                        disabled={reserving}
                        className="w-full py-3 font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        7 Days
                      </button>
                      
                      <button
                        onClick={() => handleReservation(14)}
                        disabled={reserving}
                        className="w-full py-3 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        14 Days
                      </button>
                      
                      <button
                        onClick={() => handleReservation(21)}
                        disabled={reserving}
                        className="w-full py-3 font-medium text-white transition-colors bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        21 Days
                      </button>
                      
                      <button
                        onClick={() => setShowReservationOptions(false)}
                        disabled={reserving}
                        className="w-full py-3 font-medium text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>

                      {reserving && (
                        <div className="flex items-center justify-center space-x-2 text-blue-600">
                          <div className="w-5 h-5 border-2 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                          <span>Processing reservation...</span>
                        </div>
                      )}
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center p-3 mt-4 space-x-2 border border-red-200 rounded-lg bg-red-50">
                      <AlertCircle className="flex-shrink-0 w-5 h-5 text-red-600" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}
                </div>
              )}

              {book.status === "RESERVED" && (
                <div className="pt-6 border-t">
                  <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                    <p className="font-medium text-orange-800">
                      This book is currently reserved by another user.
                    </p>
                    <p className="mt-1 text-sm text-orange-600">
                      Check back later for availability.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}