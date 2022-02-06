const mongoose = require('mongoose');

// These names are soo stupid and i should change them but im too lazy right now..

const gamestatsSchema = new mongoose.Schema({
    game_name: String,
    player_number_wins: Number, //Win = +1
    house_number_wins: Number, //Loss = +1
    player_amount_wins: Number, //Win = +wager
    house_amount_wins: Number //Loss = +wager
})





module.exports = mongoose.model('Gamestats', gamestatsSchema)