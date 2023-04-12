const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log('Database connected');
  } catch (error) {
    console.error("Error while connecting to mongo database", error);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.connection.close();
};

module.exports = { connectDB, disconnectDB };
