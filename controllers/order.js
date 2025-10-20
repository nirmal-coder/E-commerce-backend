const Cart = require("../model/cart");
const Order = require("../model/order");
const Product = require("../model/product");
const { createError } = require("../utils/Helpers");

const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { items, shippingAddress, totalAmount } = req.body;

    if (!items || items.length === 0) {
      throw createError("No items in order.", 400);
    }

    if (!shippingAddress) {
      throw createError("Shipping address required.", 400);
    }

    // Check stock for each product

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        throw createError("Product not found.", 404);
      }

      if (product.stock < item.quantity) {
        throw createError(`${product.name} is out of stock.`);
      }
    }

    const newOrder = new Order({
      user: userId,
      items,
      shippingAddress,
      totalAmount,
      paymentMethod: "COD",
    });

    await newOrder.save();

    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    //  clear cart

    const cart = await Cart.findOne({ user: userId });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully with COD!",
      data: newOrder,
    });
  } catch (error) {
    next(error);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const getOrders = await Order.find({ user: userId })
      .populate("items.productId", "name price image")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Orders data fetched successfully!",
      data: getOrders,
    });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.orderId;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw createError("Invalid order ID format", 400);
    }

    const order = await Order.findById(orderId);
    if (!order) {
      throw createError("No order exists", 404);
    }

    if (req.user.role === "admin" || order.user.toString() !== userId) {
      throw createError("You are not authorized to view this order", 403);
    }

    res.status(200).json({
      success: true,
      message: "order details fetched successfully!",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

const getAllOrdersForAdmin = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const orders = await Order.find({})
      .populate("user", "name email") // optional - to show who placed it
      .populate("items.productId", "name price image")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments();

    res.status(200).json({
      success: true,
      message: "Orders data fetched successfully!",
      data: orders,
      totalOrders,
    });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;
    const { status } = req.body;

    const validStatuses = ["Processing", "Shipped", "Delivered", "Cancelled"];

    if (!validStatuses.includes(status)) {
      throw createError("Invalid status value provided.", 400);
    }

    const order = await Order.findById(orderId);
    if (!order) {
      throw createError("Order not found.", 404);
    }

    if (order.orderStatus === "Delivered") {
      throw createError(
        "Invalid request! This order has already been delivered.",
        400
      );
    }

    order.orderStatus = status;

    if (status === "Delivered") {
      order.deliveredAt = new Date();
    }
    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status} successfully.`,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  getAllOrdersForAdmin,
  updateStatus,
};
