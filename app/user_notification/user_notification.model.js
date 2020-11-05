const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const user_notifications = mongoose.model('user_notifications', new mongoose.Schema({
    user : {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    attachment: Object,
    type: {
        type: String,
        enum: ['INVITATION']
    },
    status: {
        type: String,
        enum: ['NEW', 'SEEN'],
        default: 'NEW'
    },
    deleted: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
}));

module.exports = (user_notifications)
