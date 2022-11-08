import { Client } from "discord.js";

const dotenv = require('dotenv');

dotenv.config()


const token = process.env.BOT_TOKEN;

console.log("Bot is starting...");

const client = new Client ({
    intents: []
});

client.login(token);