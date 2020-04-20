const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const forgotPasswords = mongoose.model('forgot_passwords', new mongoose.Schema({

    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    
    code: {
        type: Number,
        required: true
    },    
    
    verified: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
}));

module.exports = (forgotPasswords)
