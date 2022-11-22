import { Client, IntentsBitField } from 'discord.js'
import dotenv from 'dotenv'
import ready from './listeners/ready'
import status from './listeners/status'
import interactionCreate from './listeners/interactionCreate'
import { LogManager } from './logger/logger'
import registerCommands from './action/registerCommands'
import { verbose } from 'sqlite3'
import message from './listeners/message'
import path from 'path'

const sqlite = verbose()

const logManager: LogManager = new LogManager('./logs')
const dbLogger = logManager.logger('sqlite3')

dotenv.config()

const token = process.env.BOT_TOKEN

const dbFile = process.env.DB_PATH ?? './sqlite3.db'

const db = new sqlite.Database(dbFile, (err) => {
  if (err != null) {
    dbLogger.logSync('ERROR', `DB-Open failed. Tried to open ${path.resolve(dbFile)}, error: ${JSON.stringify(err)}`)
    return
  }
  dbLogger.logSync('INFO', `DB opened ${path.resolve(dbFile)}`)
})

db.serialize(() => {
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
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildMessages
  ]
})

ready(client, logManager)
status(client, logManager) // set the status to Testing and Playing as the activity
interactionCreate(client, logManager, db)
registerCommands(client, logManager.logger('Command-Registrierung'))
message(client, logManager.logger('Message-Logger'))
  .catch((err) => dbLogger.logSync('ERROR', `Failed to message: ${JSON.stringify(err)}`))

client.login(token)
  .catch((err) => dbLogger.logSync('ERROR', `Failed to client.logoin: ${JSON.stringify(err)}`))
