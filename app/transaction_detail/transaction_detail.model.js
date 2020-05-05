const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionDetails = mongoose.model('transaction_details', new mongoose.Schema({
    trans: {
        type: Schema.Types.ObjectId,
        ref: 'transactions'
    },
    value: Number,
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
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

module.exports = (transactionDetails)
