const i18n = require("../util/i18n");
const walletlistModel = require('../schemas/walletlist');
const balancelistModel = require("../schemas/balancelist");
const { randomInt } = require("crypto");


module.exports = {
    name: "gamble",
    description: i18n.__("gamble.description"),
    async execute(message, args) {
        try {
            
            const numberRegex = new RegExp('[1-9][0-9]*')

            if (!numberRegex.test(args[0])) {
                return message.reply("Please enter the amount you wish to gamble. eg. /ramcoin gamble [amount]")
            }

            if (!args[0]) {
                return message.reply("Please enter the amount you wish to gamble. eg. /ramcoin gamble [amount]")
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

            let output_message_text = `Gamble of ${wager} from <@${message.author.id}> Accepted!`
            let output_message = await message.reply(output_message_text);

            while(true){
                await new Promise(r => setTimeout(r, 3000));
                let house_roll = randomInt(1,101);
                let sender_roll = randomInt(1,101);
                
                output_message_text += `\n <@${message.author.id}> rolling between 1 - 100: ${sender_roll}`;
                output_message_text += `\n The House rolling between 1 - 100: ${house_roll}`;
                
                if (sender_roll > house_roll) {
                    output_message_text += `\n <@${message.author.id}> Wins!`
                    balancelistModel.findOneAndUpdate({public_key: sender.public_key}, {$inc : {'value' : wager*2}}).exec();
                    break;
                }

                if (sender_roll < house_roll) {
                    output_message_text += `\n The House Wins!`
                    break;
                }

                await output_message.edit(output_message_text);

            }

            return output_message.edit(output_message_text);

        } catch (error) {
            console.error(error)
        }
    
        return;
        
      }
    };