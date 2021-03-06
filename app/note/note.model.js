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

    members: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'users'
            },
            status: {
                type: String,
                enum:['PENDING', 'CANCELED', 'ACCEPTED', 'REJECTED'],
                default: 'PENDING'
            }
        }
    ],
    status: {
        type: String,
        enum: ['OPENING', 'COMPLETED', 'CLOSED'],
        default: 'OPENING'
    },
    totalCashIn: {
        type: Number,
        default: 0
    },
    totalCashOut: {
        type: Number,
        default: 0
    },
    totalRemain: {
        type: Number,
        default: 0
    },
    userRemainAmount: Number
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
}));

module.exports = (notes)
