const express = require("express");
const { createUser, loginUser, adminLogin } = require("../controllers/auth");
const router = express.Router();

router.post("/auth/register", createUser);
router.post("/auth/login", loginUser);
router.post("/admin/login", adminLogin);

module.exports = router;
