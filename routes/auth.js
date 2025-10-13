const express = require("express");
const { createUser, loginUser, adminLogin } = require("../controllers/auth");
const router = express.Router();

router.post("/api/auth/register", createUser);
router.post("/api/auth/login", loginUser);
router.post("/api/admin/login", adminLogin);

module.exports = router;
