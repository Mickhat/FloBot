import { Client, IntentsBitField } from 'discord.js'
import dotenv from 'dotenv'
import ready from './listeners/ready'
import status from './listeners/status'
import { LogManager } from './logger/logger'
import registerCommands from './action/registerCommands'
import { AsyncDatabase } from './sqlite/sqlite'
import message from './listeners/message'
import path from 'path'
import { PersistentDataStorage } from './action/blackjack/persistentDataStorage'
import fs from "node:fs"
import { Button, Command, Menu, MessageContextMenu, Modal, UserContextMenu, isButton, isCommand, isMenu, isMessageContextMenu, isModal, isUserContextMenu } from './commandTypes'
import { handleBlackJackCommands } from './action/blackjack/handleCommands'
import { registerBlackJackCommands } from './action/blackjack/registerCommands'

const logManager: LogManager = LogManager.getInstance()

dotenv.config()

const token = process.env.BOT_TOKEN

const dbFile = process.env.DB_PATH ?? './sqlite3.db'

async function init(): Promise<void> {
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
    registerCommands(client, logManager.logger('Command-Registrierung'))
    await message(client, logManager.logger('Message-Logger'))

    const commands: Command[] = []
    // command handling
    const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'))
    for (const file of commandFiles) {
      const command = (await import(`./commands/${file}`)).default
      // check if command is a valid command
      if (!command || !isCommand(command)) {
        console.error("Command file is not valid " + file)
        break
      }
      commands.push(command)
      console.log(`Command ${command.data.name} loaded`)
    }

    const buttons: Button[] = []
    // button handling
    const buttonFiles = fs.readdirSync('./src/buttons').filter(file => file.endsWith('.js'))
    for (const file of buttonFiles) {
      const button = (await import(`./buttons/${file}`)).default
      // check if button is a valid button
      if (!button || !isButton(button)) {
        console.error("Button file is not valid " + file)
        break
      }
      buttons.push(button)
      console.log(`Button ${button.buttonId.toString()} loaded`)
    }

    const menuInteractions: Menu[] = []
    // menu handling
    const menuFiles = fs.readdirSync('./src/menuInteractions').filter(file => file.endsWith('.js'))
    for (const file of menuFiles) {
      const menu = (await import(`./menuInteractions/${file}`)).default
      // check if menu is a valid menu
      if (!menu || !isMenu(menu)) {
        console.error("Menu file is not valid " + file)
        break
      }
      menuInteractions.push(menu)
      console.log(`Menu ${menu.customId.toString()} loaded`)
    }

    const messageContextMenuInteractions: MessageContextMenu[] = []
    // message context menu handling
    const messageContextMenuFiles = fs.readdirSync('./src/messageContextMenuInteractions').filter(file => file.endsWith('.js'))
    for (const file of messageContextMenuFiles) {
      const messageContextMenu = (await import(`./messageContextMenuInteractions/${file}`)).default
      // check if message context menu is a valid message context menu
      if (!messageContextMenu || !isMessageContextMenu(messageContextMenu)) {
        console.error("Message context menu file is not valid " + file)
        break
      }
      messageContextMenuInteractions.push(messageContextMenu)
      console.log(`Message context menu ${messageContextMenu.data.name} loaded`)
    }

    const modalInteractions: Modal[] = []
    // modal handling
    const modalFiles = fs.readdirSync('./src/modalInteractions').filter(file => file.endsWith('.js'))
    for (const file of modalFiles) {
      const modal = (await import(`./modalInteractions/${file}`)).default
      // check if modal is a valid modal
      if (!modal || !isModal(modal)) {
        console.error("Modal file is not valid " + file)
        break
      }
      modalInteractions.push(modal)
      console.log(`Modal ${modal.customId.toString()} loaded`)
    }

    const userContextMenuInteractions: UserContextMenu[] = []
    // user context menu handling
    const userContextMenuFiles = fs.readdirSync('./src/userContextMenuInteractions').filter(file => file.endsWith('.js'))
    for (const file of userContextMenuFiles) {
      const userContextMenu = (await import(`./userContextMenuInteractions/${file}`)).default
      // check if user context menu is a valid user context menu
      if (!userContextMenu || !isUserContextMenu(userContextMenu)) {
        console.error("User context menu file is not valid " + file)
        break
      }
      userContextMenuInteractions.push(userContextMenu)
      console.log(`User context menu ${userContextMenu.data.name} loaded`)
    }

    client.on("interactionCreate", async interaction => {
      if (interaction.isCommand()) {
        for await (const command of commands) {
          if (command.data.name === interaction.commandName) {
            await command.execute(interaction)
            return
          }
        }
        if (interaction.commandName === "bj") {
          await handleBlackJackCommands(interaction, logManager)
          return
        }
      }
      if (interaction.isButton()) {
        for await (const button of buttons) {
          if (button.buttonId instanceof RegExp) {
            if (button.buttonId.test(interaction.customId)) {
              await button.execute(interaction)
              return
            }
          } else {
            if (button.buttonId === interaction.customId) {
              await button.execute(interaction)
              return
            }
          }
        }
      }
      if (interaction.isStringSelectMenu()) {
        for await (const menu of menuInteractions) {
          if (menu.customId instanceof RegExp) {
            if (menu.customId.test(interaction.customId)) {
              await menu.execute(interaction)
              return
            }
          } else {
            if (menu.customId === interaction.customId) {
              await menu.execute(interaction)
              return
            }
          }
        }
      }

      if (interaction.isMessageContextMenuCommand()) {
        for await (const messageContextMenu of messageContextMenuInteractions) {
          if (interaction.commandName === messageContextMenu.data.name) {
            await messageContextMenu.execute(interaction)
            return
          }
        }
      }

      if (interaction.isModalSubmit()) {
        for await (const modal of modalInteractions) {
          if (modal.customId instanceof RegExp) {
            if (modal.customId.test(interaction.customId)) {
              await modal.execute(interaction)
              return
            }
          } else {
            if (modal.customId === interaction.customId) {
              await modal.execute(interaction)
              return
            }
          }
        }
      }

      if (interaction.isUserContextMenuCommand()) {
        for await (const userContextMenu of userContextMenuInteractions) {
          if (interaction.commandName === userContextMenu.data.name) {
            await userContextMenu.execute(interaction)
            return
          }
        }
      }
    })

    registerCommands(client, logManager.logger('Command-Registrierung'), [
      ...commands.map(command => command.data),
      ...messageContextMenuInteractions.map(messageContextMenu => messageContextMenu.data),
      ...userContextMenuInteractions.map(userContextMenu => userContextMenu.data),
      registerBlackJackCommands()
    ]
    )

    await client.login(token)
  } catch (err) {
    logManager.logger().logSync('ERROR', `Failed to initialize system. Used db ${path.resolve(dbFile)}, error: ${JSON.stringify(err)}`)
  }
}

void init()
