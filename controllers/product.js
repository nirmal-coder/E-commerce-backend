const { default: mongoose } = require("mongoose");
const Product = require("../model/product");
const { validateProductData } = require("../utils/Helpers");
const cloudinary = require("cloudinary").v2;

const selectedFeilds =
  "name price discountPrice images category brand stock isFeatured averageRating totalReviews";

const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      subCategory,
      price,
      discountPrice,
      stock,
      brand,
      bestSeller,
    } = req.body;
    const productData = req.body;
    validateProductData(productData);
    const existing = await Product.findOne({ name });
    if (existing)
      return res
        .status(400)
        .json({ success: false, message: "Product already exists." });

    const productStock = stock < 0 || !stock ? 0 : stock;

    const image1 = req.files.image1 && req.files.image1[0];
    const image2 = req.files.image2 && req.files.image2[0];
    const image3 = req.files.image3 && req.files.image3[0];
    const image4 = req.files.image4 && req.files.image4[0];
    const image5 = req.files.image5 && req.files.image5[0];

    const images = [image1, image2, image3, image4, image5].filter(
      (each) => each !== undefined
    );
    console.log(images);

    const imagesUrl = await Promise.all(
      images.map(async (items) => {
        let result = await cloudinary.uploader.upload(items.path, {
          resource_type: "image",
        });
        return {
          public_id: result.public_id,
          url: result.secure_url,
        };
      })
    );

    const newproduct = new Product({
      name,
      description,
      images: imagesUrl,
      category,
      subCategory,
      price,
      brand,
      discountPrice: discountPrice ?? 0,
      bestSeller: bestSeller || false,
      stock: productStock,
    });

    const savedProduct = await newproduct.save();

    return res.status(201).json({
      success: true,
      message: "Product added successfully.",
      data: savedProduct,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: error.message || "Something went wrong!.",
    });
  }
};

const getAllProduct = async (req, res) => {
  try {
    // pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // filters

    const filters = {};

    if (req.query.category) filters.category = req.query.category;
    if (req.query.brand) filters.brand = req.query.brand;
    if (req.query.isFeatured !== undefined)
      filters.isFeatured = req.query.isFeatured === "true";
    if (req.query.minPrice)
      filters.price = { $gte: Number(req.query.minPrice) };
    if (req.query.maxPrice) {
      filters.price = filters.price || {};
      filters.price.$lte = Number(req.query.maxPrice);
    }

    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const products = await Product.find(filters)
      .select(selectedFeilds)
      .sort({ [sortBy]: sortOrder }) // <-- Use Mongo sort here
      .skip(skip)
      .limit(limit);

    const totalProducts = await Product.countDocuments(filters);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalProducts / limit),
      },
      message: "Products fetched successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Something went wrong!",
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    const product = await Product.findById(id).select(selectedFeilds).populate({
      path: "ratings.userId",
      select: "name email -_id",
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
      message: "Product fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching product",
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔹 Validate incoming data before updating
    validateProductData(req.body, true);

    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      data: updatedProduct,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Something went wrong!",
    });
  }
};

// Delete product controller (Admin only)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });
    }

    // Optional: Check if product is linked to any active orders
    const activeOrder = await Order.findOne({
      "items.productId": id,
      orderStatus: { $in: ["pending", "shipped"] },
    });

    if (activeOrder) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete product linked to active orders.",
      });
    }

    // Delete product
    await product.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message:
        error.message || "Something went wrong while deleting the product!",
    });
  }
};

module.exports = {
  addProduct,
  getAllProduct,
  getProductById,
  updateProduct,
  deleteProduct,
};
