const API_URL = import.meta.env.VITE_API_URL;

const BOOKS_ENDPOINT = `${API_URL}/library`;

export async function getBooks() {
  const token = localStorage.getItem("token");

  const response = await fetch(BOOKS_ENDPOINT, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || "Impossible de récupérer les livres."
    );
  }

  // On accepte une liste directe ou un objet contenant "books".
  const livres = Array.isArray(data) ? data : data.books;

  if (!Array.isArray(livres)) {
    throw new Error("Le format des livres reçu par l'API est invalide.");
  }

  return livres;
}
