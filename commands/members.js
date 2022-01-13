const i18n = require("../util/i18n");
const walletlistModel = require('../schemas/walletlist');
const balancelistModel = require("../schemas/balancelist");


module.exports = {
  name: "members",
  description: i18n.__("members.description"),
  async execute(message) {
    
    try {

        let memberstring = ""

        const wallets = await walletlistModel.find({})

        for(let wallet of wallets){
            const balance = await balancelistModel.findOne({public_key: wallet.public_key});
            if (balance) {
                memberstring += `\n<@${wallet.user_uuid}> - ${balance.value}R`
            } else {
                memberstring += `\n<@${wallet.user_uuid}> - 0R`
            }
        }

        return message.reply(memberstring);
    
            
    } catch (error) {
        console.error(error)
    }

    return;

}
};