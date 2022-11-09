import { Client } from "discord.js";
import { stat } from "fs";
const dotenv = require('dotenv');
import ready from "./listeners/ready";
import status from "./listeners/status";

dotenv.config()


const token = process.env.BOT_TOKEN;



const client = new Client ({
    intents: []
});

ready(client)
status(client)

client.login(token);


console.log("Bot has been started")