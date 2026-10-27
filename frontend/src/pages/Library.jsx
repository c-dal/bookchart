
import { useState, useEffect } from "react";
import { getBooks } from "../services/bookService";


const livresExemple = [
  {
    id: 1,
    titre: "Le Petit Prince",
    auteur: "Antoine de Saint-Exupéry",
    genre: "Conte philosophique",
    couverture: "https://covers.openlibrary.org/b/id/8231856-L.jpg",
    resume:
      "Un aviateur rencontre un petit prince venu d’une autre planète. À travers leurs échanges, le récit aborde l’amitié, l’amour et le regard que nous portons sur le monde.",
  },
  {
    id: 2,
    titre: "Orgueil et Préjugés",
    auteur: "Jane Austen",
    genre: "Roman sentimental",
    couverture: "https://covers.openlibrary.org/b/id/8231996-L.jpg",
    resume:
      "Elizabeth Bennet découvre les complexités de l’amour, des conventions sociales et des premières impressions lorsqu’elle rencontre le mystérieux Mr Darcy.",
  },
  {
    id: 3,
    titre: "Les Misérables",
    auteur: "Victor Hugo",
    genre: "roman historique",
    couverture: "https://covers.openlibrary.org/b/id/8235104-L.jpg",
    resume:
      "Jean Valjean tente de reconstruire sa vie après sa sortie du bagne. Son parcours croise celui de personnages confrontés à la pauvreté, à l’injustice et à la rédemption.",
  },
];

function Bibliotheque() {
  const [livres, setLivres] = useState(livresExemple);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [triAuteur, setTriAuteur] = useState("aucun");
  const [genreChoisi, setGenreChoisi] = useState("tous");

  useEffect(() => {
    let actif = true;

    async function chargerLivres() {
      try {
        const data = await getBooks();

        if (actif) {
          setLivres(data);
          setError("");
        }
      } catch (err) {
        if (actif) {
          setError(
            "Impossible de charger les livres depuis l'API. Les exemples sont affichés."
          );
        }
      } finally {
        if (actif) {
          setLoading(false);
        }
      }
    }

    chargerLivres();

    return () => {
      actif = false;
    };
  }, []);
  const genres = [...new Set(livres.map((livre) => livre.genre))];

  const livresFiltres = livres.filter((livre) => {
    return genreChoisi === "tous" || livre.genre === genreChoisi;
  });

  const livresAffiches = [...livresFiltres].sort((a, b) => {
    if (triAuteur === "az") {
      return a.auteur.localeCompare(b.auteur, "fr");
    }

    if (triAuteur === "za") {
      return b.auteur.localeCompare(a.auteur, "fr");
    }

    return 0;
  });

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
      </div>

      {loading && <p>Chargement des livres...</p>}

      {error && <p className= "bibliotheque-message" role="status">{error}</p>}


      <div className="livres-liste">
        {livresAffiches.length === 0 ? (
          <p>Aucun livre ne correspond à ce genre.</p>
        ) : (
          livresAffiches.map((livre) => (
            <article className="livre-card" key={livre.id}>
              <img
                className="livre-couverture"
                src={livre.couverture}
                alt={`Couverture de ${livre.titre}`}
              />

              <div className="livre-infos">
                <h2>{livre.titre}</h2>
                <p className="livre-auteur">{livre.auteur}</p>
                <p className="livre-genre">{livre.genre}</p>
                <p className="livre-resume">{livre.resume}</p>
              </div>
            </article>
          ))
        )}
      </div>

    </main>
  );
}

export default Bibliotheque;
