const LibraryEntry = require("../models/LibraryEntry");
const sendError = require("../utils/sendError");

async function getUserBooks(req, res) {
  try {
    const books = await LibraryEntry.find({
      userId: req.user.userId,
    });

    return res.status(200).json(books);
  } catch (error) {
    console.error("Error fetching user books:", error);

    return res.status(500).json({
      error: "Impossible de récupérer votre bibliothèque.",
    });
  }
}

async function changeBookStatus(req, res) {
    try{
        const newStatus = req.body.status
        const book = await LibraryEntry.findOne({
            _id: req.params.bookId,
            userId: req.user.userId
        })

        if (!book) {
            return sendError(res, 404, "NOT_FOUND", "Book not found");
        }
        if (!["TO_READ", "CURRENT", "FINISHED"].includes(newStatus)) {
            return sendError(res, 400, "INVALID_INPUT", "Invalid status");
        }
        
        book.status = newStatus;
        await book.save();

        return res.status(200).json(book);
    } catch (error) {
        return res.status(500).json({ error: "Failed to update status" });
    }
}

async function removeBook(req, res) {
    try{
        const book = await LibraryEntry.findOneAndDelete({
            _id: req.params.bookId,
            userId: req.user.userId
        })

        if (!book) {
            return sendError(res, 404, "NOT_FOUND", "Book not found");
        }

        return res.status(200).json(book);
    } catch (error) {
        return res.status(500).json({ error: "Failed to update status" });
    }
}


module.exports = { getUserBooks, changeBookStatus, removeBook };