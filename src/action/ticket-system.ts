import { ChannelType, Client, Guild, GuildMember, Message, PermissionFlagsBits } from 'discord.js'
import { readFileSync } from 'fs'
import { Logger } from 'src/logger/logger'


export async function createTicket(client:Client, guild:Guild, memberId: string, logger: Logger, name:string | undefined = undefined) {
    

    if (name == undefined) name = name_gen()

    let supporter_role = await guild.roles.fetch(process.env.TICKET_SUPPORTER ?? "")

    if (!supporter_role) {
        logger.logSync("ERROR", "Supporter-Rolle fehlt")
        return "Ticket konnte nicht erstellt werden."
    }

    let channel = await guild.channels.create({
        type: ChannelType.GuildText,
        name: `${name}--ticket`,
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
            }
        ]
    })

    channel.send({
        content: `Neues Ticket erstellt
${supporter_role.toString()} <@${memberId}>`
    })

    return channel;

}

function name_gen() {

    let animals: string[] = readFileSync('./utils/animals.txt', {
        encoding: 'utf-8'
    }).split('\n')

    let animal1 = animals[Math.floor(Math.random() * animals.length)]
    let animal2;
    do {
        animal2 = animals[Math.floor(Math.random() * animals.length)]
    } while (animal1 === animal2)
    let animal3;
    do {
        animal3 = animals[Math.floor(Math.random() * animals.length)]
    } while (animal1 === animal3 || animal2 == animal3)

    return `${animal1}-${animal2}-${animal3}`

}