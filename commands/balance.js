const i18n = require("../util/i18n");
const walletlistModel = require('../schemas/walletlist');
const balancelistModel = require("../schemas/balancelist");
const {STARTING_BALANCE} = require("../util/Util");

module.exports = {
  name: "balance",
  description: i18n.__("balance.description"),
  async execute(message) {
    try {
        const existing = await walletlistModel.findOne({user_uuid : message.author.id})
        if (existing) {
            const balance = await balancelistModel.findOne({public_key: existing.public_key});
            if (balance) {
                return message.reply(i18n.__mf("balance.balanceMessage", {public_key: existing.public_key,balance: balance.value}))
            } else {

                const newBalance = new balancelistModel({
                    public_key: existing.public_key,
                    value: STARTING_BALANCE
                })
                newBalance.save();

                return message.reply(i18n.__mf("balance.balanceMessage", {public_key: existing.public_key,balance: 0}))

            }
        } else {
            return message.reply(i18n.__mf("balance.nowalletMessage"));
        }
    } catch (error) {
        console.error(error)
    }

    return;
    
  }
};