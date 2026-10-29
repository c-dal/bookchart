import { useEffect, useState } from "react";
import { useBooks } from "../context/books-context";
import "./Library.css";

function Library() {
  const {
    livres,
    loading,
    error,
    changerStatut,
    supprimerLivre,
    rechargerBibliotheque,
  } = useBooks();

  const statutsLecture = ["À lire", "En cours", "Lu"];

  const [triAuteur, setTriAuteur] = useState("aucun");
  const [genreChoisi, setGenreChoisi] = useState("tous");
  const [statutChoisi, setStatutChoisi] = useState("tous");
  const [statutsEnCours, setStatutsEnCours] = useState([]);
  const [messageStatut, setMessageStatut] = useState("");

  // Recharge la bibliothèque de l'utilisateur connecté depuis MongoDB
  // chaque fois que la page s'affiche.
  useEffect(() => {
    if (localStorage.getItem("token")) {
      rechargerBibliotheque();
    }
  }, [rechargerBibliotheque]);

  const genres = [
    ...new Set(livres.map((livre) => livre.genre).filter(Boolean)),
  ];

  const livresFiltres = livres.filter((livre) => {
    const correspondGenre =
      genreChoisi === "tous" || livre.genre === genreChoisi;

    const correspondStatut =
      statutChoisi === "tous" || (livre.statut || "À lire") === statutChoisi;

    return correspondGenre && correspondStatut;
  });

  const livresAffiches = [...livresFiltres].sort((a, b) => {
    if (triAuteur === "az") {
      return (a.auteur || "").localeCompare(b.auteur || "", "fr");
    }

    if (triAuteur === "za") {
      return (b.auteur || "").localeCompare(a.auteur || "", "fr");
    }

    return 0;
  });

  async function handleSupprimerLivre(mongoId) {
    const confirmation = window.confirm(
      "Voulez-vous vraiment supprimer ce livre de votre bibliothèque ?",
    );

    if (!confirmation) return;

    const resultat = await supprimerLivre(mongoId);

    if (!resultat?.succes) {
      setMessageStatut(
        resultat?.message || "Impossible de supprimer ce livre.",
      );
    } else {
      setMessageStatut("");
    }
  }

  async function handleChangerStatut(mongoId, nouveauStatut) {
    if (!mongoId) {
      setMessageStatut(
        "Identifiant du livre manquant. Recharge la bibliothèque.",
      );
      return;
    }

    setMessageStatut("");
    setStatutsEnCours((ids) => [...ids, mongoId]);

    try {
      const resultat = await changerStatut(mongoId, nouveauStatut);

      if (!resultat?.succes) {
        setMessageStatut(
          resultat?.message || "Impossible de modifier le statut.",
        );
      }
    } catch (err) {
      console.error("Erreur de modification du statut :", err);
      setMessageStatut("Impossible de modifier le statut du livre.");
    } finally {
      setStatutsEnCours((ids) => ids.filter((itemId) => itemId !== mongoId));
    }
  }

  return (
    <main className="bibliotheque-page">
      <h1>Ma bibliothèque</h1>

      <div className="bibliotheque-filtres">
        <label>
          Filtrer par genre :
          <select
            value={genreChoisi}
            onChange={(event) => setGenreChoisi(event.target.value)}
          >
            <option value="tous">Tous les genres</option>

            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </label>

        <label>
          Trier par auteur :
          <select
            value={triAuteur}
            onChange={(event) => setTriAuteur(event.target.value)}
          >
            <option value="aucun">Ordre initial</option>
            <option value="az">Auteur : A à Z</option>
            <option value="za">Auteur : Z à A</option>
          </select>
        </label>

        <label>
          Filtrer par statut :
          <select
            value={statutChoisi}
            onChange={(event) => setStatutChoisi(event.target.value)}
          >
            <option value="tous">Tous les statuts</option>
            <option value="À lire">À lire</option>
            <option value="En cours">En cours</option>
            <option value="Lu">Lu</option>
          </select>
        </label>
      </div>

      {loading && <p className="bibliotheque-info">Chargement des livres...</p>}

      {error && (
        <p className="bibliotheque-message" role="status">
          {error}
        </p>
      )}

      {messageStatut && (
        <p className="bibliotheque-message" role="status">
          {messageStatut}
        </p>
      )}

      {!loading && livresAffiches.length === 0 && (
        <p className="bibliotheque-info">
          Aucun livre ne correspond à ces filtres.
        </p>
      )}

      <div className="livres-liste">
        {livresAffiches.map((livre) => (
          <article className="livre-card" key={livre.mongoId || livre.id}>
            {livre.couverture ? (
              <img
                className="livre-couverture"
                src={livre.couverture}
                alt={`Couverture de ${livre.titre}`}
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                  event.currentTarget.nextElementSibling?.style.setProperty(
                    "display",
                    "flex",
                  );
                }}
              />
            ) : null}

            <div
              className="livre-couverture-placeholder"
              role="img"
              aria-label={`Aucune couverture disponible pour ${livre.titre}`}
              style={{ display: livre.couverture ? "none" : "flex" }}
            >
              <i className="bi bi-book" aria-hidden="true"></i>
            </div>

            <div className="livre-infos">
              <h2>{livre.titre}</h2>

              <p className="livre-auteur">{livre.auteur || "Auteur inconnu"}</p>

              <p className="livre-genre">
                {livre.genre || "Genre non renseigné"}
              </p>

              <p className="livre-resume">
                {livre.resume || "Aucun résumé disponible."}
              </p>

              <div className="livre-statut">
                <label htmlFor={`statut-${livre.mongoId || livre.id}`}>
                  Statut de lecture :
                </label>

                <select
                  id={`statut-${livre.mongoId || livre.id}`}
                  value={livre.statut || "À lire"}
                  disabled={
                    !livre.mongoId || statutsEnCours.includes(livre.mongoId)
                  }
                  onChange={(event) =>
                    handleChangerStatut(livre.mongoId, event.target.value)
                  }
                >
                  {statutsLecture.map((statut) => (
                    <option key={statut} value={statut}>
                      {statut}
                    </option>
                  ))}
                </select>
              </div>

              <div className="livre-actions">
                <button
                  type="button"
                  className="livre-supprimer"
                  disabled={!livre.mongoId}
                  onClick={() => handleSupprimerLivre(livre.mongoId)}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

export default Library;
