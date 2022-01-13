const mongoose = require('mongoose');

const balancelistSchema = new mongoose.Schema({
    public_key: String,
    value: Number
})

module.exports = mongoose.model('Balancelist', balancelistSchema)