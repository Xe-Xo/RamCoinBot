const i18n = require("../util/i18n");
const walletlistModel = require('../schemas/walletlist');
const balancelistModel = require("../schemas/balancelist");


module.exports = {
  name: "members",
  description: i18n.__("members.description"),
  async execute(message) {
    
    try {

        let memberstring = ":crown: MEMBERS :crown:"

        const balances = await balancelistModel.find({}).sort({value: -1}).exec();

        for(let balance of balances){
        
            const wallet = await walletlistModel.findOne({public_key: balance.public_key});
            memberstring += `\n<@${wallet.user_uuid}> - ${balance.value}R`

        };

        return message.reply(memberstring);
    
            
    } catch (error) {
        console.error(error)
    }

    return;

}
};