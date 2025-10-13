const jwt = require("jsonwebtoken");

// Generate token function
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role }, // payload
    process.env.JWT_SECRET, // secret key
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" } // options
  );
};

// utils/validateProduct.js
const validateProductData = (data, isUpdate = false) => {
  const {
    name,
    description,
    images,
    category,
    price,
    discountPrice,
    stock,
    brand,
  } = data;

  // 🔹 Only check required fields if this is a creation (not a partial update)
  if (!isUpdate) {
    if (!name || !description || !price || !images || !category || !brand) {
      throw new Error("All fields are required!");
    }
  }

  // 🔹 Validate image array structure if provided
  if (images) {
    if (!Array.isArray(images) || images.length < 3 || images.length > 6) {
      throw new Error("Product must have 3–6 images.");
    }

    const invalidImage = images.some((img) => !img.public_id || !img.url);
    if (invalidImage) {
      throw new Error("Each image must include 'public_id' and 'url'.");
    }
  }

  // 🔹 Price and discount validation
  if (price !== undefined && price <= 0) {
    throw new Error("Price must be greater than 0.");
  }

  if (
    discountPrice !== undefined &&
    price !== undefined &&
    discountPrice > price
  ) {
    throw new Error("Discount price must be less than actual price!");
  }

  // 🔹 Stock validation
  if (stock !== undefined && stock < 0) {
    throw new Error("Stock is required!.");
  }
};

const createError = (message, code) => {
  const err = new Error(message);
  err.statusCode = code;
  return err;
};
module.exports = {
  generateToken,
  validateProductData,
  createError,
};
