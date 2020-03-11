const mongoose = require('mongoose');

const users = mongoose.model('users', new mongoose.Schema({
    firstName: String,
    lastName: String,
    phoneNumber: String,
    email: String,
    password_hash: String,
    gender: String,
    platform: String,
    provider: String,
    avatarUrl: String,
    status: String,
    birthDay: String,
    facebookId: String,
    googleId: String,
    facebookLink: String,
    deleted: Boolean,
    totalSpentAmount: Number,
    totalLoanAmount: Number,
        
    settings: {
        notification: Boolean,
        language: String,
        version: String
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
}));

module.exports = (users)
