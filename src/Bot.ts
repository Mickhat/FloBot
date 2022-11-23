import { Client, IntentsBitField } from 'discord.js'
import dotenv from 'dotenv'
import ready from './listeners/ready'
import status from './listeners/status'
import interactionCreate from './listeners/interactionCreate'
import { LogManager } from './logger/logger'
import registerCommands from './action/registerCommands'
import { AsyncDatabase } from './sqlite/sqlite'
import message from './listeners/message'
import path from 'path'

const logManager: LogManager = new LogManager('./logs')
const dbLogger = logManager.logger('sqlite3')

dotenv.config()

const token = process.env.BOT_TOKEN

const dbFile = process.env.DB_PATH ?? './sqlite3.db'

async function init (): Promise<void> {
  try {
    const db = await AsyncDatabase.open(dbFile)
    dbLogger.logSync('INFO', `DB opened ${path.resolve(dbFile)}`)

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
    await message(client, logManager.logger('Message-Logger'))

    await client.login(token)
  } catch (err) {
    dbLogger.logSync('ERROR', `Failed to initialize system. Used db ${path.resolve(dbFile)}, error: ${JSON.stringify(err)}`)
  }
}

void init()
