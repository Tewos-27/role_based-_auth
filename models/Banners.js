// models/Banner.js
const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema({
    // Title of the banner, required field
    title: {
        type: String,
        required: true,
        trim: true, // Removes whitespace from both ends of a string
    },
    // Optional description for the banner
    description: {
        type: String,
        trim: true,
    },
    // URL or path to the uploaded banner image, required field
    imageUrl: {
        type: String,
        required: true,
    },
    // Optional link associated with the banner
    link: {
        type: String,
        trim: true,
    },
    // Flag to determine if the banner is currently active/visible
    isActive: {
        type: Boolean,
        default: true,
    },
    // Timestamp for when the banner was created
    createdAt: {
        type: Date,
        default: Date.now,
    },
    // Timestamp for when the banner was last updated
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Pre-save hook to update the `updatedAt` field before saving
BannerSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Export the Banner model
module.exports = mongoose.model('Banner', BannerSchema);
