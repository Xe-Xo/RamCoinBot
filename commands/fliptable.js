const i18n = require("../util/i18n");
const {STARTING_BALANCE} = require("../util/Util");
const balancelistModel = require("../schemas/balancelist");

module.exports = {
    name: "fliptable",
    cooldown: 86400, //24 hours between flips
    description: i18n.__("fliptable.description"),
    async execute(message) {
        try {
            

            const greater_than_balances = await balancelistModel.find({value: {$gt: (STARTING_BALANCE * 100)}});
            if(greater_than_balances.length === 0) return message.reply("Nope!");

            const balances = await balancelistModel.find({});

            balances.forEach(async function(balancedoc) {
                await balancelistModel.findOneAndUpdate({public_key: balancedoc.public_key}, {value: STARTING_BALANCE}).exec();
            });

            return message.reply("(╯°□°）╯︵ ┻━┻");

        } catch (error) {
            console.error(error)
        }
    
        return;
        
      }
    };