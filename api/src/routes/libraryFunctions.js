const LibraryEntry = require("../models/LibraryEntry");

async function getUserBooks(req, res) {
  try {
    const userId = req.user.userId;

    const books = await LibraryEntry.find({ userId });

    return res.status(200).json(books);
  } catch (error) {
    console.error("Error fetching user books:", error);

    return res.status(500).json({
      error: "Impossible de récupérer votre bibliothèque.",
    });
  }
}

async function changeBookStatus(req, res) {
  try {
    const { bookId } = req.params;
    const { status: newStatus } = req.body;
    const userId = req.user.userId;

    if (!["TO_READ", "CURRENT", "FINISHED"].includes(newStatus)) {
      return res.status(400).json({
        error: "INVALID_STATUS",
        message: "Le statut de lecture est invalide.",
      });
    }

    // Le livre doit appartenir à l'utilisateur connecté.
    const book = await LibraryEntry.findOne({
      _id: bookId,
      userId,
    });

    if (!book) {
      return res.status(404).json({
        error: "NOT_FOUND",
        message: "Livre introuvable dans votre bibliothèque.",
      });
    }

    book.status = newStatus;
    await book.save();

    return res.status(200).json({
      message: "Statut du livre mis à jour.",
      book,
    });
  } catch (error) {
    console.error("Error updating book status:", error);

    return res.status(500).json({
      error: "UPDATE_FAILED",
      message: "Impossible de modifier le statut du livre.",
    });
  }
}

async function removeBook(req, res) {
  try {
    const { bookId } = req.params;
    const userId = req.user.userId;

    // Supprime uniquement un livre appartenant à l'utilisateur connecté.
    const book = await LibraryEntry.findOneAndDelete({
      _id: bookId,
      userId,
    });

    if (!book) {
      return res.status(404).json({
        error: "NOT_FOUND",
        message: "Livre introuvable dans votre bibliothèque.",
      });
    }

    return res.status(200).json({
      message: "Livre supprimé de votre bibliothèque.",
      book,
    });
  } catch (error) {
    console.error("Error removing book:", error);

    return res.status(500).json({
      error: "DELETE_FAILED",
      message: "Impossible de supprimer le livre.",
    });
  }
}

module.exports = {
  getUserBooks,
  changeBookStatus,
  removeBook,
};
