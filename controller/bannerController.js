// controllers/bannerController.js
const Banner = require('../models/Banners'); // Import the Banner Mongoose model
const multer = require('multer'); // Import Multer for file uploads
const path = require('path'); // Node.js path module for handling file paths
const fs = require('fs'); // Node.js file system module for file operations (e.g., deleting files)

// Define the directory where banner images will be stored
const uploadDir = path.join(__dirname, '../uploads/banners');

// Check if the upload directory exists, if not, create it
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true }); // `recursive: true` ensures parent directories are also created
}

// Configure Multer storage
const storage = multer.diskStorage({
    // Define the destination directory for uploaded files
    destination: (req, file, cb) => {
        cb(null, uploadDir); // `cb` is the callback function (error, destination)
    },
    // Define the filename for uploaded files
    filename: (req, file, cb) => {
        // Create a unique filename using the original fieldname, current timestamp, and original file extension
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

// Configure Multer file filter to accept only image files
const fileFilter = (req, file, cb) => {
    // Check if the mimetype starts with 'image/'
    if (file.mimetype.startsWith('image/')) {
        cb(null, true); // Accept the file
    } else {
        cb(new Error('Only image files are allowed!'), false); // Reject the file with an error message
    }
};

// Initialize Multer upload middleware with storage and file filter configurations
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB (5 * 1024 * 1024 bytes)
});

// @desc    Create a new banner
// @route   POST /api/banners
// @access  Private/Admin
const createBanner = async (req, res) => {
    // Multer middleware (upload.single('bannerImage')) handles the file upload
    // If no file was uploaded, return an error
    if (!req.file) {
        return res.status(400).json({ message: 'No image file uploaded' });
    }

    // Extract banner data from the request body
    const { title, description, link, isActive } = req.body;
    // Construct the URL for the uploaded image based on the static serve path
    const imageUrl = `/uploads/banners/${req.file.filename}`;

    try {
        // Create a new banner document in the database
        const banner = await Banner.create({
            title,
            description,
            imageUrl,
            link,
            // Convert isActive string ('true'/'false') to a boolean
            isActive: isActive === 'true' || isActive === true,
        });
        res.status(201).json({ message: 'Banner created successfully', banner });
    } catch (error) {
        console.error('Error creating banner:', error);
        // If there's an error creating the banner in the DB, delete the uploaded file
        fs.unlink(req.file.path, (err) => {
            if (err) console.error('Error deleting uploaded file after DB error:', err);
        });
        res.status(500).json({ message: 'Server error during banner creation' });
    }
};

// @desc    Get all banners
// @route   GET /api/banners
// @access  Public
const getBanners = async (req, res) => {
    try {
        // Fetch all banner documents from the database
        const banners = await Banner.find({});
        res.status(200).json(banners);
    } catch (error) {
        console.error('Error fetching banners:', error);
        res.status(500).json({ message: 'Server error fetching banners' });
    }
};

// @desc    Get a single banner by ID
// @route   GET /api/banners/:id
// @access  Public
const getBannerById = async (req, res) => {
    try {
        // Find a banner by its ID from the request parameters
        const banner = await Banner.findById(req.params.id);
        // If no banner is found, return a 404 error
        if (!banner) {
            return res.status(404).json({ message: 'Banner not found' });
        }
        res.status(200).json(banner);
    } catch (error) {
        console.error('Error fetching banner by ID:', error);
        res.status(500).json({ message: 'Server error fetching banner' });
    }
};

// @desc    Update an existing banner
// @route   PUT /api/banners/:id
// @access  Private/Admin
const updateBanner = async (req, res) => {
    // Extract banner data from the request body
    const { title, description, link, isActive } = req.body;
    let imageUrl; // Variable to hold the new image URL if a file is uploaded

    try {
        // Find the banner by ID
        const banner = await Banner.findById(req.params.id);

        // If no banner is found, return a 404 error
        if (!banner) {
            // If a file was uploaded but the banner doesn't exist, delete the uploaded file
            if (req.file) {
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error('Error deleting uploaded file:', err);
                });
            }
            return res.status(404).json({ message: 'Banner not found' });
        }

        // If a new file is uploaded, update the imageUrl and delete the old file
        if (req.file) {
            imageUrl = `/uploads/banners/${req.file.filename}`;
            // Delete the old banner image if it exists and is stored in our uploads directory
            if (banner.imageUrl && banner.imageUrl.startsWith('/uploads/banners/')) {
                const oldImagePath = path.join(__dirname, '..', banner.imageUrl);
                fs.unlink(oldImagePath, (err) => {
                    if (err) console.error('Error deleting old banner image:', err);
                });
            }
            banner.imageUrl = imageUrl; // Update the banner's image URL
        }

        // Update banner fields if provided in the request body
        if (title) banner.title = title;
        if (description) banner.description = description;
        if (link) banner.link = link;
        // Convert isActive to boolean if provided
        if (isActive !== undefined) {
            banner.isActive = isActive === 'true' || isActive === true;
        }

        // Save the updated banner document
        const updatedBanner = await banner.save();
        res.status(200).json({ message: 'Banner updated successfully', banner: updatedBanner });
    } catch (error) {
        console.error('Error updating banner:', error);
        // If an error occurs during update, and a new file was uploaded, delete it
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting newly uploaded file after update error:', err);
            });
        }
        res.status(500).json({ message: 'Server error during banner update' });
    }
};

// @desc    Delete a banner
// @route   DELETE /api/banners/:id
// @access  Private/Admin
const deleteBanner = async (req, res) => {
    try {
        // Find the banner by ID
        const banner = await Banner.findById(req.params.id);

        // If no banner is found, return a 404 error
        if (!banner) {
            return res.status(404).json({ message: 'Banner not found' });
        }

        // Delete the associated image file from the file system
        if (banner.imageUrl && banner.imageUrl.startsWith('/uploads/banners/')) {
            const imagePath = path.join(__dirname, '..', banner.imageUrl);
            fs.unlink(imagePath, (err) => {
                if (err) console.error('Error deleting banner image file:', err);
            });
        }

        // Delete the banner document from the database
        await banner.deleteOne();
        res.status(200).json({ message: 'Banner deleted successfully' });
    } catch (error) {
        console.error('Error deleting banner:', error);
        res.status(500).json({ message: 'Server error during banner deletion' });
    }
};

// Export all controller functions and the Multer upload middleware
module.exports = {
    upload, // Export multer upload middleware to be used in routes
    createBanner,
    getBanners,
    getBannerById,
    updateBanner,
    deleteBanner,
};
