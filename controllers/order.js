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

module.exports = {
  createOrder,
};
