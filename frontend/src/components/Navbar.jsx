import logo_site from "./../assets/bookchart_logo_site.png";
import Library from "./../pages/Library";
function Navbar() {
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
      <form className="search-bar" role="search">
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
      <a href="/Library" className="profile-link" aria-label="Mon profil">
        <i className="bi bi-person-circle" aria-hidden="true"></i>
      </a>
    </nav>
  );
}
export default Navbar;
