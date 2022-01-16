/**
 * Module Imports
 */

 const { Client, Collection, Intents } = require("discord.js");
 const { readdirSync } = require("fs");
 const { join } = require("path");
 const { TOKEN, PREFIX, MONGODB_URI, BALANCE_INCREASE } = require("./util/Util");
 const i18n = require("./util/i18n");
 const mongoDB = require('mongoose');
 

 const clientIntents = new Intents();
 clientIntents.add(Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILDS)


 const client = new Client({ intents: clientIntents });
 
 const db = mongoDB.connect(MONGODB_URI, {
   useNewUrlParser: true,
   useUnifiedTopology: true
 }).then(() => console.log(`Connected to database`)).catch(err => console.log(`Oops, there was an error! ${err}`))
 
 
 client.login(TOKEN);
 client.commands = new Collection();
 client.prefix = PREFIX;
 const cooldowns = new Collection();
 const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
 
 /**
  * Client Events
  */
 client.on("ready", () => {
   console.log(`${client.user.username} ready!`);
   client.user.setActivity(`${PREFIX}`, { type: "WATCHING" });
 });
 client.on("warn", (info) => console.log(info));
 client.on("error", console.error);
 
 /**
  * Import all commands
  */
 const commandFiles = readdirSync(join(__dirname, "commands")).filter((file) => file.endsWith(".js"));
 for (const file of commandFiles) {
   const command = require(join(__dirname, "commands", `${file}`));
   client.commands.set(command.name, command);
 }
 
 client.on("messageCreate", async (message) => {
  
   if (message.author.bot) return;
   if (!message.guild) return;
 
   const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(PREFIX)})\\s*`);
   if (!prefixRegex.test(message.content)) return;
 
   const [, matchedPrefix] = message.content.match(prefixRegex);
 
   const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
   const commandName = args.shift().toLowerCase();
 
   const command =
     client.commands.get(commandName) ||
     client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));
 
   if (!command) return;
 
   if (!cooldowns.has(command.name)) {
     cooldowns.set(command.name, new Collection());
   }
 
   const now = Date.now();
   const timestamps = cooldowns.get(command.name);
   const cooldownAmount = (command.cooldown || 1) * 1000;
 
   if (timestamps.has(message.author.id)) {
     const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
 
     if (now < expirationTime) {
       const timeLeft = (expirationTime - now) / 1000;
       return message.reply(
         i18n.__mf("common.cooldownMessage", { time: timeLeft.toFixed(1), name: command.name })
       );
     }
   }
 
   timestamps.set(message.author.id, now);
   setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
 
   try {
     command.execute(message, args);
   } catch (error) {
     console.error(error);
     message.reply(i18n.__("common.errorCommand")).catch(console.error);
   }
 });


const balancelistModel = require("./schemas/balancelist");

let myVar = setInterval(function(){ timer() }, 60000);

function timer() {
  const balances = await balancelistModel.find({});
  balances.forEach(async function(balancedoc) {
    await balancelistModel.findOneAndUpdate({public_key: balancedoc.public_key}, {$inc : {'value' : BALANCE_INCREASE}}).exec();
  });
}

function stopFunction() {
  clearInterval(myVar);
}