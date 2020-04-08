const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userTransTracking = mongoose.model('user_trans_tracking', new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    note: {
        type: Schema.Types.ObjectId,
        ref: 'notes'
    },
    trans: {
        type: Schema.Types.ObjectId,
        ref: 'transactions'
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

module.exports = (userTransTracking)
