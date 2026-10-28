import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useBooks } from "../context/BooksContext";
import { authenticatedFetch } from "../services/authService";
import "./Book.css";
import { authenticatedFetch } from "../services/authService";

const API_URL = import.meta.env.VITE_API_URL;

function Book() {
    const { bookid } = useParams();

    const [livre, setLivre] = useState(null);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState("");

    const { livres, ajouterLivre } = useBooks();
    const [messageAjout, setMessageAjout] = useState("");
    const [ajoutEnCours, setAjoutEnCours] = useState(false);
    const [ajoutReussi, setAjoutReussi] = useState(false);
    const [ajoutEnCours, setAjoutEnCours] = useState(false);

    const livreDejaAjoute = livre
        ? livres.some(
            (item) =>
                String(item.id) === String(livre.id || bookid)
        )
        : false;


    async function handleAjouterLivre() {
        if (!livre || ajoutEnCours || livreDejaAjoute) return;

        setAjoutEnCours(true);
        setMessageAjout("");
        setAjoutReussi(false);

        try {
            const response = await authenticatedFetch(
                `${API_URL}/api/book/add/${encodeURIComponent(bookid)}`,
                { method: "POST" }
            );

            const data = await response.json().catch(() => ({}));

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem("token");
                setMessageAjout("Ta session a expiré. Reconnecte-toi.");
                setAjoutReussi(false);
                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.message || "Impossible d'ajouter ce livre."
                );
            }

            if (!data.book) {
                throw new Error("Le serveur n'a pas renvoyé le livre ajouté.");
            }

            const entry = data.book;

            const resultat = ajouterLivre({
                id: entry.openLibraryId,
                titre: entry.title,
                auteur: entry.authors?.join(", ") || "Auteur inconnu",
                genre: livre.genres?.[0] || "Genre non renseigné",
                couverture: entry.thumbnail || "",
                resume: entry.description || "",
                publishedDate: entry.publishedDate || "",
                statut: entry.status || "TO_READ",
            });

            setMessageAjout(data.message || "Livre ajouté à la bibliothèque.");

            // Le backend a confirmé l'ajout : on considère la requête réussie.
            setAjoutReussi(true);
        } catch (error) {
            console.error("Erreur lors de l'ajout du livre :", error);
            setMessageAjout(error.message || "Une erreur est survenue.");
            setAjoutReussi(false);
        } finally {
            setAjoutEnCours(false);
        }
    }


    useEffect(() => {
        const controller = new AbortController();

        async function chargerLivre() {
            setChargement(true);
            setErreur("");
            setLivre(null);
            setMessageAjout("");
            setAjoutReussi(false);

            try {
                const response = await authenticatedFetch(
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
        }

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

                    {/* Bouton d'ajout à la bibliothèque */}
                    <div className="livre-ajout">
                        <button
                            type="button"
                            className="livre-ajout-bouton"
                            onClick={handleAjouterLivre}
                            disabled={livreDejaAjoute || ajoutEnCours}
                        >
                            {ajoutEnCours
                                ? "Ajout en cours..."
                                : livreDejaAjoute
                                    ? "Déjà dans ma bibliothèque"
                                    : "Ajouter à ma bibliothèque"}
                        </button>

                        {messageAjout && (
                            <p
                                className={`livre-ajout-message ${ajoutReussi ? "succes" : "erreur"
                                    }`}
                                role="status"
                            >
                                {messageAjout}
                            </p>
                        )}
                    </div>
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