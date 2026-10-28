import { createContext, useContext, useEffect, useState } from "react";

const BooksContext = createContext(null);

const statutsLecture = ["À lire", "En cours", "Lu"];
const STORAGE_KEY = "bookchart_livres";

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

function chargerLivresLocaux() {
  try {
    const livresSauvegardes = localStorage.getItem(STORAGE_KEY);

    if (livresSauvegardes !== null) {
      const livres = JSON.parse(livresSauvegardes);

      if (Array.isArray(livres)) {
        return livres;
      }
    }
  } catch (erreur) {
    console.error("Impossible de lire les livres sauvegardés :", erreur);
  }

  return livresExemple;
}

export function BooksProvider({ children }) {
  const [livres, setLivres] = useState(chargerLivresLocaux);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(livres));
    } catch (erreur) {
      console.error("Impossible de sauvegarder les livres :", erreur);
    }
  }, [livres]);

  function ajouterLivre(nouveauLivre) {
    if (!nouveauLivre?.id || !nouveauLivre?.titre) {
      return { succes: false, message: "Les informations du livre sont incomplètes." };
    }

    const idExiste = livres.some(
      (livre) => String(livre.id) === String(nouveauLivre.id)
    );

    if (idExiste) {
      return { succes: false, message: "Ce livre est déjà dans ta bibliothèque." };
    }

    const livrePrepare = {
      id: nouveauLivre.id,
      titre: nouveauLivre.titre,
      auteur: nouveauLivre.auteur || "Auteur inconnu",
      genre: nouveauLivre.genre || "Genre non renseigné",
      couverture: nouveauLivre.couverture || "",
      resume: nouveauLivre.resume || "",
      statut: "À lire",
    };

    setLivres((livresActuels) => [...livresActuels, livrePrepare]);

    return { succes: true, message: "Livre ajouté à ta bibliothèque !" };
  }

  function changerStatut(id, nouveauStatut) {
    if (!statutsLecture.includes(nouveauStatut)) {
      return;
    }

    setLivres((livresActuels) =>
      livresActuels.map((livre) =>
        String(livre.id) === String(id)
          ? { ...livre, statut: nouveauStatut }
          : livre
      )
    );
  }

  function supprimerLivre(id) {
    setLivres((livresActuels) =>
      livresActuels.filter((livre) => String(livre.id) !== String(id))
    );
  }

  return (
    <BooksContext.Provider
      value={{
        livres,
        loading: false,
        error: "",
        ajouterLivre,
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