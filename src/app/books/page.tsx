import Link from "next/link";

interface Book {
  id: number;
  title: string;
  author: string;
}

export default async function Books() {
  const res = await fetch("http://localhost:8080/api/books", {
    cache: "no-store",
  });

  const books: Book[] = await res.json();

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold">All Books</h1>

      <div className="space-y-4">
        {books.map((book: Book) => (
          <div key={book.id} className="border p-4 rounded-lg shadow-sm">
            <Link href={`/books/${book.id}`}>
              <h2 className="text-xl font-semibold text-blue-600 hover:underline cursor-pointer">
                {book.title}
              </h2>
            </Link>
            <p className="text-gray-700">{book.author}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

