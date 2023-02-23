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
import { PersistentDataStorage } from './action/blackjack/persistentDataStorage'
import { evalGiveawayBackground } from './action/giveaway'

const logManager: LogManager = LogManager.getInstance()

dotenv.config()

const token = process.env.BOT_TOKEN

const dbFile = process.env.DB_PATH ?? './sqlite3.db'

async function init (): Promise<void> {
  try {
    const db = await AsyncDatabase.open(dbFile)
    logManager.logger('sqlite3').logSync('INFO', `DB opened ${path.resolve(dbFile)}`)

    await db.serializeAsync(async () => {
      await db.runAsync(`CREATE TABLE IF NOT EXISTS reports (
            identifier INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE,
            uuid TEXT NOT NULL UNIQUE,
            creator_id TEXT NOT NULL,
            reported_id TEXT NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            message TEXT,
            status INT NOT NULL)`)
      await db.runAsync(`CREATE TABLE IF NOT EXISTS videoCache (
              identifier INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE,
              video_title TEXT NOT NULL,
              url TEXT NOT NULL UNIQUE,
              description TEXT NOT NULL
              )`)
      await db.runAsync(`CREATE TABLE IF NOT EXISTS records(
              identifier INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE,
              uuid TEXT NOT NULL UNIQUE,
              dc_id TEXT NOT NULL,
              type INTEGER NOT NULL,
              points INTEGER NOT NULL,
              reason INTEGER NOT NULL
      )`)
      await db.runAsync(`CREATE TABLE IF NOT EXISTS giveaways(
        identifier INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE,
        winner_id TEXT,
        message_id TEXT NOT NULL UNIQUE,
        organizer_id TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        status INTEGER NOT NULL,
        prize TEXT NOT NULL
      )`)
      await db.runAsync(`CREATE TABLE IF NOT EXISTS giveaway_participants(
        identifier INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE,
        giveaway_message_id TEXT NOT NULL,
        dc_id TEXT NOT NULL,
        hash TEXT NOT NULL UNIQUE ON CONFLICT REPLACE${'' /* Sollte mal ein Hash sein, ist aber keiner (nicht wundern) */}
      )`)
      if ((await db.getAsync("select count(*) as count from pragma_table_info('giveaways') where name = 'channel_id';", [])).count === 0) {
        await db.runAsync(`ALTER TABLE giveaways add channel_id TEXT NULL`)
        await db.runAsync(`ALTER TABLE giveaways add author_display_name TEXT NULL`)
        await db.runAsync(`ALTER TABLE giveaways add author_avatar_url TEXT NULL`)
      }
      await (await PersistentDataStorage.instance()).initBlackJack(db)
    })

    const client = new Client({
      intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMessages
      ]
    })

    ready(client, logManager.logger())
    status(client, logManager.logger()) // set the status to Testing and Playing as the activity
    interactionCreate(client, logManager, db)
    registerCommands(client, logManager.logger('Command-Registrierung'))
    await message(client, logManager.logger('Message-Logger'))

    await client.login(token)

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setInterval(async () => {
      await evalGiveawayBackground(client, db, logManager)
    }, 1000 * 60 * 5) // every 5 minutes
  } catch (err) {
    logManager.logger().logSync('ERROR', `Failed to initialize system. Used db ${path.resolve(dbFile)}, error: ${JSON.stringify(err)}`)
  }
}

void init()
