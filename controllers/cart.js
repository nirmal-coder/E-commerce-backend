const Cart = require("../model/cart");
const Product = require("../model/product");

// add single item to cart or updating quantity
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
      message: `${product.name} is added to cart succussfully!`,
    });
  } catch (error) {
    next(error);
  }
};

// getting cart data

const getCartData = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product",
      "name price images stock discountPrice"
    );

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart is empty.",
        data: [],
      });
    }

    const totalAmount = cart.items.reduce((acc, each) => {
      const price = each.product.discountPrice || each.product.price;
      return acc + price * each.quantity;
    }, 0);

    cart.items.totalAmount = totalAmount;

    res.status(200).json({
      success: true,
      message: "Cart data fetched successfully!",
      data: {
        items: cart.items,
        totalAmount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// deleting single cart item
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

// adding multiple items to cart while localStorage to db

const multipleItemAdd = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { items } = req.body;

    if (!items || !items.length) {
      const err = new Error("cart items are required.");
      err.statusCode = 400;
      throw err;
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [],
      });
    }
    for (const item of items) {
      const { productId, quantity } = item;

      if (!productId || !quantity) {
        const err = new Error(
          "Each product must include productId and quantity."
        );
        err.statusCode = 400;
        throw err;
      }

      const product = await Product.findById(productId);
      if (!product) {
        const err = new Error(`Product not found: ${productId}`);
        err.statusCode = 404;
        throw err;
      }

      if (quantity > product.stock) {
        const err = new Error(
          `Quantity exceeds available stock for ${product.name}`
        );
        err.statusCode = 400;
        throw err;
      }

      const itemIndex = cart.items.findIndex(
        (each) => each.product.toString() === productId
      );

      if (itemIndex > -1) {
        // Update existing item quantity (replace or increment)
        cart.items[itemIndex].quantity = quantity; // or += quantity
      } else {
        cart.items.push({ product: productId, quantity });
      }
    }

    await cart.save();

    res.status(200).json({
      success: true,
      data: cart,
      message: "Items added to cart successfully!",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { addTocart, getCartData, deleteFromCart, multipleItemAdd };
