const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const supports = mongoose.model('supports', new mongoose.Schema({
    email: String,
    message: String
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
}));

module.exports = supports;