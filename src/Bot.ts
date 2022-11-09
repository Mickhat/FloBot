import { Client } from "discord.js";
import { stat } from "fs";
const dotenv = require('dotenv');
import ready from "./listeners/ready";
import status from "./listeners/status";
import { Logger, LogManager } from './logger/logger';

let logManager:LogManager = new LogManager('./logs') ;

dotenv.config()


const token = process.env.BOT_TOKEN;



const client = new Client ({
    intents: []
});

ready(client)
status(client) // set the status to Testing and Playing as the activity

client.login(token);


console.log("Bot has been started")