const jwt = require("jsonwebtoken");

// Generate token function
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role }, // payload
    process.env.JWT_SECRET, // secret key
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" } // options
  );
};

const createError = (message, code) => {
  const err = new Error(message);
  err.statusCode = code;
  return err;
};

// utils/validateProduct.js
const validateProductData = (data, isUpdate = false) => {
  const {
    name,
    description,
    category,
    price,
    discountPrice,
    stock,
    subCategory,
  } = data;

  // 🔹 Only check required fields if this is a creation (not a partial update)
  if (!isUpdate) {
    if (!name || !description || !price || !category || !subCategory) {
      throw new Error("All fields are required!");
    }
  }

  const validCategory = [
    "fashion-apparel",
    "electronics",
    "home-kitchen",
    "beauty-personal-care",
    "sports-fitness",
    "kids-toys",
  ];

  const isValidCategory = validCategory.find((item) => item === category);

  if (!isValidCategory) {
    throw createError("Not a valid category!", 400);
  }

  const validSubCategories = {
    "fashion-apparel": [
      "mens-clothing",
      "womens-clothing",
      "footwear",
      "accessories",
      "watches",
    ],
    electronics: [
      "mobiles-tablets",
      "laptops-computers",
      "audio-devices",
      "cameras-accessories",
      "gaming",
    ],
    "home-kitchen": [
      "kitchen-appliances",
      "home-decor",
      "furniture",
      "lighting",
      "cleaning-essentials",
    ],
    "beauty-personal-care": [
      "skincare",
      "haircare",
      "makeup",
      "fragrance",
      "grooming-tools",
    ],
    "sports-fitness": [
      "fitness-equipment",
      "sportswear",
      "outdoor-gear",
      "nutrition-supplements",
      "yoga-meditation",
    ],
    "kids-toys": [
      "educational-toys",
      "action-figures",
      "board-games",
      "school-supplies",
      "outdoor-toys",
    ],
  };

  const isValidSubCategory = validSubCategories[category].includes(subCategory);

  if (!isValidSubCategory) {
    throw createError(
      `Invalid subcategory '${subCategory}' for category '${category}'`,
      400
    );
  }

  // // 🔹 Validate image array structure if provided
  // if (images) {
  //   if (!Array.isArray(images) || images.length < 3 || images.length > 6) {
  //     throw new Error("Product must have 3–6 images.");
  //   }

  //   const invalidImage = images.some((img) => !img.public_id || !img.url);
  //   if (invalidImage) {
  //     throw new Error("Each image must include 'public_id' and 'url'.");
  //   }
  // }

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

module.exports = {
  generateToken,
  validateProductData,
  createError,
};
