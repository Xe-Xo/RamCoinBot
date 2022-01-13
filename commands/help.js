const i18n = require("../util/i18n");
const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "help",
    description: i18n.__("help.description"),
    async execute(message) {
      let commands = Array.from(message.client.commands.values());
  
      let helpEmbed = new MessageEmbed()
        .setTitle(i18n.__mf("help.embedTitle", { botname: message.client.user.username }))
        .setDescription(i18n.__("help.embedDescription"))
        .setColor("#F8AA2A");


  
      commands.forEach((cmd) => {
        helpEmbed.addField(
          `**${message.client.prefix}${cmd.name} ${cmd.aliases ? `(${cmd.aliases})` : ""}**`,
          `${cmd.description}`,
          true
        );
      });
  
      helpEmbed.setTimestamp();
  

      return message.channel.send({
        embeds: [
          helpEmbed
        ]
      })
        .then(console.log)
        .catch(console.error);
    }
  };