const gamestatsModel = require('../schemas/gamestats');


module.exports = {
    name: "stats",
    description: i18n.__("stats.description"),
    async execute(message) {
      
      try {
        
        response_string = `Blackjack Game Stats`

        const blackjack_stats = await gamestatsModel.findOne({game_name: 'blackjack'}).exec();

        let total_games = blackjack_stats.player_number_wins + blackjack_stats.house_number_wins
        
        response_string += `\nPlayer Games Won - ${blackjack_stats.player_number_wins}`
        response_string += `\nHouse Games Won - ${blackjack_stats.house_number_wins}`
        response_string += `\nPlayer Total Winnings - ${blackjack_stats.player_amount_wins}`
        response_string += `\nHouse Total Winnings - ${blackjack_stats.house_amount_wins}`

        if (total_games > 0) {
            let win_percentage = Math.round((blackjack_stats.player_amount_wins/total_games) * 100)
            response_string += `\nWin Percentage - ${win_percentage}%`
        }
       
        message.reply(response_string);

      } catch (error) {
          console.error(error)
      }
  
      return;
  
  }
  };