import { Routes, Client } from 'discord.js'
import { REST } from '@discordjs/rest'
import { ILogger } from 'src/logger/logger'

export default (client: Client, logger: ILogger, commands: any[]): void => {
  if (process.env?.BOT_TOKEN === undefined) {
    logger.logSync('ERROR', 'BOT_TOKEN fehlt.')
    return
  }
  if (process.env?.APPLICATION_ID === undefined) {
    logger.logSync('ERROR', 'APPLICATION_ID fehlt.')
    return
  }

  logger.logSync('INFO', 'Anzahl der Commands: ' + commands.length.toString())
  console.log(commands)

  const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN ?? '')

  client.once('ready', async () => {
    logger.logSync('INFO', 'Registriere Commands')

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for await (const [_, g] of client.guilds.cache) {
      try {
        logger.logSync('INFO', `Registriere Commands für Server ${g.name ?? '<Name nicht bekannt>'} #${g.id}`)
        await rest.put(Routes.applicationGuildCommands(process.env.APPLICATION_ID ?? '', g.id), {
          body: [...commands]
        })
        logger.logSync('INFO', `Commands für Server ${g.name ?? '<Name nicht bekannt>'} #${g.id} registriert`)
      } catch (err) {
        logger.logSync(
          'WARN',
          `Commands konnten für Server ${g.name ?? '<Name nicht bekannt>'} #${g.id} : ${JSON.stringify(err)}`
        )
      }
    }
  })
}
