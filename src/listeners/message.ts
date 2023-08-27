import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, Client, Colors, EmbedBuilder } from 'discord.js'
import { ILogger } from '../logger/logger'

export default async (client: Client, logger: ILogger): Promise<void> => {
  logger.logSync('INFO', 'Initializing message logger')
  client.on('messageUpdate', async (oldMsg, newMsg) => {
    if (oldMsg.author?.bot === true) return
    if (newMsg.author?.bot === true) return

    logger.logSync('INFO', 'messageUpdate')

    const logChannel = await newMsg.guild?.channels.fetch(process.env.MESSAGE_LOGS ?? '')

    if (logChannel == null) {
      logger.logSync('WARN', 'MessageLogger could not find log channel')
      return
    }

    if (logChannel.type !== ChannelType.GuildText) {
      logger.logSync('WARN', 'LogChannel is not TextBased')
      return
    }

    await logChannel.send({
      content: `Message edited in <#${oldMsg.channelId}>`,
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `${oldMsg.author?.username as string}#${oldMsg.author?.discriminator as string} - #${oldMsg.author?.id as string}`
          })
          .setDescription(oldMsg.content ? (oldMsg.content?.length > 0 ? oldMsg.content : '<kein Inhalt>') : '<kein Inhalt>')
          .setColor(Colors.Yellow)
          .setTimestamp(oldMsg.createdTimestamp),
        new EmbedBuilder()
          .setAuthor({
            name: `${newMsg.author?.username as string}#${newMsg.author?.discriminator as string}`
          })
          .setDescription(oldMsg.content ? (oldMsg.content?.length > 0 ? oldMsg.content : '<kein Inhalt>') : '<kein Inhalt>')
          .setColor(Colors.Green)
          .setTimestamp(newMsg.editedTimestamp)
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>()
          .addComponents(new ButtonBuilder()
            .setURL(newMsg.url)
            .setLabel('Nachricht im Chat zeigen')
            .setStyle(ButtonStyle.Link))
      ]
    })
  })

  client.on('messageDelete', async (msg) => {
    const logChannel = await msg.guild?.channels.fetch(process.env.MESSAGE_LOGS ?? '')

    if (logChannel == null) {
      logger.logSync('WARN', 'MessageLogger could not find log channel')
      return
    }

    if (logChannel.type !== ChannelType.GuildText) {
      logger.logSync('WARN', 'LogChannel is not TextBased')
      return
    }
    let embed: EmbedBuilder
    if (msg.attachments && msg.attachments.size > 0) {
      embed = new EmbedBuilder()
        .setAuthor({
          name: `${msg.author?.username as string}#${msg.author?.discriminator as string} - #${msg.author?.id as string}`
        })
        .setColor(Colors.Red)
        .setDescription(msg.content ? (msg.content?.length > 0 ? msg.content : '<kein Inhalt>') : '<kein Inhalt>')
        .setColor(Colors.Red)
        .setTimestamp(msg.createdTimestamp)
      msg.attachments.forEach(attechment => {
        embed.addFields(
          { name: `${attechment.name ?? 'kein Name'} | ${attechment.contentType ?? 'unknown Type'}`, value: attechment.url ?? 'Fehler' })
      })
    } else {
      embed = new EmbedBuilder()
        .setAuthor({
          name: `${msg.author?.username as string}#${msg.author?.discriminator as string} - #${msg.author?.id as string}`
        })
        .setDescription(msg.content ? (msg.content?.length > 0 ? msg.content : '<kein Inhalt>') : '<kein Inhalt>')
        .setColor(Colors.Red)
        .setTimestamp(msg.createdTimestamp)
    }

    await logChannel.send({
      content: `Message deleted in <#${msg.channelId}>`,
      embeds: [
        embed
      ]
    })
  })
}
