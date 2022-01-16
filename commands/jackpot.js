const i18n = require("../util/i18n");
const walletlistModel = require('../schemas/walletlist');
const balancelistModel = require("../schemas/balancelist");
const { randomInt } = require("crypto");


module.exports = {
    name: "jackpot",
    cooldown: 60,
    description: i18n.__("jackpot.description"),
    async execute(message, args) {
        try {
            
            const numberRegex = new RegExp('^[0-9]*$')

            if (!numberRegex.test(args[0])) {
                return message.reply("Please enter the amount you wish to jackpot for. eg. /ramcoin jackpot 1000")
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
            response_message = await message.channel.send("Jackpot has started. Respond with /join to be part of it.");
            const filter = m => m.content.startsWith('/join');
            let jackpot_collection = [sender.public_key];

            let prizepool = wager;
            const collector = response_message.channel.createMessageCollector({ filter, max: 10, time: 60_000, errors: ['time'] });


            collector.on('collect', async repliedTo => {

                let accepter = await walletlistModel.findOne({user_uuid: repliedTo.author.id});

                

                if (!accepter) return repliedTo.reply(`<@${message.author.id}> does not have a wallet!`);
                if (accepter.public_key === sender.public_key) return repliedTo.reply("You are already part of the jackpot!");

                let accepter_balance = await balancelistModel.findOne({public_key: accepter.public_key});

                if (!accepter_balance) {
                    return repliedTo.reply("You do not have enough RamCoin!");
                } 
    
                if (accepter_balance.value < wager) {
                    return repliedTo.reply("You do not have enough RamCoin!");
                }

                if (jackpot_collection.includes(accepter.public_key)) {return repliedTo.reply("You are already participating in the Jackpot!")};

                prizepool += wager;
                balancelistModel.findOneAndUpdate({public_key: accepter.public_key}, {$inc : {'value' : -wager}}).exec();
                jackpot_collection.push(accepter.public_key);
                return repliedTo.reply(`You have joined the jackpot with the current Prizepool of ${prizepool}R`);
            });
           

            await new Promise(r => setTimeout(r, 60000));

            let randomindex = randomInt(jackpot_collection.length)
            
            let winner_key = jackpot_collection[randomindex];
            const winner = await walletlistModel.findOne({public_key: winner_key});

            balancelistModel.findOneAndUpdate({public_key: winner_key}, {$inc : {'value' : prizepool}}).exec();


            message.reply(`:crown: Congratulations <@${winner.user_uuid}>, You have won a Jackpot of ${prizepool}R :crown:`)
           

        } catch (error) {
            console.error(error)
        }
    
        return;
        
      }
    };
