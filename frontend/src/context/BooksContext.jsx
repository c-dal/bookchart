import { useEffect, useRef, useState, useCallback } from "react";
import { authenticatedFetch } from "../services/authService";
import { BooksContext } from "./books-context";
const API_URL = import.meta.env.VITE_API_URL;

// Événement à déclencher à la connexion et à la déconnexion :
// window.dispatchEvent(new Event("auth-changed"));
const AUTH_EVENT = "auth-changed";

const statutsLecture = ["À lire", "En cours", "Lu"];

const statutVersBackend = {
  "À lire": "TO_READ",
  "En cours": "CURRENT",
  Lu: "FINISHED",
};

const statutVersFrontend = {
  TO_READ: "À lire",
  CURRENT: "En cours",
  FINISHED: "Lu",
};

function convertirLivre(livre) {
  return {
    id: livre.openLibraryId,
    mongoId: livre._id,
    titre: livre.title,
    auteur: livre.authors?.join(", ") || "Auteur inconnu",
    genre: livre.genres?.[0] || "Genre non renseigné",
    couverture: livre.thumbnail || "",
    resume: livre.description || "",
    statut: statutVersFrontend[livre.status] || "À lire",
  };
}

export function BooksProvider({ children }) {
  const [livres, setLivres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Numéro de la dernière requête de chargement. Une réponse reçue après
  // un changement de compte (numéro périmé) est ignorée, pour ne jamais
  // afficher les livres de l'ancien utilisateur.
  const requeteCouranteRef = useRef(0);

  // Vide l'état local (déconnexion ou changement de compte).
  const viderBibliotheque = useCallback(() => {
    requeteCouranteRef.current += 1; // invalide les requêtes en cours
    setLivres([]);
    setError("");
    setLoading(false);
  }, []);

  const chargerBibliotheque = useCallback(async () => {
    const numeroRequete = ++requeteCouranteRef.current;

    // On vide d'abord : jamais de livres d'un autre compte pendant le chargement.
    setLivres([]);
    setLoading(true);
    setError("");

    try {
      const response = await authenticatedFetch(`${API_URL}/library`);

      if (numeroRequete !== requeteCouranteRef.current) return;

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("Session expirée. Veuillez vous reconnecter.");
        }

        throw new Error("Impossible de charger la bibliothèque.");
      }

      const data = await response.json();

      if (numeroRequete !== requeteCouranteRef.current) return;

      const livresBackend = Array.isArray(data)
        ? data
        : data.books || data.livres || [];

      setLivres(livresBackend.map(convertirLivre));
    } catch (err) {
      if (numeroRequete !== requeteCouranteRef.current) return;

      console.error("Erreur de chargement de la bibliothèque :", err);
      setLivres([]);
      setError(err.message || "Impossible de charger la bibliothèque.");
    } finally {
      if (numeroRequete === requeteCouranteRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Synchronise la bibliothèque avec le jeton actuel :
  // - au montage ;
  // - à chaque connexion / déconnexion (événement "auth-changed") ;
  // - si le jeton change dans un autre onglet (événement "storage").
  useEffect(() => {
    function synchroniser() {
      if (localStorage.getItem("token")) {
        chargerBibliotheque();
      } else {
        viderBibliotheque();
      }
    }

    synchroniser();

    window.addEventListener(AUTH_EVENT, synchroniser);
    window.addEventListener("storage", synchroniser);

    return () => {
      window.removeEventListener(AUTH_EVENT, synchroniser);
      window.removeEventListener("storage", synchroniser);
    };
  }, [chargerBibliotheque, viderBibliotheque]);

  async function ajouterLivre(nouveauLivre) {
    if (!nouveauLivre?.id || !nouveauLivre?.titre) {
      return {
        succes: false,
        message: "Les informations du livre sont incomplètes.",
      };
    }

    if (livres.some((livre) => String(livre.id) === String(nouveauLivre.id))) {
      return {
        succes: false,
        message: "Ce livre est déjà dans ta bibliothèque.",
      };
    }

    try {
      const response = await authenticatedFetch(
        `${API_URL}/book/add/${encodeURIComponent(nouveauLivre.id)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: statutVersBackend[nouveauLivre.statut || "À lire"],
          }),
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          succes: false,
          message:
            data.message ||
            data.error?.message ||
            "Impossible d'ajouter ce livre.",
        };
      }

      if (!data.book) {
        return {
          succes: false,
          message: "Le serveur n'a pas renvoyé le livre enregistré.",
        };
      }

      const livreConverti = convertirLivre(data.book);

      setLivres((livresActuels) => {
        if (
          livresActuels.some(
            (livre) => String(livre.id) === String(livreConverti.id),
          )
        ) {
          return livresActuels;
        }

        return [...livresActuels, livreConverti];
      });

      return {
        succes: true,
        message: data.message || "Livre ajouté à ta bibliothèque !",
      };
    } catch (err) {
      console.error("Erreur lors de l'ajout du livre :", err);

      return {
        succes: false,
        message: "Impossible de contacter le serveur.",
      };
    }
  }

  async function changerStatut(mongoId, nouveauStatut) {
    if (!mongoId) {
      return {
        succes: false,
        message: "Identifiant MongoDB du livre manquant.",
      };
    }

    if (!statutsLecture.includes(nouveauStatut)) {
      return {
        succes: false,
        message: "Le statut de lecture est invalide.",
      };
    }

    const statutBackend = statutVersBackend[nouveauStatut];

    if (!statutBackend) {
      return {
        succes: false,
        message: "Impossible de convertir le statut.",
      };
    }

    try {
      const response = await authenticatedFetch(
        `${API_URL}/library/${encodeURIComponent(mongoId)}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: statutBackend,
          }),
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          viderBibliotheque();
          throw new Error("Session expirée. Veuillez vous reconnecter.");
        }

        throw new Error(
          data.message ||
            data.error?.message ||
            "Impossible de modifier le statut du livre.",
        );
      }

      const statutConfirme = data.book?.status
        ? statutVersFrontend[data.book.status]
        : nouveauStatut;

      setLivres((livresActuels) =>
        livresActuels.map((livre) =>
          String(livre.mongoId) === String(mongoId)
            ? {
                ...livre,
                statut: statutConfirme || nouveauStatut,
              }
            : livre,
        ),
      );

      return {
        succes: true,
        message: data.message || "Statut du livre mis à jour.",
      };
    } catch (err) {
      console.error("Erreur lors de la modification du statut :", err);

      return {
        succes: false,
        message: err.message || "Impossible de contacter le serveur.",
      };
    }
  }

  async function supprimerLivre(mongoId) {
    if (!mongoId) {
      return {
        succes: false,
        message: "Identifiant MongoDB du livre manquant.",
      };
    }

    try {
      const response = await authenticatedFetch(
        `${API_URL}/library/${encodeURIComponent(mongoId)}/remove`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error(
            "Session expirée ou accès refusé. Veuillez vous reconnecter.",
          );
        }

        throw new Error(
          data.message ||
            data.error?.message ||
            "Impossible de supprimer ce livre.",
        );
      }

      // Retirer le livre de l'affichage après confirmation du serveur.
      setLivres((livresActuels) =>
        livresActuels.filter(
          (livre) => String(livre.mongoId) !== String(mongoId),
        ),
      );

      setError("");

      return {
        succes: true,
        message: data.message || "Livre supprimé de votre bibliothèque.",
      };
    } catch (err) {
      console.error("Erreur lors de la suppression du livre :", err);

      return {
        succes: false,
        message: err.message || "Impossible de contacter le serveur.",
      };
    }
  }

  return (
    <BooksContext.Provider
      value={{
        livres,
        loading,
        error,
        ajouterLivre,
        changerStatut,
        supprimerLivre,
        rechargerBibliotheque: chargerBibliotheque,
        viderBibliotheque,
      }}
    >
      {children}
    </BooksContext.Provider>
  );
}
