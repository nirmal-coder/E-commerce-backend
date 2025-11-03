const express = require("express");
const userAuth = require("../middleware/userAuth");
const isAdmin = require("../middleware/isAdmin");
const {
  addProduct,
  getAllProduct,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/product");
const upload = require("../middleware/multer");

const router = express.Router();

const fields = [
  {
    name: "image1",
    maxCount: 1,
  },
  {
    name: "image2",
    maxCount: 1,
  },
  {
    name: "image3",
    maxCount: 1,
  },
  {
    name: "image4",
    maxCount: 1,
  },
  {
    name: "image5",
    maxCount: 1,
  },
];

router.post(
  "/admin/products",
  userAuth,
  isAdmin,
  upload.fields([...fields]),
  addProduct
);
router.get("/products", getAllProduct);
router.get("/products/:id", getProductById);
router.put(
  "/products/:id",
  userAuth,
  isAdmin,
  upload.fields([{ name: "newImages", maxCount: 5 }]),
  updateProduct
);
router.delete("/products/delete/:id", userAuth, isAdmin, deleteProduct);

module.exports = router;
