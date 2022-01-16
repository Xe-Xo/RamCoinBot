const i18n = require("../util/i18n");
const walletlistModel = require('../schemas/walletlist');
const {STARTING_BALANCE} = require("../util/Util");
const balancelistModel = require("../schemas/balancelist");

module.exports = {
    name: "salt",
    description: i18n.__("salt.description"),
    async execute(message) {
        try {
            

            let amount_to_add = 0;
            let total_amount_above = 0;

            const less_than_balances = await balancelistModel.find({value: {$lt: STARTING_BALANCE}});
            less_than_balances.forEach(function(balancedoc) {amount_to_add += (STARTING_BALANCE - balancedoc.value)});

            const greater_than_balances = await balancelistModel.find({value: {$gt: STARTING_BALANCE}});
            greater_than_balances.forEach(function(balancedoc) {total_amount_above += balancedoc.value});
            greater_than_balances.forEach(function(balancedoc) {
                let amount_to_remove = Math.round(amount_to_add / (balancedoc.value/total_amount_above));
                await balancelistModel.findOneAndUpdate({public_key: balancedoc.public_key}, {value: {$inc: -amount_to_remove}}).exec();
            });

            less_than_balances.forEach(function(balancedoc) {
                await balancelistModel.findOneAndUpdate({public_key: balancedoc.public_key}, {value: STARTING_BALANCE}).exec();
            });

            return message.reply(":salt:");




            const sender = await walletlistModel.findOne({user_uuid: message.author.id});
            if (!sender) return message.reply(`<@${message.author.id}> does not have a wallet!`);

            const sender_balance = await balancelistModel.findOne({public_key: sender.public_key});;

            if (!sender_balance) {
                const newBalance = new balancelistModel({
                    public_key: sender.public_key,
                    value: STARTING_BALANCE
                })
                newBalance.save();
                return;
            } 

            if (sender_balance.value < STARTING_BALANCE) {
                balancelistModel.findOneAndUpdate({public_key: sender.public_key}, {value: STARTING_BALANCE}).exec();
                
            }

            return message.reply("Why are you Salty?");

        } catch (error) {
            console.error(error)
        }
    
        return;
        
      }
    };