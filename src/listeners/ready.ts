import { Client } from 'discord.js'
import { ILogger } from '../logger/logger'

export default (client: Client, logger: ILogger): void => {
  client.on('ready', async () => {
    if ((client.user == null) || (client.application == null)) {
      return
    }

    logger.logSync('INFO', `${client.user.username}#${client.user.discriminator} ist online!`)
  })
}
