const i18n = require("../util/i18n");
const {STARTING_BALANCE} = require("../util/Util");
const balancelistModel = require("../schemas/balancelist");

module.exports = {
    name: "fliptable",
    cooldown: 180, //180 minutes between flips
    description: i18n.__("fliptable.description"),
    async execute(message) {
        try {
            
            const balances = await balancelistModel.find({});

            balances.forEach(function(balancedoc) {
                await balancelistModel.findOneAndUpdate({public_key: balancedoc.public_key}, {value: STARTING_BALANCE}).exec();
            });

            return message.reply("(╯°□°）╯︵ ┻━┻");

        } catch (error) {
            console.error(error)
        }
    
        return;
        
      }
    };