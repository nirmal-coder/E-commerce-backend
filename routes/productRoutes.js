const express = require("express");
const userAuth = require("../middleware/userAuth");
const isAdmin = require("../middleware/isAdmin");
const {
  addProduct,
  getAllProduct,
  getProductById,
  updateProduct,
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
router.patch("/products/:id", userAuth, isAdmin, updateProduct);

module.exports = router;
