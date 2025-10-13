const express = require("express");
const userAuth = require("../middleware/userAuth");
const { getUser, updateUser, deleteUser } = require("../controllers/user");

const router = express.Router();

router.get("/api/user/me", userAuth, getUser);
router.patch("/api/user/me", userAuth, updateUser);
router.delete("/api/user/me", userAuth, deleteUser);

module.exports = router;
