const mongoose = require('mongoose');


const users = mongoose.model('users', new mongoose.Schema({
    userName: {
        type: String,
        trim: true,
        unique: true,
        sparse: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    birthDay: Date,
    gender: String,
    phoneNumber: String,
    email: {
        type: String,
        // unique: true,
        lowercase: true,
        trim: true
        // validate: value => {
        //     if (!validator.isEmail(value)) {
        //         throw new Error({error: 'Invalid Email address!'})
        //     }
        // }
    },
 
    passwordHash: String,
    jwtToken: {
        type: String
    },
    gender: String,
    platform: String,
    provider: String,
    avatarUrl: String,
    status: String,
    birthDay: String,
    facebookId: {
        type: String,
        trim: true,
        unique: true,
        sparse: true
    },
    googleId: {
        type: String,
        trim: true,
        unique: true,
        sparse: true
    },
    facebookLink: String,
    deleted: Boolean,
    totalSpentAmount: Number,
    totalLoanAmount: Number,

    settings: {
        notification: Boolean,
        language: String,
        version: String,
        appId: String

    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
}));

module.exports = (users)
