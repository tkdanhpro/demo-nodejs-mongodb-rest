const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const users = mongoose.model('users', new mongoose.Schema({
    username: {
        type: String,
        trim: true,
        unique: true,
        sparse: true,
        immutable: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },   
    birthday: {
        type: Date,
        min: '1900-01-01',
        max: '2020-01-01'
    },
    gender: {
        type: String,
        enum: ['MALE', 'FEMALE']
    },
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
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ],
    type: {
        type: String,
        enum: ['FACEBOOK', 'GOOGLE', 'NORMAL']
    },
    
    platform: String,
    provider: String,
    picture: String,
    status: String,
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

    },

    notes: [
        {
            type: Schema.Types.ObjectId,
            ref: 'notes'
        }
    ],  
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
}));

module.exports = (users)
