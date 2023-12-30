import { ChannelType, CommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import LogManager from '../logger/logger'

function nameGen(): string {
  const number1 = Math.floor(Math.random() * 10)
  const number2 = Math.floor(Math.random() * 10)
  const number3 = Math.floor(Math.random() * 10)
  const number4 = Math.floor(Math.random() * 10)

  return `${number1}${number2}${number3}${number4}`
}

export default {
  data: new SlashCommandBuilder()
    .setName('ticket-create')
    .setDescription('Erstellt einen Channel, wo du mit dem Support-Team kommunizieren kannst'),
  async execute(interaction: CommandInteraction) {
    const logger = LogManager.getInstance().logger('TicketCreateCommand')
    const name = nameGen()

    if (!interaction.guild) {
      await interaction.reply({ content: 'Ticket konnte nicht erstellt werden', ephemeral: true })
      return
    }
    if (!process.env.TICKET_SUPPORTER) {
      await interaction.reply({ content: 'Ticket konnte nicht erstellt werden', ephemeral: true })
      return
    }

    const supporterRole = await interaction.guild.roles.fetch(process.env.TICKET_SUPPORTER)

    if (supporterRole == null) {
      logger.logSync('ERROR', 'Supporter-Rolle fehlt')
      return 'Ticket konnte nicht erstellt werden.'
    }

    const channel = await interaction.guild.channels.create({
      type: ChannelType.GuildText,
      name: `ticket-${name}`,
      permissionOverwrites: [
        {
          id: interaction.guild?.roles.everyone.id,
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
          id: interaction.user.id,
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
      content: `Neues Ticket erstellt von ${interaction.user.username}
${supporterRole.toString()} <@${interaction.user.id}>`
    })
  }
}
