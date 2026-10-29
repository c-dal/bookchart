const { searchBooks } = require("../services/openLibrary");
const sendError = require("../utils/sendError");

async function search(req, res) {
  try {
    const query = typeof req.query.q === "string" ? req.query.q.trim() : "";

    if (!query) {
      return sendError(
        res,
        400,
        "INVALID_QUERY",
        "Veuillez saisir un titre ou un auteur.",
      );
    }

    if (query.length > 200) {
      return sendError(
        res,
        400,
        "QUERY_TOO_LONG",
        "La recherche ne doit pas dépasser 200 caractères.",
      );
    }

    const result = await searchBooks(query, 10);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Erreur de recherche de livres :", error);

    return sendError(
      res,
      502,
      "SEARCH_FAILED",
      "Impossible de récupérer les livres pour le moment.",
    );
  }
}

module.exports = { search };
