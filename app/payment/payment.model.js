const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const payments = mongoose.model('payments', new mongoose.Schema({

    note: {
        type: Schema.Types.ObjectId,
        ref: 'notes'
    },

    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    
    value: {
        type: Number,
        required: true,
        default: 0
    },    
    
    type: {
        type: String,
        enum: ['CASHBACK', 'DEBT']
    },
    
    deleted: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
}));

module.exports = (payments)
