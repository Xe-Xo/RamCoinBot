const i18n = require("../util/i18n");
const walletlistModel = require('../schemas/walletlist');
const balancelistModel = require("../schemas/balancelist");
const { randomInt } = require("crypto");


module.exports = {
    name: "deathroll",
    description: i18n.__("deathroll.description"),
    async execute(message, args) {
        try {
            
            const numberRegex = new RegExp('[1-9][0-9]*')

            if (!numberRegex.test(args[0])) {
                return message.reply("Please enter the amount you wish to deathroll. eg. /ramcoin deathroll 10")
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

            response_message = await message.channel.send("STARTING A DEATHROLL. PLEASE REPLY WITH /accept");
            const filter = m => m.content.startsWith('/accept');
            replied_collection = await response_message.channel.awaitMessages({ filter, max: 1, time: 60_000, errors: ['time'] });
            let repliedTo = replied_collection.at(0);

            const accepter = await walletlistModel.findOne({user_uuid: repliedTo.author.id});
            if (!accepter) return repliedTo.reply(`<@${message.author.id}> does not have a wallet!`);

            const accepter_balance = await balancelistModel.findOne({public_key: accepter.public_key});;

            if (!accepter_balance) {
                return message.reply("You do not have enough RamCoin!");
            } 

            if (accepter_balance.value < wager) {
                return message.reply("You do not have enough RamCoin!");
            }

            balancelistModel.findOneAndUpdate({public_key: accepter.public_key}, {$inc : {'value' : -wager}}).exec();
            balancelistModel.findOneAndUpdate({public_key: sender.public_key}, {$inc : {'value' : -wager}}).exec();
            

            let lastroll = parseInt(args[0]);
            let max = parseInt(args[0])

            let output_message_text = `:skull: DEATHROLL ACCEPTED! :skull: \n STARTING DEATHROLL FOR ${max}R`
            let output_message = await repliedTo.reply(output_message_text);
            
            let rollerA = message.author.id;
            let rollerB = repliedTo.author.id;
            let current_roller = rollerA;
            let delay;

            while (lastroll > 1) {


                delay = Math.round(((max - lastroll)/max)*3000);
                delay = Math.min(Math.max(delay, 500), 3000);

                await new Promise(r => setTimeout(r, delay));
                let roll = randomInt(1, lastroll+1)
                output_message_text += `\n <@${current_roller}> rolling between 1 - ${lastroll}: ${roll}`
                await output_message.edit(output_message_text);


                if (current_roller === rollerA) {
                    current_roller = rollerB
                } else {
                    current_roller = rollerA
                }

                lastroll = roll;

                
                
            }

            output_message_text += `\n <@${current_roller}> Wins!`

            const winner = await walletlistModel.findOne({user_uuid: current_roller});
            const winner_balance = await balancelistModel.findOne({public_key: winner.public_key});;
            balancelistModel.findOneAndUpdate({public_key: winner.public_key}, {$inc : {'value' : wager*2}}).exec();

            return output_message.edit(output_message_text);


        } catch (error) {
            console.error(error)
        }
    
        return;
        
      }
    };