const { fetchWorkDetails } = require("../services/openLibrary");

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

        return res.status(status).json({
            error: {
                code:
                    status === 400
                        ? "INVALID_BOOK_ID"
                        : status === 404
                            ? "BOOK_NOT_FOUND"
                            : "OPEN_LIBRARY_UNAVAILABLE",
                message: error.message || "Impossible de récupérer le livre.",
            },
        });
    }
}

module.exports = { getBookDetails };