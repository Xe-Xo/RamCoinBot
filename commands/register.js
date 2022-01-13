const i18n = require("../util/i18n");
const walletlistModel = require('../schemas/walletlist');
const { ec, keypairToHex} = require('../util/crypto');
const {STARTING_BALANCE} = require("../util/Util");
const balancelistModel = require("../schemas/balancelist");

module.exports = {
  name: "register",
  description: i18n.__("register.description"),
  async execute(message) {
    
    try {
        const existing = await walletlistModel.findOne({user_uuid : message.author.id})
        if (existing) {
            message.reply("Your key has been sent direct messaged to you.");
            return message.author.send(`You Already Have A Wallet! \n Your private key: ${existing.private_key} \n Your public key: ${existing.public_key}`)
        } else {
            
            const keyPair = ec.genKeyPair();
            const privateKey = keypairToHex(keyPair)
            const publicKey = keyPair.getPublic().encode('hex')

            const newWallet = new walletlistModel({
                user_uuid: message.author.id,
                private_key: privateKey,
                public_key: publicKey
            });
            newWallet.save();

            const newBalance = new balancelistModel({
                public_key: publicKey,
                value: STARTING_BALANCE
            })
            newBalance.save();
            message.reply(`Welcome to Ramcoin <@${message.author.id}>! Please see your direct message for your public/private key!`);
            return message.author.send(`Wallet created! \n Your private key: ${privateKey} \n Your public key: ${publicKey}`)
            
        }
    } catch (error) {
        console.error(error)
    }

    return;

}
};