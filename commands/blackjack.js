const i18n = require("../util/i18n");
const walletlistModel = require('../schemas/walletlist');
const balancelistModel = require("../schemas/balancelist");
const gamestatsModel = require("../schemas/gamestats");
const { randomInt } = require("crypto");
const { shuffleCards, totalValues } = require("../util/blackjack");


module.exports = {
    name: "blackjack",
    cooldown: 1,
    description: i18n.__("jackpot.description"),
    async execute(message, args) {
        try {
            

            const numberRegex = new RegExp('^[0-9]*$')

            if (!numberRegex.test(args[0])) {
                return message.reply("Please enter the amount you wish to play blackjack for. eg. /ramcoin blackjack 1000")
            }

            let wager = parseInt(args[0]);

            const sender = await walletlistModel.findOne({user_uuid: message.author.id});
            if (!sender) return message.reply(`<@${message.author.id}> does not have a wallet!`);

            const sender_balance = await balancelistModel.findOne({public_key: sender.public_key});;

            if (!sender_balance) {
                return message.reply("You do not have enough RamCoin!");
            } 

            if (sender_balance.value < wager) {
                return message.reply("You do not have enough RamCoin!");
            }

            balancelistModel.findOneAndUpdate({public_key: sender.public_key}, {$inc : {'value' : -wager}}).exec();
            let gamblecomplete = false;

            // Set up the text to be used

            let blackjack_header = 'Blackjack started.'
            let blackjack_body1 = ''
            let blackjack_body2 = ''
            let blackjack_footer = '\n👍 to hit, ✋ to stay';

            // Initial Reply
            const blackjackmessage = await message.reply(blackjack_header);

            // Shuffle Cards and Deal them out.
            let cardShuffle = shuffleCards();
            let player_cards = [];
            let dealer_cards = [];

            player_cards.push(cardShuffle.shift());
            player_cards.push(cardShuffle.shift());
            dealer_cards.push(cardShuffle.shift());
            dealer_cards.push(cardShuffle.shift());
            
            blackjack_body1 += `\n Dealer plays ${dealer_cards[0].text} upright and another card face down.`
            blackjack_body1 += `\n Dealer deals ${player_cards[0].text}.`
            blackjack_body1 += `\n Dealer deals ${player_cards[1].text}.`
            blackjack_body2 = `\n Current value of your hand is: ${totalValues(player_cards)}`

            await blackjackmessage.edit(blackjack_header + blackjack_body1 + blackjack_body2 + blackjack_footer);
            await blackjackmessage.react('👍')
            await blackjackmessage.react('✋')         
            
            const filter = (reaction, user) => {
                return reaction.emoji.name === '👍' || reaction.emoji.name === '✋' && user.id === message.author.id && !user.bot;
            };
            
            const collector = blackjackmessage.createReactionCollector({filter});
            collector.on("collect", async (reaction, user) => {
                
                switch (reaction.emoji.name) {
                    case "👍":
                        await reaction.users.remove(user);

                        blackjack_body1 += `\n Player hits`
                        player_cards.push(cardShuffle.shift());
                        blackjack_body1 += `\n Dealer deals ${player_cards[player_cards.length-1].text}.`
                        blackjack_body2 = `\n Current value of your hand is: ${totalValues(player_cards)}`

                        if(totalValues(player_cards) > 21) {
                            blackjack_body2 = `\n You Bust!`
                            await blackjackmessage.edit(blackjack_header + blackjack_body1 + blackjack_body2);
                            gamblecomplete = true;
                            collector.stop();

                            // NO WINNINGS

                            break
                        }

                        await blackjackmessage.edit(blackjack_header + blackjack_body1 + blackjack_body2 + blackjack_footer);
                        break

                    case "✋":

                        blackjack_body2 = ``

                        await reaction.users.remove(user);
                        console.log("Removing Reactions On: Stay");

                        blackjack_body1 += `\n Player stays on: ${totalValues(player_cards)}`
                        blackjack_body1 += `\n Dealer unveils his second card as ${dealer_cards[1].text}.`

                        await blackjackmessage.edit(blackjack_header + blackjack_body1 + blackjack_body2);

                        while (totalValues(dealer_cards) < 16) {
                            dealer_cards.push(cardShuffle.shift());
                            blackjack_body1 += `\n Dealer deals himself ${dealer_cards[dealer_cards.length-1].text}.`
                            await blackjackmessage.edit(blackjack_header + blackjack_body1 + blackjack_body2);

                        }

                        blackjack_body1 += `\n Player card value: ${totalValues(player_cards)}`
                        blackjack_body1 += `\n Dealer card value: ${totalValues(dealer_cards)}`

                        if(totalValues(player_cards) == totalValues(dealer_cards) && totalValues(player_cards) < 22 && totalValues(dealer_cards) < 22){

                            blackjack_body2 = `\n Tie!`

                            // NO WINNINGS
                            await blackjackmessage.edit(blackjack_header + blackjack_body1 + blackjack_body2);
                            balancelistModel.findOneAndUpdate({public_key: sender.public_key}, {$inc : {'value' : wager}}).exec();
                            gamblecomplete = true;
                            collector.stop()

                        } else if (totalValues(dealer_cards) >= totalValues(player_cards) && totalValues(dealer_cards) < 22) {
                            blackjack_body2 = `\n Dealer Wins`

                            // NO WINNINGS
                            await blackjackmessage.edit(blackjack_header + blackjack_body1 + blackjack_body2);
                            gamblecomplete = true;
                            collector.stop()

                            gamestatsModel.findOneAndUpdate({game_name: 'blackjack'}, {$inc: {'house_number_wins': 1, 'house_amount_wins': wager}}).exec()
 
                        } else  {
                            blackjack_body2 = `\n Player Wins`
                            balancelistModel.findOneAndUpdate({public_key: sender.public_key}, {$inc : {'value' : wager*2}}).exec();
                            await blackjackmessage.edit(blackjack_header + blackjack_body1 + blackjack_body2);
                            gamblecomplete = true;
                            collector.stop()

                            gamestatsModel.findOneAndUpdate({game_name: 'blackjack'}, {$inc: {'player_number_wins': 1, 'player_amount_wins': wager}}).exec()

                        }

                        break
                    default:
                        reaction.users.remove(user).then(()=> console.log("Removing Reactions On: Default")).catch(console.error);
                        break
                }

            });

            collector.on("end", (reason) => {
                console.log(`Removing Reactions On: End`)
                console.log(reason)
                blackjackmessage.reactions.removeAll().catch(error => console.error('Failed to clear reactions:', error));

                if (gamblecomplete === false) {
                    console.log("It appears thats something went wrong so here is your gamble back")
                    balancelistModel.findOneAndUpdate({public_key: sender.public_key}, {$inc : {'value' : wager}}).exec();
                }
            })
           
        } catch (error) {
            console.error(error)
        }
    
        return;
        
      }
    };


