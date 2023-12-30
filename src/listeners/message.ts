import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  Client,
  Colors,
  EmbedBuilder
} from "discord.js";
import { ILogger } from "../logger/logger";

// Function to react randomly to messages containing :kekw: emoji
async function kekwReact(msg) {
  const kekwEmojiId = '1185517935905734796'; // The ID of the :kekw: emoji
  const kekwEmoji = msg.guild?.emojis.cache.get(kekwEmojiId);
  const reactionProbability = 0.5; // 50% chance to react

  if (kekwEmoji && msg.content.includes(`<:${kekwEmoji.name}:${kekwEmoji.id}>`)) {
    if (Math.random() < reactionProbability) {
      await msg.react(kekwEmoji);
    }
  }
}

// Function to check if the message is a greeting
function isGreeting(msg) {
  const greetings = ["hallo", "hi", "hey", "moin", "moin moin", "servus", "guten morgen", "guten tag", "guten abend", "wuhu", "nabend"];
  const msgLower = msg.toLowerCase();
  for (const greeting of greetings) {
    if (msgLower.includes(greeting)) {
      if (msgLower.startsWith(greeting) && msgLower.endsWith(greeting)) {
        return true;
      }
      if (msgLower.startsWith(greeting) && [" ", "!", "?", ".", ","].includes(msgLower.charAt(greeting.length))) {
        return true;
      }
      if (msgLower.endsWith(greeting) && [" ", "!", "?", ".", ","].includes(msgLower.charAt(msgLower.length - greeting.length - 1))) {
        return true;
      }
      if ([" ", "!", "?", ".", ","].includes(msgLower.charAt(msgLower.indexOf(greeting) - 1)) && [" ", "!", "?", ".", ","].includes(msgLower.charAt(msgLower.indexOf(greeting) + greeting.length))) {
        return true;
      }
    }
  }
  return false;
}

export default async (client, logger) => {
  logger.logSync("INFO", "Initializing message logger");

  client.on("messageCreate", async (msg) => {
    if (msg.author?.bot) return;

    // Call kekwReact function
    await kekwReact(msg);

    // Handling greetings
    if (isGreeting(msg.content)) {
      if (msg.mentions.users.has(client.user?.id) && !msg.mentions.everyone && msg.channelId === "1185324347934658593") {
        await msg.reply({
          content: `👋 Hallo <@${msg.author.id}>!`
        });
      } else {
        await msg.react("👋");
      }
    }
  });

  client.on("messageUpdate", async (oldMsg, newMsg) => {
    if (oldMsg.author?.bot || newMsg.author?.bot) return;
    logger.logSync("INFO", "Message updated");

    const logChannel = await newMsg.guild?.channels.fetch(process.env.MESSAGE_LOGS ?? "");
    if (!logChannel || logChannel.type !== ChannelType.GuildText) {
      logger.logSync("WARN", "MessageLogger could not find log channel or channel is not text-based");
      return;
    }

    await logChannel.send({
      content: `Message edited in <#${oldMsg.channelId}>`,
      files: oldMsg.attachments.map(attachment => attachment.url),
      embeds: [
        new EmbedBuilder()
          .setAuthor({ name: `${oldMsg.author?.username}#${oldMsg.author?.discriminator} - #${oldMsg.author?.id}` })
          .setDescription(oldMsg.content ?? "<kein Inhalt>")
          .setColor(Colors.Yellow)
          .setTimestamp(oldMsg.createdTimestamp),
        new EmbedBuilder()
          .setAuthor({ name: `${newMsg.author?.username}#${newMsg.author?.discriminator}` })
          .setDescription(newMsg.content ?? "<kein Inhalt>")
          .setColor(Colors.Green)
          .setTimestamp(newMsg.editedTimestamp)
      ],
      components: [
        new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setURL(newMsg.url)
              .setLabel("Nachricht im Chat zeigen")
              .setStyle(ButtonStyle.Link)
          )
      ]
    });
  });

  client.on("messageDelete", async (msg) => {
    const logChannel = await msg.guild?.channels.fetch(process.env.MESSAGE_LOGS ?? "");
    if (!logChannel || logChannel.type !== ChannelType.GuildText) {
      logger.logSync("WARN", "MessageLogger could not find log channel or channel is not text-based");
      return;
    }

    const embed = new EmbedBuilder()
      .setAuthor({ name: `${msg.author?.username}#${msg.author?.discriminator} - #${msg.author?.id}` })
      .setDescription(msg.content ?? "<kein Inhalt>")
      .setColor(Colors.Red)
      .setTimestamp(msg.createdTimestamp);

    msg.attachments.forEach(attachment => {
      embed.addFields({
        name: `${attachment.name ?? "kein Name"} | ${attachment.contentType ?? "unknown Type"}`,
        value: `${attachment.url ?? "Fehler"}\n${attachment.proxyURL ?? "Fehler"}`
      });
    });

    await logChannel.send({
      content: `Message deleted in <#${msg.channelId}>`,
      embeds: [embed],
      files: msg.attachments.map(attachment => attachment.url)
    });
  });
};
