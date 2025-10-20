const express = require("express");
const userAuth = require("../middleware/userAuth");
const {
  createOrder,
  getAllOrders,
  getOrderById,
  getAllOrdersForAdmin,
  updateStatus,
} = require("../controllers/order");
const isAdmin = require("../middleware/isAdmin");

const router = express.Router();

// for users

router.post("/orders", userAuth, createOrder);
router.get("/orders", userAuth, getAllOrders);
router.get("/orders/:orderId", userAuth, getOrderById);

//  for admin

router.get("/admin/orders", userAuth, isAdmin, getAllOrdersForAdmin);
router.patch("/admin/orders/:orderId/status", userAuth, isAdmin, updateStatus);

module.exports = router;
