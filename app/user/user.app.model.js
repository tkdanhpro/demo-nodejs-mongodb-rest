const mongoose = require('mongoose');

module.exports = mongoose.model("userApp", new mongoose.Schema({
    userId: String,
    appId: String,
    appVersion: String,
    fcmToken: String
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
}));