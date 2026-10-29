const { Router } = require("express");
const authenticate = require("../middleware/auth");
const { search } = require("../controllers/searchController");

const router = Router();

router.use(authenticate);
router.get("/", search);

module.exports = { searchRouter: router };
