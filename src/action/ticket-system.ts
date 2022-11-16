import { ActionRowBuilder, ButtonBuilder, ButtonStyle,
         ChannelType, Client, Guild, PermissionFlagsBits, TextChannel } from 'discord.js'
import { readFileSync } from 'fs'
import { Logger } from 'src/logger/logger'


export async function createTicket(client: Client, guild: Guild, memberId: string, logger: Logger, name: string | undefined = undefined) {


    if (name == undefined) name = name_gen()

    let supporter_role = await guild.roles.fetch(process.env.TICKET_SUPPORTER ?? "")

    if (!supporter_role) {
        logger.logSync("ERROR", "Supporter-Rolle fehlt")
        return "Ticket konnte nicht erstellt werden."
    }

    let channel = await guild.channels.create({
        type: ChannelType.GuildText,
        name: `ticket-${name}`,
        permissionOverwrites: [
            {
                id: guild.roles.everyone.id,
                deny: [
                    // Channel unsichtbar
                    PermissionFlagsBits.ViewChannel,
                    // Keine Nachrichten versenden
                    PermissionFlagsBits.SendMessages,
                    // Keine Nachrichten lesen
                    PermissionFlagsBits.ReadMessageHistory
                ]
            },
            {
                id: memberId,
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.ReadMessageHistory,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.AttachFiles,
                    PermissionFlagsBits.EmbedLinks
                ],
                deny: [
                    PermissionFlagsBits.CreateInstantInvite,
                    PermissionFlagsBits.CreatePrivateThreads,
                    PermissionFlagsBits.CreatePublicThreads
                ]
            },
            {
                id: supporter_role.id,
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.ReadMessageHistory,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.AddReactions,
                    PermissionFlagsBits.AttachFiles,
                    PermissionFlagsBits.EmbedLinks,
                    PermissionFlagsBits.ManageChannels
                ]
            }
        ]
    })

    channel.send({
        content: `Neues Ticket erstellt
${supporter_role.toString()} <@${memberId}>`
    })

    return channel;

}

export async function ticketAdd(memberId: string, channel: TextChannel) {

    channel.permissionOverwrites.create(memberId, {
        ViewChannel: true,
        ReadMessageHistory: true,
        AttachFiles: true,
        EmbedLinks: true,
        SendMessages: true,
        CreatePublicThreads: false,
        CreatePrivateThreads: false,
        CreateInstantInvite: false,
    })

    channel.send(`<@${memberId}> wurde hinzugefügt.`)

}

export async function ticketClose(channel: TextChannel) {

    channel.edit({ name: 'closed-' + channel.name.split('-')[1], })
    channel.permissionOverwrites.cache.forEach((perms) => {
        perms.edit({
            SendMessages: false
        })
    })

    channel.send({
        content: 'Ticket geschlossen.\nDas Ticket kann frühstens nach einem Tag gelöscht werden.',
        components: [
            new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('ticket-delete')
                        .setLabel('Löschen')
                        .setEmoji('🗑️')
                        .setStyle(ButtonStyle.Danger),
                )
        ]
    })

}

function name_gen() {

    let number1 = Math.floor(Math.random() * 10)
    let number2 = Math.floor(Math.random() * 10)
    let number3 = Math.floor(Math.random() * 10)
    let number4 = Math.floor(Math.random() * 10)

    return `${number1}${number2}${number3}${number4}`
}