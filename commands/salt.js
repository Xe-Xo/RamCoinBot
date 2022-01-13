const i18n = require("../util/i18n");
const walletlistModel = require('../schemas/walletlist');
const {STARTING_BALANCE} = require("../util/Util");
const balancelistModel = require("../schemas/balancelist");

module.exports = {
    name: "salt",
    description: i18n.__("salt.description"),
    async execute(message) {
        try {
            
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
                const newBalance = new balancelistModel({
                    public_key: sender.public_key,
                    value: STARTING_BALANCE
                })
                newBalance.save();
                return;
            }

            return message.reply("Why are you Salty?");

        } catch (error) {
            console.error(error)
        }
    
        return;
        
      }
    };