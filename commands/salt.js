const i18n = require("../util/i18n");
const {STARTING_BALANCE} = require("../util/Util");
const balancelistModel = require("../schemas/balancelist");

module.exports = {
    name: "salt",
    cooldown: 60, //1 minute between salts
    description: i18n.__("salt.description"),
    async execute(message) {
        try {
            

            let amount_to_add = 0;
            let amount_above = 0;

            const less_than_balances = await balancelistModel.find({value: {$lt: STARTING_BALANCE}});

            less_than_balances.forEach(function(balancedoc) {amount_to_add += (STARTING_BALANCE - balancedoc.value)});

            console.log(amount_to_add);
            
            const greater_than_balances = await balancelistModel.find({value: {$gt: STARTING_BALANCE}});
            greater_than_balances.forEach(function(balancedoc) {amount_above += (balancedoc.value - STARTING_BALANCE)});
            console.log(amount_above);

            greater_than_balances.forEach( async function(balancedoc) {

                let new_balance = balancedoc.value - Math.round(Math.min(amount_to_add,amount_above) * ((balancedoc.value - STARTING_BALANCE)/amount_above));
                console.log(`Balance was ${balancedoc.value} ==> New Balance ${new_balance} --- ${balancedoc.value} - Math.round(${Math.min(amount_to_add,amount_above)} * ((${balancedoc.value} - ${STARTING_BALANCE})/${amount_above}))`);

                await balancelistModel.findOneAndUpdate({public_key: balancedoc.public_key}, {value: new_balance}).exec();
            });

            less_than_balances.forEach( async function(balancedoc) {
                await balancelistModel.findOneAndUpdate({public_key: balancedoc.public_key}, {value: STARTING_BALANCE}).exec();
            });

            return message.reply(":salt:");


        } catch (error) {
            console.error(error)
        }
    
        return;
        
      }
    };