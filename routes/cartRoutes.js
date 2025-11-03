const express = require("express");
const userAuth = require("../middleware/userAuth");
const {
  addTocart,
  getCartData,
  deleteFromCart,
  multipleItemAdd,
} = require("../controllers/cart");

const router = express.Router();

// Add to cart
router.post("/cart", userAuth, addTocart);
router.post("/cart/merge", userAuth, multipleItemAdd);
// Get all cart Data
router.get("/cart", userAuth, getCartData);
// delete Item from Cart
router.delete("/cart/:productId", userAuth, deleteFromCart);

module.exports = router;
