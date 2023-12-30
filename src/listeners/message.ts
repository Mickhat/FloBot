import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  Client,
  Colors,
  EmbedBuilder
} from "discord.js"
import { ILogger } from "../logger/logger"

function isGreeting (msg: string): boolean {
  const greetings = ["hallo", "hi", "hey", "moin", "moin moin", "servus", "guten morgen", "guten tag", "guten abend", "wuhu", "nabend"]
  const msgLower = msg.toLowerCase()
  for (const greeting of greetings) {
    // check if the msg includes the greeting
    if (msgLower.includes(greeting)) {
      if (msgLower.startsWith(greeting) && msgLower.endsWith(greeting)) {
        return true
      }
      // check if the greeting is at the beginning of the msg and the next char is a space, ! or ? or . or ,
      if (msgLower.startsWith(greeting) && [" ", "!", "?", ".", ","].includes(msgLower.charAt(greeting.length))) {
        return true
      }
      // check if the greeting is at the end of the msg and the previous char is a space, ! or ? or . or ,
      if (msgLower.endsWith(greeting) && [" ", "!", "?", ".", ","].includes(msgLower.charAt(msgLower.length - greeting.length - 1))) {
        return true
      }
      // previous and next char is a space, ! or ? or . or ,
      if ([" ", "!", "?", ".", ","].includes(msgLower.charAt(msgLower.indexOf(greeting) - 1)) && [" ", "!", "?", ".", ","].includes(msgLower.charAt(msgLower.indexOf(greeting) + greeting.length))) {
        return true
      }
    }
  }
  return false
}

export default async (client: Client, logger: ILogger): Promise<void> => {
  logger.logSync("INFO", "Initializing message logger")

  client.on("messageCreate", async (msg) => {
    if (msg.author?.bot) return
    if (isGreeting(msg.content)) {
      /*
      Checks if the message mentions the bot and prevents the bot from replying to everyone pings or announcements
      */
      if (msg.mentions.users.has(client.user?.id as string) && !msg.mentions.everyone && msg.channelId === "1185324347934658593") {
        await msg.reply({
          content: `👋 Hallo <@${msg.author.id}>!`
        })
      } else {
        // add a waving hand reaction to the message
        await msg.react("👋")
      }
    }
  })

  client.on("messageUpdate", async (oldMsg, newMsg) => {
    if (oldMsg.author?.bot === true) return
    if (newMsg.author?.bot === true) return

    logger.logSync("INFO", "messageUpdate")

    const logChannel = await newMsg.guild?.channels.fetch(
      process.env.MESSAGE_LOGS ?? ""
    )

    if (logChannel == null) {
      logger.logSync("WARN", "MessageLogger could not find log channel")
      return
    }

    if (logChannel.type !== ChannelType.GuildText) {
      logger.logSync("WARN", "LogChannel is not TextBased")
      return
    }

    await logChannel.send({
      content: `Message edited in <#${oldMsg.channelId}>`,
      files: oldMsg.attachments.map((attachment) => attachment.url),
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `${oldMsg.author?.username as string}#${
              oldMsg.author?.discriminator as string
            } - #${oldMsg.author?.id as string}`
          })
          .setDescription(
            oldMsg.content
              ? oldMsg.content?.length > 0
                ? oldMsg.content
                : "<kein Inhalt>"
              : "<kein Inhalt>"
          )
          .setColor(Colors.Yellow)
          .setTimestamp(oldMsg.createdTimestamp),
        new EmbedBuilder()
          .setAuthor({
            name: `${newMsg.author?.username as string}#${
              newMsg.author?.discriminator as string
            }`
          })
          .setDescription(
            newMsg.content
              ? newMsg.content?.length > 0
                ? newMsg.content
                : "<kein Inhalt>"
              : "<kein Inhalt>"
          )
          .setColor(Colors.Green)
          .setTimestamp(newMsg.editedTimestamp)
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setURL(newMsg.url)
            .setLabel("Nachricht im Chat zeigen")
            .setStyle(ButtonStyle.Link)
        )
      ]
    })
  })

  client.on("messageDelete", async (msg) => {
    const logChannel = await msg.guild?.channels.fetch(
      process.env.MESSAGE_LOGS ?? ""
    )

    if (logChannel == null) {
      logger.logSync("WARN", "MessageLogger could not find log channel")
      return
    }

    if (logChannel.type !== ChannelType.GuildText) {
      logger.logSync("WARN", "LogChannel is not TextBased")
      return
    }
    let embed: EmbedBuilder
    if (msg.attachments && msg.attachments.size > 0) {
      embed = new EmbedBuilder()
        .setAuthor({
          name: `${msg.author?.username as string}#${
            msg.author?.discriminator as string
          } - #${msg.author?.id as string}`
        })
        .setColor(Colors.Red)
        .setDescription(
          msg.content
            ? msg.content?.length > 0
              ? msg.content
              : "<kein Inhalt>"
            : "<kein Inhalt>"
        )
        .setColor(Colors.Red)
        .setTimestamp(msg.createdTimestamp)
      msg.attachments.forEach((attechment) => {
        embed.addFields({
          name: `${attechment.name ?? "kein Name"} | ${
            attechment.contentType ?? "unknown Type"
          }`,
          value:
            (attechment.url ?? "Fehler") +
            "\n" +
            (attechment.proxyURL ?? "Fehler")
        })
      })
    } else {
      embed = new EmbedBuilder()
        .setAuthor({
          name: `${msg.author?.username as string}#${
            msg.author?.discriminator as string
          } - #${msg.author?.id as string}`
        })
        .setDescription(
          msg.content
            ? msg.content?.length > 0
              ? msg.content
              : "<kein Inhalt>"
            : "<kein Inhalt>"
        )
        .setColor(Colors.Red)
        .setTimestamp(msg.createdTimestamp)
    }

    await logChannel.send({
      content: `Message deleted in <#${msg.channelId}>`,
      embeds: [embed],
      files: msg.attachments.map((attachment) => attachment.url)
    })
  })
}
