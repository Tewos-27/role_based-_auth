// routes/banner.js
const express = require('express');
const { protect } = require('../middleware/auth'); // Import your authentication middleware
const { authorize } = require('../middleware/role'); // Import your authorization middleware
const {
    upload,         // Multer middleware for file uploads
    createBanner,
    getBanners,
    getBannerById,
    updateBanner,
    deleteBanner,
} = require('../controllers/bannerController'); // Import banner controller functions

const router = express.Router();

// Public routes: Anyone can view banners
// GET /api/banners - Get all banners
router.get('/', getBanners);
// GET /api/banners/:id - Get a single banner by ID
router.get('/:id', getBannerById);

// Admin-only routes: Only authenticated administrators can manage banners
// POST /api/banners - Create a new banner (requires 'admin' role and file upload)
// `upload.single('bannerImage')` is Multer middleware that processes a single file upload
// where the field name in the form data is 'bannerImage'.
router.post('/', protect, authorize(['admin']), upload.single('bannerImage'), createBanner);

// PUT /api/banners/:id - Update an existing banner (requires 'admin' role and optional file upload)
router.put('/:id', protect, authorize(['admin']), upload.single('bannerImage'), updateBanner);

// DELETE /api/banners/:id - Delete a banner (requires 'admin' role)
router.delete('/:id', protect, authorize(['admin']), deleteBanner);

module.exports = router;
