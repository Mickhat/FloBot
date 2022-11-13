import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, Client, ClientVoiceManager, Colors, EmbedBuilder } from 'discord.js'
import { Logger } from '../logger/logger'

export default async (client: Client, logger: Logger) => {

    logger.logSync("INFO", "Initializing message logger")

    client.on('messageUpdate', async (oldMsg, newMsg) => {

        logger.logSync("INFO", "messageUpdate")

        let logChannel = await newMsg.guild?.channels.fetch(process.env.MESSAGE_LOGS ?? "")

        if (!logChannel) {
            logger.logSync("WARN", "MessageLogger could not find log channel")
            return;
        }

        if (logChannel.type != ChannelType.GuildText) {
            logger.logSync("WARN", "LogChannel is not TextBased")
            return;
        }

        logChannel.send({
            content: `Message edited in <#${oldMsg.channelId}>`,
            embeds: [
                new EmbedBuilder()
                    .setAuthor({
                        name: `${oldMsg.author?.username}#${oldMsg.author?.discriminator} - #${oldMsg.author?.id}`,
                    })
                    .setDescription(oldMsg.content || '<kein Inhalt>')
                    .setColor(Colors.Yellow)
                    .setTimestamp(oldMsg.createdTimestamp),
                new EmbedBuilder()
                    .setAuthor({
                        name: `${newMsg.author?.username}#${newMsg.author?.discriminator}`,
                    })
                    .setDescription(newMsg.content || '<kein Inhalt>')
                    .setColor(Colors.Green)
                    .setTimestamp(newMsg.editedTimestamp),
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
        let logChannel = await msg.guild?.channels.fetch(process.env.MESSAGE_LOGS ?? "")

        if (!logChannel) {
            logger.logSync("WARN", "MessageLogger could not find log channel")
            return;
        }

        if (logChannel.type != ChannelType.GuildText) {
            logger.logSync("WARN", "LogChannel is not TextBased")
            return;
        }
        logChannel.send({
            content: `Message deleted in <#${msg.channelId}>`,
            embeds: [
                new EmbedBuilder()
                    .setAuthor({
                        name: `${msg.author?.username}#${msg.author?.discriminator} - #${msg.author?.id}`,
                    })
                    .setDescription(msg.content || '<kein Inhalt>')
                    .setColor(Colors.Red)
                    .setTimestamp(msg.createdTimestamp),
            ],
        })
    })
}