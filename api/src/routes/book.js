const express = require("express");
const {
  getBookDetails,
  addBookToLibrary,
} = require("../controllers/bookController");
const authenticate = require("../middleware/auth");

const router = express.Router();

router.get("/:openLibraryId", authenticate, getBookDetails);
router.post("/add/:openLibraryId", authenticate, addBookToLibrary);

module.exports = { bookRouter: router };
