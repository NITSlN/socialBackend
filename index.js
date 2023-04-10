const express = require('express');
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const postRoutes = require('./routes/post');

// Use routes
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', postRoutes);


// Starting the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
