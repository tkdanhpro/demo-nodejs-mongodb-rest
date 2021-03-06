const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactions = mongoose.model('transactions', new mongoose.Schema({
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    note: {
        type: Schema.Types.ObjectId,
        ref: 'notes'
    },
    type: {
        type: String,
        enum: ['IN', 'OUT']
    },
    value: {
        type: Number,
        required: true,
        default: 1000
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: String,
    users: [
        {
            type: Schema.Types.ObjectId,
            ref: 'users'
        }
    ],
    payer: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    remainAmount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['CREATED', 'COMPLETED'],
        default: 'CREATED'
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

module.exports = (transactions)
