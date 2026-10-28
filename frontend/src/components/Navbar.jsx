
import { useState } from "react";
import logo_site from "./../assets/bookchart_logo_site.png";
import { Link } from "react-router-dom";

function Navbar() {
  const [menuOuvert, setMenuOuvert] = useState(false);

  return (
    <nav className="navbar navbar-light">
      <a className="navbar-brand" href="/home">
        <img
          src={logo_site}
          width="50"
          height="50"
          className="d-inline-block align-top"
          alt="Logo"
        />
        BookChart
      </a>

      <form
        className="search-bar"
        role="search"
        onSubmit={(event) => event.preventDefault()}
      >
        <input
          className="search-input"
          type="search"
          placeholder="Rechercher un livre"
          aria-label="Rechercher"
        />

        <button
          className="search-button"
          type="submit"
          aria-label="Lancer la recherche"
        >
          <i className="bi bi-search" aria-hidden="true"></i>
        </button>
      </form>

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
              to="/Library"
              className="profile-dropdown-item"
              onClick={() => setMenuOuvert(false)}
            >
              <i className="bi bi-book" aria-hidden="true"></i>
              Bibliothèque
            </Link>

            <button
              type="button"
              className="profile-dropdown-item"
              onClick={() => {
                // La déconnexion sera implémentée plus tard.
              }}
            >
              <i className="bi bi-box-arrow-right" aria-hidden="true"></i>
              Déconnexion
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

