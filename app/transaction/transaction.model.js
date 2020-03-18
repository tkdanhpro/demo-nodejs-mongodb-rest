const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactions = mongoose.model('transactions', new mongoose.Schema({
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    type: {
        type: String,
        enum: ['IN', 'OUT']
    },
    value: Number,    
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: String,
    subMembers: [
        {
            type: Schema.Types.ObjectId,
            ref: 'users',
            subAmount: Number
        }
    ],
    status: {
        type: String,
        enum: ['OPENING', 'LOCKED', 'FINISHED', 'CLOSED']
    },
    
    deleted: Boolean

}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
}));

module.exports = (transactions)
