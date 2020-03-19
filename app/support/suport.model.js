const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const support = mongoose.model('support', new mongoose.Schema({

    userId:{
            type: Schema.Types.ObjectId,
            ref: 'users'
    },
    content: {
        type: String,
        trim: true,
        required: true,
        max: 1000
    },
    timestamps: Number
}));

module.exports = support;