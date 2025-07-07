const express = require('express');
const { registerUser, loginUser, logoutUser, getProfile, getAllUsers } = require('../controller/authController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

const router = express.Router(); // This initializes the router

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', protect, logoutUser); // New logout route
// Protected routes
router.get('/profile', protect, getProfile);

// Admin-only route
router.get('/users', protect, authorize(['admin']), getAllUsers);

module.exports = router; // This exports the router instance directly
