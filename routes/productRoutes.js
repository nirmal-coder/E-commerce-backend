const express = require("express");
const userAuth = require("../middleware/userAuth");
const isAdmin = require("../middleware/isAdmin");
const {
  addProduct,
  getAllProduct,
  getProductById,
  updateProduct,
} = require("../controllers/product");

const router = express.Router();

router.post("/api/admin/products", userAuth, isAdmin, addProduct);
router.get("/api/products", getAllProduct);
router.get("/api/products/:id", getProductById);
router.patch("/api/products/:id", userAuth, isAdmin, updateProduct);

module.exports = router;
