const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // Assuming you have this for MongoDB connection
const authRoutes = require('./routes/auth');
const bannerRoutes = require('./routes/banner'); // Import the new banner routes
const path = require('path'); // Node.js path module for handling file paths

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB(); // Ensure this function correctly connects to your MongoDB database

const app = express();

// Middleware to parse JSON bodies from incoming requests
app.use(express.json());

// Serve static files from the 'uploads' directory
// This makes files in 'uploads/banners' accessible via '/uploads/banners/filename.jpg'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Define a simple root route to confirm the API is running
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Mount authentication routes under the '/api/auth' path
app.use('/api/auth', authRoutes);

// Mount banner routes under the '/api/banners' path
app.use('/api/banners', bannerRoutes); // Use the new banner routes

// Global error handling middleware (should be the last middleware)
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack to the console
    res.status(500).send('Something broke!'); // Send a generic 500 error response to the client
});

// Start the server on the specified port
const PORT = process.env.PORT || 5000; // Use port from environment variables or default to 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
