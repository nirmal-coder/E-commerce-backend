const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDb = require("./config/mongodb");
require("dotenv").config();
const authRoute = require("./routes/auth");
const userRoute = require("./routes/userRoute");
const productRoute = require("./routes/productRoutes");
const cartRouter = require("./routes/cartRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-control",
      "Expires",
      "pragma",
    ],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(authRoute);
app.use(userRoute);
app.use(productRoute);
app.use(cartRouter);

app.use(notFound);

// 🔥 Handle thrown errors

app.use(errorHandler);
connectDb().then(() => {
  app.listen(PORT, () =>
    console.log("server is running on the port : " + PORT)
  );
});
