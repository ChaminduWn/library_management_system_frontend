import Link from "next/link";

export default async function Books() {
  const res = await fetch("http://localhost:8080/api/books", {
    cache: "no-store",
  });

  const books = await res.json();

  return (
    <div style={{ padding: "20px" }}>
      <h1>All Books</h1>

      {books.map(book => (
        <div key={book.id} style={{ marginBottom: "20px" }}>
          <Link href={`/books/${book.id}`}>
            <h2>{book.title}</h2>
          </Link>
          <p>{book.author}</p>
        </div>
      ))}
    </div>
  );
}
