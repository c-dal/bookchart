const { fetchWorkDetails } = require("../services/openLibrary");
const LibraryEntry = require("../models/LibraryEntry");
const sendError = require("../utils/sendError");

const ALLOWED_STATUSES = ["TO_READ", "CURRENT", "FINISHED"];

// Open Library renvoie parfois la description sous forme d'objet
// { type, value } au lieu d'une chaîne : on la normalise.
function normaliseDescription(description) {
  if (typeof description === "string") return description;
  if (typeof description?.value === "string") return description.value;
  return undefined;
}

async function getBookDetails(req, res) {
  try {
    const { openLibraryId } = req.params;

    const book = await fetchWorkDetails(openLibraryId);

    return res.status(200).json(book);
  } catch (error) {
    const status = error.status ?? 502;

    if (status >= 500) {
      console.error("Erreur lors de la récupération du livre :", error);
    }

    const code =
      status === 400
        ? "INVALID_BOOK_ID"
        : status === 404
          ? "BOOK_NOT_FOUND"
          : "OPEN_LIBRARY_UNAVAILABLE";

    return sendError(
      res,
      status,
      code,
      error.message || "Impossible de récupérer le livre.",
    );
  }
}

async function addBookToLibrary(req, res) {
    try {
        const { openLibraryId } = req.params;
        const status = req.body?.status ?? "TO_READ";

    const userId = req.user?.userId;

    if (!userId) {
      return sendError(res, 401, "UNAUTHORIZED", "Utilisateur non identifié.");
    }

    // Vérification des données reçues
    if (typeof openLibraryId !== "string" || !/^OL\d+W$/.test(openLibraryId)) {
      return sendError(
        res,
        400,
        "INVALID_BOOK_ID",
        "L'identifiant Open Library est invalide.",
      );
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return sendError(
        res,
        400,
        "INVALID_STATUS",
        "Le statut du livre est invalide.",
      );
    }

    // Récupération des informations auprès d'Open Library
    const book = await fetchWorkDetails(openLibraryId);

    // Enregistrement dans MongoDB
    const libraryEntry = await LibraryEntry.create({
      userId,
      openLibraryId: openLibraryId,
      title: book.title || "Titre inconnu",
      authors: Array.isArray(book.authors) ? book.authors : [],
      genres: Array.isArray(book.genres) ? book.genres : [],
      description: normaliseDescription(book.description),
      thumbnail: book.thumbnail ?? undefined,
      publishedDate: book.publishedDate
        ? String(book.publishedDate)
        : undefined,
      status,
    });

    return res.status(201).json({
      message: "Livre ajouté à la bibliothèque.",
      book: libraryEntry,
    });
  } catch (error) {
    // Doublon : l'index unique MongoDB a détecté
    // que ce livre appartient déjà à cet utilisateur.
    if (error.code === 11000) {
      return sendError(
        res,
        409,
        "BOOK_ALREADY_IN_LIBRARY",
        "Ce livre est déjà dans votre bibliothèque.",
      );
    }

    if (error.status) {
      const code =
        error.status === 404
          ? "BOOK_NOT_FOUND"
          : error.status === 400
            ? "INVALID_BOOK_ID"
            : "OPEN_LIBRARY_UNAVAILABLE";

      return sendError(res, error.status, code, error.message);
    }

    console.error("Erreur lors de l'ajout du livre :", error);

    return sendError(
      res,
      500,
      "BOOK_ADD_FAILED",
      "Impossible d'ajouter le livre à la bibliothèque.",
    );
  }
}

module.exports = { getBookDetails, addBookToLibrary };
