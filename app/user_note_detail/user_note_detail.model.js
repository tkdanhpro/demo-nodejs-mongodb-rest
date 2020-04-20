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
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
}));

module.exports = (userNoteDetails)
