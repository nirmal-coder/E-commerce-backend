const Cart = require("../model/cart");
const Product = require("../model/product");

const addTocart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      const err = new Error("Product ID and quantity are required.");
      err.statusCode = 400;
      throw err;
    }

    if (quantity <= 0) {
      const err = new Error("Quantity must be greater than zero.");
      err.statusCode = 400;
      throw err;
    }

    const product = await Product.findById(productId);

    if (!product) {
      const err = new Error("Product not found.");
      err.statusCode = 404;
      throw err;
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [
          {
            product: productId,
            quantity,
          },
        ],
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (itemIndex > -1) {
        if (cart.items[itemIndex].quantity > product.stock) {
          const err = new Error("Quantity exceeds available stock.");
          err.statusCode = 400;
          throw err;
        }
      }

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity = quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }
    }
    await cart.save();

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

const getCartData = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product",
      "items.quantity",
      "name price images stock"
    );

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart is empty.",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Cart data fetched successfully!",
      data: cart.items,
    });
  } catch (error) {
    next(error);
  }
};

const deleteFromCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      const err = new Error("cart not found!");
      err.statusCode = 404;
      throw err;
    }

    const itemExists = cart.items.find(
      (items) => items.product.toString() === productId
    );
    if (!itemExists) {
      const err = new Error("Product not found in cart");
      err.statusCode = 404;
      throw err;
    }

    await Cart.updateOne(
      { user: userId },
      { $pull: { items: { product: productId } } }
    );

    const updatedCart = await Cart.findOne({ user: userId });

    res.status(200).json({
      success: true,
      message: "Item deleted from cart successfully!",
      data: updatedCart,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { addTocart, getCartData, deleteFromCart };
