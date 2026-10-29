const LibraryEntry = require("../models/LibraryEntry");
const sendError = require("../utils/sendError");

async function getUserBooks(req, res) {
  try {
    const books = await LibraryEntry.find({ userId: req.user.userId });
    return res.status(200).json(books);
  } catch (error) {
    console.error("Error fetching user books:", error);
    return sendError(
      res,
      500,
      "FETCH_FAILED",
      "Impossible de récupérer votre bibliothèque.",
    );
  }
}

async function changeBookStatus(req, res) {
  try {
    const { status } = req.body;

    if (!["TO_READ", "CURRENT", "FINISHED"].includes(status)) {
      return sendError(
        res,
        400,
        "INVALID_STATUS",
        "Le statut de lecture est invalide.",
      );
    }

    const book = await LibraryEntry.findOne({
      _id: req.params.bookId,
      userId: req.user.userId,
    });

    if (!book) {
      return sendError(
        res,
        404,
        "NOT_FOUND",
        "Livre introuvable dans votre bibliothèque.",
      );
    }

    book.status = status;
    await book.save();
    return res.status(200).json(book);
  } catch (error) {
    console.error("Error updating book status:", error);
    return sendError(
      res,
      500,
      "UPDATE_FAILED",
      "Impossible de modifier le statut du livre.",
    );
  }
}

async function removeBook(req, res) {
  try {
    const book = await LibraryEntry.findOneAndDelete({
      _id: req.params.bookId,
      userId: req.user.userId,
    });

    if (!book) {
      return sendError(
        res,
        404,
        "NOT_FOUND",
        "Livre introuvable dans votre bibliothèque.",
      );
    }

    return res.status(200).json(book);
  } catch (error) {
    console.error("Error removing book:", error);
    return sendError(
      res,
      500,
      "DELETE_FAILED",
      "Impossible de supprimer le livre.",
    );
  }
}

module.exports = {
  getUserBooks,
  changeBookStatus,
  removeBook,
};
