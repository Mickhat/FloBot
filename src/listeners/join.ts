import { ChannelType, Client, Colors, EmbedBuilder } from 'discord.js'
import { ILogger } from '../logger/logger'

export default async (client: Client, logger: ILogger): Promise<void> => {
  logger.logSync('INFO', 'Initializing join logger')

  client.on('guildMemberAdd', async (member) => {
    await logger.log('INFO', `${member.user.username} joined`)
    const logChannel = await member.guild?.channels.fetch(process.env.JOIN_LOGS ?? '')

    if (logChannel == null) {
      logger.logSync('WARN', 'JoinLogger could not find log channel')
      return
    }

    if (logChannel.type !== ChannelType.GuildText) {
      logger.logSync('WARN', 'LogChannel is not TextBased')
      return
    }

    await logChannel.send({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `${member.user.username} - ${member.id}`,
            iconURL: `${member.user.avatarURL()}`
          })
          .setTitle(`Member joined!`)
          .setDescription(`<@${member.id}> joined on <t:${Math.floor((member.joinedAt?.getTime() ?? 0) / 1000)}:f>`)
          .setColor(Colors.Green)
      ]
    })
  })

  client.on('guildMemberRemove', async (member) => {
    await logger.log('INFO', `${member.user.username} left`)
    const logChannel = await member.guild?.channels.fetch(process.env.JOIN_LOGS ?? '')

    if (logChannel == null) {
      logger.logSync('WARN', 'JoinLogger could not find log channel')
      return
    }

    if (logChannel.type !== ChannelType.GuildText) {
      logger.logSync('WARN', 'LogChannel is not TextBased')
      return
    }

    await logChannel.send({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `${member.user.username} - ${member.id}`,
            iconURL: `${member.user.avatarURL()}`
          })
          .setTitle(`Member left :(`)
          .setDescription(
            `<@${member.id}> joined on <t:${Math.floor(
              (member.joinedAt?.getTime() ?? 0) / 1000
            )}:f> and left on <t:${Math.floor(Date.now() / 1000)}:f>`
          )
          .setColor(Colors.Yellow)
      ]
    })
  })
}
