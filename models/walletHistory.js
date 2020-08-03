let mongoose = require('mongoose');
let mongoosePaginate = require('mongoose-paginate-v2');

const Schema = mongoose.Schema

const WalletHistorySchema = new Schema({
    type: String,
    title: String,
    description: String,
    value: String
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

WalletHistorySchema.plugin(mongoosePaginate)

const walletHistories =  mongoose.model('walletHistories', WalletHistorySchema)

module.exports = walletHistories;