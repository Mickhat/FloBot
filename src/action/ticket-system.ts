import {
  ActionRowBuilder, ButtonBuilder, ButtonStyle,
  ChannelType, Client, Guild, PermissionFlagsBits, TextChannel
} from 'discord.js'
import { Logger } from 'src/logger/logger'

export async function createTicket (client: Client, guild: Guild, memberId: string, logger: Logger, name: string | undefined = undefined): Promise<TextChannel | string> {
  if (name === undefined) name = nameGen()

  const supporterRole = await guild.roles.fetch(process.env.TICKET_SUPPORTER ?? '')

  if (supporterRole == null) {
    logger.logSync('ERROR', 'Supporter-Rolle fehlt')
    return 'Ticket konnte nicht erstellt werden.'
  }

  const channel = await guild.channels.create({
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
        id: supporterRole.id,
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

  await channel.send({
    content: `Neues Ticket erstellt
${supporterRole.toString()} <@${memberId}>`
  })

  return channel
}

export async function ticketAdd (memberId: string, channel: TextChannel): Promise<void> {
  await channel.permissionOverwrites.create(memberId, {
    ViewChannel: true,
    ReadMessageHistory: true,
    AttachFiles: true,
    EmbedLinks: true,
    SendMessages: true,
    CreatePublicThreads: false,
    CreatePrivateThreads: false,
    CreateInstantInvite: false
  })

  await channel.send(`<@${memberId}> wurde hinzugefügt.`)
}

export async function ticketClose (channel: TextChannel): Promise<void> {
  await channel.edit({ name: 'closed-' + channel.name.split('-')[1] })
  channel.permissionOverwrites.cache.forEach((perms) => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    perms.edit({
      SendMessages: false
    })
  })

  await channel.send({
    content: 'Ticket geschlossen.\nDas Ticket kann frühstens nach einem Tag gelöscht werden.',
    components: [
      new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('ticket-delete')
            .setLabel('Löschen')
            .setEmoji('🗑️')
            .setStyle(ButtonStyle.Danger)
        )
    ]
  })
}

function nameGen (): string {
  const number1 = Math.floor(Math.random() * 10)
  const number2 = Math.floor(Math.random() * 10)
  const number3 = Math.floor(Math.random() * 10)
  const number4 = Math.floor(Math.random() * 10)

  return `${number1}${number2}${number3}${number4}`
}
