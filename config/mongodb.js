const mongoose = require("mongoose");

const connectDb = async () => {
  return mongoose
    .connect(process.env.MONGODB_CONNECTION)
    .then(() => console.log("MongoDB Connected successfully!"))
    .catch((e) => {
      console.log("error : ", e);
      process.exit(1);
    });
};

module.exports = connectDb;
