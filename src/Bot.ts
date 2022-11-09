import { Client } from "discord.js";
import { stat } from "fs";
const dotenv = require('dotenv');
import ready from "./listeners/ready";
import status from "./listeners/status";
import interactionCreate from "./listeners/interactionCreate";
import { Logger, LogManager } from './logger/logger';
import registerCommands from './action/registerCommands'

let logManager:LogManager = new LogManager('./logs') ;


dotenv.config()

const token = process.env.BOT_TOKEN;



const client = new Client ({
    intents: []
});

ready(client, logManager)
status(client, logManager) // set the status to Testing and Playing as the activity
interactionCreate(client, logManager)
registerCommands(client, logManager.logger('Command-Registrierung'))

client.login(token);