const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notes = mongoose.model('notes', new mongoose.Schema({
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    admin: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: String,
    transactions: [
        {
            type: Schema.Types.ObjectId,
            ref: 'transactions'
        }
    ],
    members: [
        {
            type: Schema.Types.ObjectId,
            ref: 'users'
        }
    ],
    status: {
        type: String,
        enum: ['OPENING', 'LOCKED', 'FINISHED', 'CLOSED']
    },
    totalAmount: Number,
    remainAmount: Number
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
}));

module.exports = (notes)
