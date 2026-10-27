import logo_site from "./../assets/bookchart_logo_site.png";
function Navbar() {
  return (
    <nav className="navbar navbar-light">
      <a className="navbar-brand" href="#">
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
          placeholder="Rechercher un livre..."
          aria-label="Rechercher"
        />
        <button
          className="search-button"
          type="submit"
          aria-label="Lancer la recherche"
        >
          &#xF52A;
        </button>
      </form>
    </nav>
  );
}
export default Navbar;
