const User = require('../models/User');
const TokenBlacklist = require('../models/TokenBlacklist'); // Import the new model
const jwt = require('jsonwebtoken');

// Helper function to generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1h', // Token expires in 1 hour
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { username, email, password, role } = req.body;

    try {
        // Check if user already exists
        const userExists = await User.findOne({ $or: [{ username }, { email }] });

        if (userExists) {
            return res.status(400).json({ message: 'User with that username or email already exists' });
        }

        // Create new user
        const user = await User.create({
            username,
            email,
            password,
            role: role || 'user', // Default role to 'user' if not provided
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// @desc    Log out user (blacklist token)
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];

        // Decode the token to get its expiration time
        const decoded = jwt.decode(token);
        if (!decoded || !decoded.exp) {
            return res.status(400).json({ message: 'Invalid token, cannot determine expiration' });
        }

        // Convert expiration timestamp (seconds) to Date object (milliseconds)
        const expiresAt = new Date(decoded.exp * 1000);

        // Add token to blacklist
        await TokenBlacklist.create({ token, expiresAt });

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during logout' });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
    // req.user is set by the protect middleware
    if (req.user) {
        res.json({
            _id: req.user._id,
            username: req.user.username,
            email: req.user.email,
            role: req.user.role,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password'); // Exclude passwords
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching users' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser, // Export the new logout function
    getProfile,
    getAllUsers,
};
