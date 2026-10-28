const express = require("express");
const { getBookDetails } = require("../controllers/bookController");

const router = express.Router();

router.get("/:openLibraryId", getBookDetails);

module.exports = { bookRouter: router };