import { Client } from "discord.js";

const token = "";

console.log("Bot is starting...");

const client = new Client ({
    intents: []
});

client.login(token);


console.log(client)