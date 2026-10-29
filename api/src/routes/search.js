const { Router } = require("express");
const { searchBooks } = require("../services/openLibrary");

const router = Router();

router.get("/", async (req, res) => {
  try {
    const query = typeof req.query.q === "string" ? req.query.q.trim() : "";

    if (!query) {
      return res.status(400).json({
        error: "Veuillez saisir un titre ou un auteur.",
      });
    }

    if (query.length > 200) {
      return res.status(400).json({
        error: "La recherche ne doit pas dépasser 200 caractères.",
      });
    }

    const result = await searchBooks(query, 10);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Erreur de recherche de livres :", error);

    return res.status(502).json({
      error: "Impossible de récupérer les livres pour le moment.",
    });
  }
});

module.exports = { searchRouter: router };
