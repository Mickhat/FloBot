import { ChannelType, Client } from 'discord.js'
import { ILogger } from '../logger/logger'
import schedule from 'node-schedule'

export default (client: Client, logger: ILogger): void => {
  client.on('ready', async () => {
    if (client.user == null || client.application == null) {
      return
    }

    logger.logSync('INFO', `${client.user.username}#${client.user.discriminator} ist online!`)

    // Everyday at 13:37 (24 hour clock)
    schedule.scheduleJob('* * * * *', async () => {
      logger.logSync('INFO', `Entered scheduleJob : channel_id=${process.env.SEND_1337_CHANNEL_ID}`)
      const targetChannel = await client.channels.fetch(process.env.SEND_1337_CHANNEL_ID ?? '')

      logger.logSync('INFO', `Before if`)
      if (!targetChannel || targetChannel.type !== ChannelType.GuildText) {
        logger.logSync('WARN', 'MessageLogger could not find log channel or LogChannel is not TextBased')
        return
      }
      logger.logSync('INFO', `Before send`)
      await targetChannel.send('13:37')
    })
  })
}
