import { Client } from "discord.js";
import { stat } from "fs";
import dotenv from 'dotenv';
import ready from "./listeners/ready";
import status from "./listeners/status";
import interactionCreate from "./listeners/interactionCreate";
import { Logger, LogManager } from './logger/logger';
import registerCommands from './action/registerCommands'
import { verbose } from 'sqlite3';

const sqlite = verbose()


const logManager: LogManager = new LogManager('./logs');
const db_logger = logManager.logger('sqlite3')

dotenv.config()

const token = process.env.BOT_TOKEN;

const db = new sqlite.Database(process.env.DB_PATH ?? "./sqlite3.db",
    (err) => {
        if (err) {
            db_logger.logSync("ERROR", `DB-Open failed: ${JSON.stringify(err)}`)
            return;
        }
        db_logger.logSync("INFO", "DB opened.")
        db.run(`CREATE TABLE IF NOT EXISTS reports (
identifier INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE,
uuid TEXT NOT NULL UNIQUE,
creator_id TEXT NOT NULL,
reported_id TEXT NOT NULL,
category TEXT NOT NULL,
description TEXT,
message TEXT,
status INT NOT NULL)`)

    })


const client = new Client({
    intents: []
});

ready(client, logManager)
status(client, logManager) // set the status to Testing and Playing as the activity
interactionCreate(client, logManager, db)
registerCommands(client, logManager.logger('Command-Registrierung'))

client.login(token);
