import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./Book.css";

const API_URL = import.meta.env.VITE_API_URL;

function Book() {
    const { bookid } = useParams();

    const [livre, setLivre] = useState(null);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        const chargerLivre = async () => {
            setChargement(true);
            setErreur("");
            setLivre(null);

            try {
                const response = await fetch(
                    `${API_URL}/book/${encodeURIComponent(bookid)}`,
                    { signal: controller.signal }
                );

                if (!response.ok) {
                    throw new Error("Impossible de charger ce livre.");
                }

                const data = await response.json();
                setLivre(data);
            } catch (error) {
                if (error.name !== "AbortError") {
                    console.error(
                        "Erreur lors du chargement du livre :",
                        error
                    );
                    setErreur(
                        "Impossible de charger les informations du livre."
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setChargement(false);
                }
            }
        };

        chargerLivre();

        return () => controller.abort();
    }, [bookid]);

    if (chargement) {
        return (
            <main className="livre-page">
                Chargement du livre...
            </main>
        );
    }

    if (erreur) {
        return (
            <main className="livre-page">
                <p>{erreur}</p>
                <Link to="/home">Retour à l’accueil</Link>
            </main>
        );
    }

    if (!livre) {
        return (
            <main className="livre-page">
                <p>Aucune information disponible pour ce livre.</p>
                <Link to="/home">Retour à l’accueil</Link>
            </main>
        );
    }

    return (
        <main className="livre-page">
            <Link to="/home" className="livre-retour">
                <i
                    className="bi bi-arrow-left"
                    aria-hidden="true"
                ></i>
                Retour à l’accueil
            </Link>

            <section className="livre-detail">
                <div className="livre-couverture-container">
                    {livre.thumbnail ? (
                        <img
                            className="livre-couverture"
                            src={livre.thumbnail}
                            alt={`Couverture de ${livre.title || "ce livre"}`}
                        />
                    ) : (
                        <div
                            className="livre-couverture-placeholder"
                            aria-label="Aucune couverture disponible"
                        >
                            <i
                                className="bi bi-book"
                                aria-hidden="true"
                            ></i>
                            <span>Couverture indisponible</span>
                        </div>
                    )}
                </div>

                <div className="livre-informations">
                    <h1>{livre.title || "Titre inconnu"}</h1>

                    <p className="livre-auteurs">
                        {livre.authors?.length
                            ? livre.authors.join(", ")
                            : "Auteur inconnu"}
                    </p>

                    {livre.publishedDate && (
                        <p>
                            <strong>Première publication :</strong>{" "}
                            {livre.publishedDate}
                        </p>
                    )}

                    {Array.isArray(livre.genres) &&
                        livre.genres.length > 0 && (
                            <div className="livre-sujets">
                                <h2>Genres et thèmes</h2>

                                <div className="livre-tags">
                                    {livre.genres.map((genre, index) => (
                                        <span
                                            className="livre-tag"
                                            key={`${genre}-${index}`}
                                        >
                                            {genre}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                </div>
            </section>

            <section className="livre-description">
                <h2>Description</h2>

                {typeof livre.description === "string" &&
                    livre.description.trim() ? (
                    <p className="livre-description-texte">
                        {livre.description}
                    </p>
                ) : livre.description?.value ? (
                    <p className="livre-description-texte">
                        {livre.description.value}
                    </p>
                ) : (
                    <p>Description indisponible pour ce livre.</p>
                )}
            </section>
        </main>
    );
}

export default Book;