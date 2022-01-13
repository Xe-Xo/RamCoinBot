const i18n = require("../util/i18n");
const walletlistModel = require('../schemas/walletlist');
const balancelistModel = require("../schemas/balancelist");

module.exports = {
    name: "tip",
    description: i18n.__("tip.description"),
    async execute(message, args) {

        try {

            if (args) {

                const prefixRegex = new RegExp(`<@(.*)>`);
                const numberRegex = new RegExp('(.*)')

                const sender = await walletlistModel.findOne({user_uuid: message.author.id});
                if (!sender) return message.reply(`<@${message.author.id}> does not have a wallet!`);

                const sender_balance = await balancelistModel.findOne({public_key: sender.public_key});;

                if (!sender_balance) {
                    return message.reply("You do not have enough RamCoin!");
                } 

                if (sender_balance.value < 1) {
                    return message.reply("You do not have enough RamCoin!");
                }

                for(let user of args){
                    
                    let recipient_uuid;
                    // IF MATCHES @ REGEX REMOVE
                    if (prefixRegex.test(user)) {

                        recipient_uuid = user.match(numberRegex).join('');
                        
                        
                    } else {

                        user = user.replace('@', '')

                        let user_by_name = await message.guild.members.search({ query: `${user}`, limit: 100 });
                        let user_values = Array.from(user_by_name.values());

                        for(let temp_user of user_values){
                            if(temp_user.displayName === user){
                                
                                user_values = [temp_user];
                                break
                            } else {
                                console.log(`${temp_user.displayName} === ${user}`)
                            }
                        }
                                  
                        if (user_values.length === 1) {
                            
                            recipient_uuid = user_values[0].id;
                            
                        } else {

                            let username_values = [];

                            for(let user_value of user_values){
                                username_values.push(user_value.displayName);
                            }

                            return message.reply(`Please type the name correctly. Possible Names Found: ${username_values}`);
                        }

                    }

                    const recipient = await walletlistModel.findOne({user_uuid: recipient_uuid});

    
                    if (!recipient) return message.reply(`<@${recipient_uuid}> does not have a wallet!`);


    
                    balancelistModel.findOneAndUpdate({public_key: sender.public_key}, {$inc : {'value' : -1}}).exec();
                    balancelistModel.findOneAndUpdate({public_key: recipient.public_key}, {$inc : {'value' : 1}}).exec();
    
                    message.reply(`<@${message.author.id}> has sent <@${recipient_uuid}> 1 RamCoin!`)

                }
                return;

                

                

            };
                

        } catch (error) {
            console.error(error)
        }
    }
};