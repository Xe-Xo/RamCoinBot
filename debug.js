const gamestatsModel = require('./schemas/gamestats');

const mongoDB = require('mongoose');
const { TOKEN, PREFIX, MONGODB_URI } = require("./util/Util");

const db = mongoDB.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => console.log(`Connected to database`)).catch(err => console.log(`Oops, there was an error! ${err}`))


const blackjack = new gamestatsModel({
    game_name: 'blackjack',
    player_number_wins: 0,
    house_number_wins: 0,
    player_amount_wins: 0,
    house_amount_wins: 0
});

blackjack.save();