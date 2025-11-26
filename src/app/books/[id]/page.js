export default async function BookDetails({ params }) {
  const { id } = params;

  // Call your Spring Boot backend
  const res = await fetch(`http://localhost:8080/api/books/${id}`, {
    cache: "no-store"
  });

  if (!res.ok) {
    return <h1>Error loading book</h1>;
  }

  const book = await res.json();

  return (
    <div style={{ padding: "20px" }}>
      <h1>{book.title}</h1>
      <p><strong>Author:</strong> {book.author}</p>
      <p><strong>Language:</strong> {book.language}</p>
      <p><strong>Genre:</strong> {book.genre}</p>
      <p><strong>Status:</strong> {book.status}</p>

      {book.image_url && (
        <img src={book.image_url} alt="cover" width="200" />
      )}
    </div>
  );
}
