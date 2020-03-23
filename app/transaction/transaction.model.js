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
    payments: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'users'
            },
            payment: {
                type: Number,
                required: true,
                default: 0
            },
            remain: {
                type: Number,
                required: true,
                default: 0
            },
            type: {
                type: String,
                enum: ['CASHBACK', 'DEBT']
            }

        }
    ],
    payer: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    remainAmount: Number,
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
