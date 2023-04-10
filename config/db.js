const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
  } catch (error) {
    const errorMessage = error.toString();
    if (errorMessage.includes("ECONNREFUSED")) {
      console.log("Connection to MongoDB failed");
      console.log("Unstable Network Connection");
      console.log("nvalid Connection String");
      console.log("MongoDB Server may not be running");
    } else {
      console.error("Error while connecting to mongo database", error);
    }
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.connection.close();
};

module.exports = { connectDB, disconnectDB };
