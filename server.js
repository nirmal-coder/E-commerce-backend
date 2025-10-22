const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
const connectDb = require("./config/mongodb");
const connectCloudinary = require("./config/cloudinary");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/userRoute");
const productRoute = require("./routes/productRoutes");
const cartRoute = require("./routes/cartRoutes");
const orderRoute = require("./routes/orderRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();
const PORT = process.env.PORT || 5000;

// -----------MIDDLEWARES---------------

app.use(
  cors({
    origin: ["http://localhost:5174", "http://localhost:5173"],
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-control",
      "Expires",
      "pragma",
      "token",
    ],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

// ---------------ROUTES---------------
app.use("/api", authRoute);
app.use("/api", userRoute);
app.use("/api", productRoute);
app.use("/api", cartRoute);
app.use("/api", orderRoute);

// handle not found routes
app.use(notFound);

// Handle thrown errors

app.use(errorHandler);

connectDb().then(() => {
  connectCloudinary();
  app.listen(PORT, () =>
    console.log("server is running on the port : " + PORT)
  );
});
