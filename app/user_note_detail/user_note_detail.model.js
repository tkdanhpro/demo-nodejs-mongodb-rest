const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userNoteDetails = mongoose.model('user_note_details', new mongoose.Schema({
    note : {
        type: Schema.Types.ObjectId,
        ref: 'notes'
    },
    user : {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    isLeft:{
        type: Boolean,
        default: false
    },
    userRemainAmount: {
        type: Number,
        default: 0
    },
    userPaymentAmount: {
        type: Number,
        default: 0
    },
    userPaidAmount: {
        type: Number,
        default: 0
    },
    deleted: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum:['PENDING', 'CANCELED', 'ACCEPTED', 'REJECTED'],
        default: 'PENDING'
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
}));

module.exports = (userNoteDetails)
