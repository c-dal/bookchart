const express = require("express");
const {
  getBookDetails,
  addBookToLibrary,
} = require("../controllers/bookController");
const authenticate = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);
router.get("/:openLibraryId", getBookDetails);
router.post("/add/:openLibraryId", addBookToLibrary);

module.exports = { bookRouter: router };
