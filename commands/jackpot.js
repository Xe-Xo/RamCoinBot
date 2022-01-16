

module.exports = {
    name: "jackpot",
    description: i18n.__("jackpot.description"),
    async execute(message, args) {
        try {
            
            const numberRegex = new RegExp('[1-9][0-9]*')

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

            response_message = await message.channel.send("Jackpot has started. Respond with /join to be part of it.");
            const filter = m => m.content.startsWith('/join');
            let jackpot_collection = [sender.public_key];
            replied_collection = await response_message.channel.awaitMessages({ filter, max: 10, time: 60_000, errors: ['time'] });
            
            replied_collection.forEach(async function(repliedTo) {

                let accepter = await walletlistModel.findOne({user_uuid: repliedTo.author.id});

                if (!accepter) return repliedTo.reply(`<@${message.author.id}> does not have a wallet!`);
                if (accepter.public_key === sender.public_key) return repliedTo.reply("You are already part of the jackpot!");

                let accepter_balance = await balancelistModel.findOne({public_key: accepter.public_key});

                if (!accepter_balance) {
                    return message.reply("You do not have enough RamCoin!");
                } 
    
                if (accepter_balance.value < wager) {
                    return message.reply("You do not have enough RamCoin!");
                }

                //balancelistModel.findOneAndUpdate({public_key: accepter.public_key}, {$inc : {'value' : -wager}}).exec();
                jackpot_collection.push(accepter.public_key);
                return reply_message.reply("You have joined the jackpot");
                
            });

            delay(60000).then(() => {
                response_message.reply("Test Jackpot....")
            });
            

        } catch (error) {
            console.error(error)
        }
    
        return;
        
      }
    };
