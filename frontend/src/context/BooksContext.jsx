
import { createContext, useContext, useEffect, useState } from "react";
import { getBooks } from "../services/bookService";

const BooksContext = createContext(null);

const statutsLecture = ["À lire", "En cours", "Lu"];

const livresExemple = [
  {
    id: 1,
    titre: "Le Petit Prince",
    auteur: "Antoine de Saint-Exupéry",
    genre: "Conte philosophique",
    couverture: "https://covers.openlibrary.org/b/id/8231856-L.jpg",
    statut: "À lire",
  },
  {
    id: 2,
    titre: "Orgueil et Préjugés",
    auteur: "Jane Austen",
    genre: "Roman sentimental",
    couverture: "https://covers.openlibrary.org/b/id/8231996-L.jpg",
    statut: "En cours",
  },
  {
    id: 3,
    titre: "Les Misérables",
    auteur: "Victor Hugo",
    genre: "Roman historique",
    couverture: "https://covers.openlibrary.org/b/id/8235104-L.jpg",
    statut: "Lu",
  },
];

export function BooksProvider({ children }) {
  const [livres, setLivres] = useState(livresExemple);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let actif = true;

    async function chargerLivres() {
      try {
        const data = await getBooks();

        if (actif) {
          setLivres(
            data.map((livre) => ({
              ...livre,
              statut: statutsLecture.includes(livre.statut)
                ? livre.statut
                : "À lire",
            }))
          );
          setError("");
        }
      } catch {
        if (actif) {
          setError(
            "Impossible de charger les livres depuis l'API. Les exemples sont affichés."
          );
        }
      } finally {
        if (actif) setLoading(false);
      }
    }

    chargerLivres();

    return () => {
      actif = false;
    };
  }, []);

  function changerStatut(id, nouveauStatut) {
    if (!statutsLecture.includes(nouveauStatut)) return;

    setLivres((livresActuels) =>
      livresActuels.map((livre) =>
        livre.id === id ? { ...livre, statut: nouveauStatut } : livre
      )
    );
  }

  function supprimerLivre(id) {
    setLivres((livresActuels) =>
      livresActuels.filter((livre) => livre.id !== id)
    );
  }

  return (
    <BooksContext.Provider
      value={{
        livres,
        loading,
        error,
        changerStatut,
        supprimerLivre,
      }}
    >
      {children}
    </BooksContext.Provider>
  );
}

export function useBooks() {
  const context = useContext(BooksContext);

  if (!context) {
    throw new Error("useBooks doit être utilisé dans BooksProvider.");
  }

  return context;
}
