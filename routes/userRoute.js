const express = require("express");
const userAuth = require("../middleware/userAuth");
const { getUser, updateUser, deleteUser } = require("../controllers/user");

const router = express.Router();

router.get("/user/me", userAuth, getUser);
router.patch("/user/me", userAuth, updateUser);
router.delete("/user/me", userAuth, deleteUser);

module.exports = router;
