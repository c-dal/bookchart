
import { Link } from "react-router-dom";
import { useBooks } from "../context/BooksContext";
import "./Dashboard.css";

function Dashboard() {
    const { livres, loading, error } = useBooks();

    const livresLus = livres.filter((livre) => livre.statut === "Lu");

    const livresEnCours = livres.filter(
        (livre) => livre.statut === "En cours"
    );

    const livresALire = livres.filter(
        (livre) => !livre.statut || livre.statut === "À lire"
    );

    function SectionLivres({ titre, liste }) {
        return (
            <section className="dashboard-section">
                <div className="dashboard-section-header">
                    <h2>{titre}</h2>

                    <Link to="/Library">Voir ma bibliothèque →</Link>
                </div>

                {liste.length === 0 ? (
                    <p className="dashboard-vide">
                        Aucun livre dans cette catégorie.
                    </p>
                ) : (
                    <div className="dashboard-carrousel">
                        {liste.map((livre) => (
                            <article className="dashboard-livre" key={livre.id}>
                                <img
                                    src={livre.couverture}
                                    alt={`Couverture de ${livre.titre}`}
                                    loading="lazy"
                                    onError={(event) => {
                                        event.currentTarget.style.visibility = "hidden";
                                    }}
                                />

                                <h3>{livre.titre}</h3>
                                <p>{livre.auteur}</p>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        );
    }

    return (
        <main className="dashboard-page">
            <header className="dashboard-intro">
                <h1>Mon tableau de bord</h1>
            </header>

            {loading && <p>Chargement des livres...</p>}

            {error && (
                <p className="dashboard-message" role="status">
                    {error}
                </p>
            )}

            <section
                className="dashboard-stats"
                aria-label="Statistiques de lecture"
            >
                <article className="dashboard-stat dashboard-stat-lu">
                    <span>Livres lus</span>
                    <strong>{livresLus.length}</strong>
                </article>

                <article className="dashboard-stat dashboard-stat-cours">
                    <span>En cours de lecture</span>
                    <strong>{livresEnCours.length}</strong>
                </article>

                <article className="dashboard-stat dashboard-stat-alire">
                    <span>Livres à lire</span>
                    <strong>{livresALire.length}</strong>
                </article>
            </section>

            <SectionLivres
                titre="Mes lectures en cours"
                liste={livresEnCours}
            />
        </main>
    );
}

export default Dashboard;
