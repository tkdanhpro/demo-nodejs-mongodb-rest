const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const user_invitations = mongoose.model('user_invitations', new mongoose.Schema({
    note : {
        type: Schema.Types.ObjectId,
        ref: 'notes'
    },
    receiver : {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    sender : {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    status: {
        type: String,
        enum: ['WAITING', 'ACCEPTED', 'REJECTED'],
        default: 'WAITING'
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
}));

module.exports = (user_invitations)
