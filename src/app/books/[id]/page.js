export default async function BookDetails({ params }) {
  const { id } = params;

  const res = await fetch(`http://localhost:8080/api/books/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) return <h1 className="p-6">Error loading book</h1>;

  const book = await res.json();

  return (
    <div className="p-6 space-y-3">
      <h1 className="text-2xl font-bold">{book.title}</h1>

      <div className="text-gray-700 space-y-1">
        <p><strong>Author:</strong> {book.author}</p>
        <p><strong>Language:</strong> {book.language}</p>
        <p><strong>Genre:</strong> {book.genre}</p>
        <p><strong>Status:</strong> {book.status}</p>
      </div>

      {book.image_url && (
        <img src={book.image_url} alt="cover" className="w-48 mt-4" />
      )}
    </div>
  );
}
