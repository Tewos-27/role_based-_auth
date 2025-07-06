const mongoose = require('mongoose');

const TokenBlacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    blacklistedAt: {
        type: Date,
        default: Date.now
    }
});

// Add an index to automatically delete expired tokens
// This helps keep the blacklist clean and efficient
TokenBlacklistSchema.index({ "expiresAt": 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('TokenBlacklist', TokenBlacklistSchema);