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
    facebook_id: String,
    facebook_link: String,
    deleted: Boolean,
    totalSpentAmount: Number,
    totalLoanAmount: Number
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
}));

module.exports = (users)
