import { Routes } from 'discord.js'
import { REST } from '@discordjs/rest'
import { Client } from 'discord.js'
import { Logger } from 'src/logger/logger'
import CommandList from './buildCommands'

export default (client: Client, logger: Logger) => {
    if (process.env?.BOT_TOKEN == undefined) {
        logger.logSync("ERROR", "BOT_TOKEN fehlt.")
        return;
    }
    if (process.env?.APPLICATION_ID == undefined) {
        logger.logSync("ERROR", "APPLICATION_ID fehlt.")
        return;
    }


    let rest = new (REST)({ version: '10' }).setToken(process.env.BOT_TOKEN || "")

    client.once('ready', async () => {
        logger.logSync("INFO", "Registriere Commands")

        for await (const [_, g] of client.guilds.cache) {
            try {
                logger.logSync("INFO", `Registriere Commands für Server ${g.name ?? "<Name nicht bekannt>"} #${g.id}`)
                await rest.put(
                    Routes.applicationGuildCommands(process.env.APPLICATION_ID || "", g.id),
                    { body: CommandList }
                )
                logger.logSync("INFO", `Commands für Server ${g.name ?? "<Name nicht bekannt>"} #${g.id} registriert`)
            } catch (err) {
                logger.logSync("WARN", `Commands konnten für Server ${g.name ?? "<Name nicht bekannt>"} #${g.id} : ${err}`)
            }
          }
        })
    }
