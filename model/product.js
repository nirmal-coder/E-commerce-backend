const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

const subCategoryEnum = [
  "mens-clothing",
  "womens-clothing",
  "footwear",
  "accessories",
  "watches",
  "mobiles-tablets",
  "laptops-computers",
  "audio-devices",
  "cameras-accessories",
  "gaming",
  "kitchen-appliances",
  "home-decor",
  "furniture",
  "lighting",
  "cleaning-essentials",
  "skincare",
  "haircare",
  "makeup",
  "fragrance",
  "grooming-tools",
  "fitness-equipment",
  "sportswear",
  "outdoor-gear",
  "nutrition-supplements",
  "yoga-meditation",
  "educational-toys",
  "action-figures",
  "board-games",
  "school-supplies",
  "outdoor-toys",
];

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    description: {
      type: String,
      required: true,
      maxlength: 2000,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },

    discountPrice: {
      type: Number,
      default: 0,
      validate: {
        validator: function (v) {
          return v <= this.price;
        },
        message: "Discount price cannot exceed original price",
      },
    },

    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },

    images: {
      type: [
        {
          public_id: { type: String, required: true, trim: true },
          url: {
            type: String,
            required: true,
            validate: {
              validator: (v) =>
                /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/.test(v),
              message: "Invalid image URL format.",
            },
          },
        },
      ],
      required: [true, "Images are required"],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length >= 3 && v.length <= 5;
        },
        message: "A product must have between 3 and 5 images.",
      },
    },

    category: {
      type: String,
      required: true,
      enum: [
        "fashion-apparel",
        "electronics",
        "home-kitchen",
        "beauty-personal-care",
        "sports-fitness",
        "kids-toys",
      ],
      index: true, // faster category filters
    },

    subCategory: {
      type: String,
      required: true,
      enum: subCategoryEnum,
    },
    ratings: [ratingSchema],

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    bestSeller: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

async function reCalcAvergeRating(doc) {
  if (!doc) return;
  if (doc.ratings.length > 0) {
    const totalRatings = doc.ratings.length;
    const sumRatings = doc.ratings.reduce((sum, r) => sum + r.rating, 0);
    doc.averageRating = sumRatings / totalRatings;
    doc.totalReviews = totalRatings;
  } else {
    doc.averageRating = 0;
    doc.totalReviews = 0;
  }
  await doc.save();
}
productSchema.post("findOneAndUpdate", async function (doc) {
  await reCalcAvergeRating(doc);
});

module.exports = mongoose.model("Product", productSchema);
