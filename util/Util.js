try {
    config = require("../config.json");3
  } catch (error) {
    config = null;
  }
  
exports.TOKEN = config ? config.TOKEN : process.env.TOKEN;
exports.PREFIX = (config ? config.PREFIX : process.env.PREFIX) || "/ramcoin";
exports.MONGODB_URI = config ? config.MONGODB_URI : process.env.MONGODB_URI;
exports.LOCALE = (config ? config.LOCALE : process.env.LOCALE) || "en";
exports.STARTING_BALANCE = (config ? config.STARTING_BALANCE : process.env.STARTING_BALANCE) || 10;