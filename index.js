const express = require('express');
const app = express();
const { connectDB } = require('./config/db');
const cookieParser = require("cookie-parser");
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const postRoutes = require('./routes/post');

require('dotenv').config();
// Middleware to parse JSON request bodies
connectDB()
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

// Use routes
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', postRoutes);


// Starting the server
const serverStart = async () => {
  try {
    connectDB();
    app.listen(process.env.PORT || 3001, () => {
      console.log(
        `Server ready at http://localhost:${process.env.PORT || 3001}`
      );
    });
  } catch (error) {
    console.err("Error while connecting to database", error);
  }
};

serverStart();

