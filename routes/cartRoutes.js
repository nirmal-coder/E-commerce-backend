const express = require("express");
const userAuth = require("../middleware/userAuth");
const {
  addTocart,
  getCartData,
  deleteFromCart,
} = require("../controllers/cart");

const router = express.Router();

// Add to cart
router.post("/api/cart", userAuth, addTocart);
// Get all cart Data
router.get("/api/cart", userAuth, getCartData);
// delete Item from Cart
router.delete("/api/cart/:productId", userAuth, deleteFromCart);

module.exports = router;
