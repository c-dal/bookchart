const { Router } = require("express");
const authenticate = require("../middleware/auth");
const {
  getUserBooks,
  changeBookStatus,
  removeBook,
} = require("../controllers/libraryController");

const router = Router();

router.use(authenticate);
router.get("/", getUserBooks);
router.delete("/:bookId/remove", removeBook);
router.patch("/:bookId/status", changeBookStatus);

module.exports = { libraryRouter: router };
