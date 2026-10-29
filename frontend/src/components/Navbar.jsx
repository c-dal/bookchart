import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo_site from "./../assets/bookchart_logo_site.png";
import { authenticatedFetch } from "../services/authService";

const API_URL = import.meta.env.VITE_API_URL;

function Navbar() {
  const estConnecte = Boolean(localStorage.getItem("token"));
  const [recherche, setRecherche] = useState("");
  const [resultats, setResultats] = useState([]);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [rechercheOuverte, setRechercheOuverte] = useState(false);

  const searchContainerRef = useRef(null);
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("auth-changed"));
    setMenuOuvert(false);
    setRechercheOuverte(false);
    setRecherche("");
    setResultats([]);
    navigate("/login", { replace: true });
  }

  useEffect(() => {
    const gererClicExterieur = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setRechercheOuverte(false);
      }
    };

    document.addEventListener("mousedown", gererClicExterieur);
    document.addEventListener("touchstart", gererClicExterieur);

    return () => {
      document.removeEventListener("mousedown", gererClicExterieur);
      document.removeEventListener("touchstart", gererClicExterieur);
    };
  }, []);

  const lancerRecherche = async (event) => {
    event.preventDefault();

    const query = recherche.trim();

    if (!query) {
      setResultats([]);
      setErreur("");
      setRechercheOuverte(false);
      return;
    }

    setChargement(true);
    setErreur("");
    setRechercheOuverte(true);


    try {
      const response = await authenticatedFetch(
        `${API_URL}/search?q=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          throw new Error("Session expirée. Veuillez vous reconnecter.");
        }

        throw new Error("La recherche a échoué.");
      }

      const data = await response.json();
      setResultats(Array.isArray(data.books) ? data.books : []);
    } catch (error) {
      console.error("Erreur de recherche :", error);
      setResultats([]);
      setErreur(error.message || "Impossible de charger les résultats.");
    } finally {
      setChargement(false);
    }
  };

  return (
    <nav className="navbar navbar-light">
      <Link
        className="navbar-brand"
        to={estConnecte ? "/home" : "/login"}
      >
        <img
          src={logo_site}
          width="50"
          height="50"
          className="d-inline-block align-top"
          alt="Logo BookChart"
        />
        BookChart
      </Link>

      {estConnecte && (
        <div className="search-container" ref={searchContainerRef}>
          <form
            className="search-bar"
            role="search"
            onSubmit={lancerRecherche}
          >
            <input
              className="search-input"
              type="search"
              placeholder="Rechercher un livre"
              aria-label="Rechercher"
              value={recherche}
              onFocus={() => setRechercheOuverte(true)}
              onChange={(event) => {
                setRecherche(event.target.value);
                setRechercheOuverte(true);
              }}
            />

            <button
              className="search-button"
              type="submit"
              aria-label="Lancer la recherche"
              disabled={chargement}
            >
              <i className="bi bi-search" aria-hidden="true"></i>
            </button>
          </form>

          {rechercheOuverte &&
            (chargement || erreur || resultats.length > 0) && (
              <div className="search-results">
                {chargement && (
                  <p className="search-message">
                    Recherche en cours...
                  </p>
                )}

                {erreur && (
                  <p className="search-message">{erreur}</p>
                )}

                {!chargement &&
                  resultats.map((livre) => (
                    <div
                      className="search-result-item"
                      key={livre.openLibraryId}
                    >
                      <div className="search-result-cover-container">
                        {livre.thumbnail ? (
                          <img
                            className="search-result-cover"
                            src={livre.thumbnail}
                            alt={`Couverture de ${livre.title}`}
                          />
                        ) : (
                          <div
                            className="search-result-cover-placeholder"
                            aria-label="Aucune couverture disponible"
                          >
                            <i
                              className="bi bi-book"
                              aria-hidden="true"
                            ></i>
                          </div>
                        )}
                      </div>

                      <div className="search-result-info">
                        <Link
                          to={`/book/${encodeURIComponent(livre.openLibraryId)}`}
                          className="search-result-title"
                          onClick={() => setRechercheOuverte(false)}
                        >
                          {livre.title}
                        </Link>

                        <p>
                          {livre.authors?.length
                            ? livre.authors.join(", ")
                            : "Auteur inconnu"}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
        </div>
      )}

      {estConnecte && (
        <div className="profile-menu-container">
          <button
            type="button"
            className="profile-link"
            aria-label="Ouvrir le menu utilisateur"
            aria-expanded={menuOuvert}
            aria-haspopup="true"
            onClick={() => setMenuOuvert((ouvert) => !ouvert)}
          >
            <i className="bi bi-person-circle" aria-hidden="true"></i>
          </button>

          {menuOuvert && (
            <div className="profile-dropdown">
              <Link
                to="/library"
                className="profile-dropdown-item"
                onClick={() => setMenuOuvert(false)}
              >
                <i className="bi bi-book" aria-hidden="true"></i>
                Bibliothèque
              </Link>

              <button
                type="button"
                className="profile-dropdown-item"
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right" aria-hidden="true"></i>
                Déconnexion
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;