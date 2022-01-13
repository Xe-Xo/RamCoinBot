const mongoose = require('mongoose');

const walletlistSchema = new mongoose.Schema({
    user_uuid: String,
    private_key: String,
    public_key: String
})





module.exports = mongoose.model('Walletlist', walletlistSchema)