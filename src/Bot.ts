import { Client } from "discord.js";
const dotenv = require('dotenv');
import ready from "./listeners/ready";

dotenv.config()


const token = process.env.BOT_TOKEN;

console.log("Bot is starting...");

const client = new Client ({
    intents: []
});

ready(client)


client.login(token);