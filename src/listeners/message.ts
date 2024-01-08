import {
  ActionRowBuilder,
  Attachment,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  Client,
  Collection,
  Colors,
  EmbedBuilder
} from 'discord.js'
import { ILogger } from '../logger/logger'
import { containsKeywordFromArray, mentionsBot, greetings, sleepings } from './autoReactHelperFunctions'
import { AsyncDatabase } from 'src/sqlite/sqlite'

function buildAttachmentList(attachments: Collection<string, Attachment>): string {
  let i = 0
  const attachmentList = attachments
    .map((attachment) => {
      i++
      return `${i}. ${attachment.contentType} - [${attachment.name.substring(0, 30)}](${attachment.url})`
    })
    .join('\n')
  return attachmentList
}

export default async (client: Client, logger: ILogger): Promise<void> => {
  logger.logSync('INFO', 'Initializing message logger')

  client.on('messageCreate', async (msg) => {
    if (msg.author?.bot) return
    if (containsKeywordFromArray(msg.content, greetings)) {
      if (mentionsBot(client, msg)) {
        await msg.reply({
          content: `👋 ${greetings[Math.floor(Math.random() * greetings.length)]} <@${msg.author.id}>!`
        })
      } else {
        await msg.react('👋')
      }
    } else if (containsKeywordFromArray(msg.content, sleepings)) {
      if (mentionsBot(client, msg)) {
        await msg.reply({
          content: `😴 Schlaf gut <@${msg.author.id}>!`
        })
      } else {
        await msg.react('💤')
      }
    }

    if (msg.content.toLowerCase().includes(':kekw:')) {
      if (Math.random() > 0.5) {
        const reactionEmoji = msg.guild?.emojis.cache.find((emoji) => emoji.name === 'kekw')
        if (reactionEmoji == null) return
        await msg.react(reactionEmoji)
      }
    }
  })

  client.on('messageUpdate', async (oldMsg, newMsg) => {
    if (oldMsg.author?.bot === true || newMsg.author?.bot === true) return

    logger.logSync('INFO', 'messageUpdate')

    if (oldMsg.author?.id === client.user?.id !== undefined) return

    const logChannel = await newMsg.guild?.channels.fetch(process.env.MESSAGE_LOGS ?? '')

    if (logChannel == null || logChannel.type !== ChannelType.GuildText) {
      logger.logSync('WARN', 'MessageLogger could not find log channel or LogChannel is not TextBased')
      return
    }

    const oldMsgEmbed = new EmbedBuilder()
      .setAuthor({
        name: `${oldMsg.author?.username as string} - ${oldMsg.author?.id as string}`,
        iconURL: `${oldMsg.author?.avatarURL()}`
      })
      .setDescription(oldMsg.content ? oldMsg.content : '<kein Inhalt>')
      .setColor(Colors.Yellow)
      .setTimestamp(oldMsg.createdTimestamp)

    const newMsgEmbed = new EmbedBuilder()
      .setAuthor({
        name: `${newMsg.author?.username as string} - ${newMsg.author?.id as string}`,
        iconURL: `${newMsg.author?.avatarURL()}`
      })
      .setDescription(newMsg.content ? newMsg.content : '<kein Inhalt>')
      .setColor(Colors.Green)
      .setTimestamp(newMsg.editedTimestamp)

    if (oldMsg.attachments.size !== newMsg.attachments.size) {
      oldMsgEmbed.addFields({
        name: 'Attachments',
        value: buildAttachmentList(oldMsg.attachments)
      })
      newMsgEmbed.addFields({
        name: 'Attachments',
        value: newMsg.attachments.size > 0 ? buildAttachmentList(newMsg.attachments) : '<keine Anhänge/Medien>'
      })
    }

    await logChannel.send({
      content: `Message edited in <#${oldMsg.channelId}>`,
      embeds: [oldMsgEmbed, newMsgEmbed],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder().setURL(newMsg.url).setLabel('Nachricht im Chat zeigen').setStyle(ButtonStyle.Link)
        )
      ]
    })
  })

  client.on('messageDelete', async (msg) => {
    const logChannel = await msg.guild?.channels.fetch(process.env.MESSAGE_LOGS ?? '')

    if (msg.author?.id === client.user?.id !== undefined) {
      const db = await AsyncDatabase.open()
      if (!db) {
        logger.logSync('WARN', 'MessageLogger could not open database')
      } else {
        // if the message was created by the bot, its possible that the message was stored in the database
        // delete the entry from the database
        await db.runAsync(`DELETE FROM button_roles WHERE message_id = ?`, [msg.id])
      }
      return
    }

    if (logChannel == null) {
      logger.logSync('WARN', 'MessageLogger could not find log channel')
      return
    }

    if (logChannel == null || logChannel.type !== ChannelType.GuildText) {
      logger.logSync('WARN', 'MessageLogger could not find log channel or LogChannel is not TextBased')
      return
    }

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${msg.author?.username as string} - ${msg.author?.id as string}`,
        iconURL: `${msg.author?.avatarURL()}`
      })
      .setColor(Colors.Red)
      .setDescription(msg.content ? msg.content : '<kein Inhalt>')
      .setTimestamp(msg.createdTimestamp)

    if (msg.attachments && msg.attachments.size > 0) {
      embed.addFields({
        name: 'Attachments',
        value: buildAttachmentList(msg.attachments)
      })
    }

    await logChannel.send({
      content: `Message deleted in <#${msg.channelId}>`,
      embeds: [embed]
    })
  })
}
