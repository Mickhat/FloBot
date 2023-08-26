import {
  CommandInteraction, Client, Interaction,
  ButtonInteraction, ApplicationCommandType, UserContextMenuCommandInteraction,
  MessageContextMenuCommandInteraction,
  InteractionType, ChannelType, GuildBasedChannel,
  ActionRowBuilder, ButtonBuilder, ButtonStyle,
  AutocompleteInteraction
} from 'discord.js'
import { LogManager } from '../logger/logger'
import { createRoleInterface } from '../action/roles_buttons_create'
import startUserReport from '../action/userReport'
import messageReport from '../action/messageReport'
import { createTicket, ticketAdd, ticketClose } from '../action/ticket-system'
import { AsyncDatabase } from '../sqlite/sqlite'
import { handleBlackJackCommands } from '../action/blackjack/handleCommands'
// import { autocomplete } from "../action/youtube";

export default (client: Client, logger: LogManager, db: AsyncDatabase): void => {
  client.on('interactionCreate', async (interaction: Interaction) => {
    if (interaction.isCommand()) {
      await handleSlashCommand(client, interaction, logger, db)
    }
    if (interaction.isButton()) {
      await handleButtonInteraction(client, interaction, db, logger) // Beste Grüße von heeecker und Christian.exe: Das bleibt da um zu triggern
    }
    if (interaction.isContextMenuCommand() && interaction.commandType === ApplicationCommandType.User) {
      await handleUserContextMenuCommand(client, interaction, logger, db)
    }
    if (interaction.isContextMenuCommand() && interaction.commandType === ApplicationCommandType.Message) {
      await handleMessageContextMenuCommand(client, interaction, logger, db)
    }
    if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
      await handleAutoComplete(client, interaction, logger, db)
    }
  })
}

const handleSlashCommand = async (client: Client, interaction: CommandInteraction, logger: LogManager, db: AsyncDatabase): Promise<void> => {
  let channel: GuildBasedChannel | null
  // handle slash command here
  switch (interaction.commandName) {
    case 'role':
      await createRoleInterface(interaction, 'once', logger.logger('Toogle-Roles'))
      return
    case 'role-force-button':
      await createRoleInterface(interaction, 'global', logger.logger('Toggle-Roles'))
      return
    case 'ticket-create':
      if ((interaction.guild == null) || (interaction.member == null) || !interaction.member.user.id) {
        await interaction.reply({ content: 'Ticket konnte nicht erstellt werden', ephemeral: true })
        return
      }
      console.log(interaction.member.user.id)
      // eslint-disable-next-line no-case-declarations
      const result = await createTicket(client, interaction.guild, interaction.member.user.id, logger.logger('ticket-system'))
      if (typeof result === 'string') {
        await interaction.reply({ content: 'Ticket konnte nicht erstellt werden.', ephemeral: true })
        return
      }
      await interaction.reply({ content: `Ticket erstellt. <#${result.id}>`, ephemeral: true })
      return
    case 'ticket-add':
      if ((interaction.guild == null) || (interaction.member == null) || !interaction.member.user.id) {
        await interaction.reply({ content: 'Ticket konnte nicht erstellt werden', ephemeral: true })
        return
      }
      channel = await interaction.guild.channels.fetch(interaction.channelId)
      if ((channel == null) || !/ticket-[0-9]{4}/.test(channel?.name ?? '')) {
        await interaction.reply({
          content: 'Du kannst den Befehl nur in Tickets nutzen',
          ephemeral: true
        })
        return
      }

      if (channel.type !== ChannelType.GuildText) return
      await ticketAdd(interaction.options?.get('target')?.value?.toString() ?? interaction.member.user.id, channel)
      await interaction.reply({
        content: 'Fertig!',
        ephemeral: true
      })
      return
    case 'ticket-close':
      if ((interaction.guild == null) || (interaction.member == null) || !interaction.member.user.id) {
        await interaction.reply({ content: 'Ticket konnte nicht erstellt werden', ephemeral: true })
        return
      }
      channel = await interaction.guild.channels.fetch(interaction.channelId)
      if ((channel == null) || !/ticket-[0-9]{4}/.test(channel?.name ?? '')) {
        await interaction.reply({
          content: 'Du kannst den Befehl nur in Tickets nutzen',
          ephemeral: true
        })
        return
      }

      if (channel.type !== ChannelType.GuildText) return
      await ticketClose(channel)
      await interaction.reply({
        content: 'Fertig!',
        ephemeral: true
      })
      break
    case 'bj':
      await handleBlackJackCommands(interaction, logger)
      break
  }
}

const handleButtonInteraction = async (client: Client, interaction: ButtonInteraction, db: AsyncDatabase, logger: LogManager): Promise<void> => {
  if (interaction.customId === 'ticket-delete') {
    await interaction.reply({
      content: 'Lösche Ticket',
      ephemeral: true,
      components: [
        new ActionRowBuilder<ButtonBuilder>()
          .addComponents(
            new ButtonBuilder()
              .setLabel('Bestätigen')
              .setStyle(ButtonStyle.Danger)
              .setCustomId('ticket-delete-confirm')
          )
      ]
    })
  }
  if (interaction.customId === 'ticket-delete-confirm') {
    await interaction.message.channel.delete()
  }
  if (interaction.customId === 'delete') {
    await interaction.message.delete()
  }
}

const handleUserContextMenuCommand = async (client: Client, interaction: UserContextMenuCommandInteraction, logger: LogManager, db: AsyncDatabase): Promise<void> => {
  if (interaction.commandType === ApplicationCommandType.User && interaction.commandName === 'REPORT') {
    await startUserReport(interaction, client, db, logger.logger('Report-System'))
  }
}

const handleMessageContextMenuCommand = async (client: Client, interaction: MessageContextMenuCommandInteraction, logger: LogManager, db: AsyncDatabase): Promise<void> => {
  if (interaction.commandType === ApplicationCommandType.Message && interaction.commandName === 'REPORT') {
    await messageReport(interaction, client, db, logger.logger('Report-System'))
  }
}

const handleAutoComplete = async (client: Client, interaction: AutocompleteInteraction, logger: LogManager, db: AsyncDatabase): Promise<void> => {
  // autocomplete(client, interaction, db, logger.logger('yt-autocomplete'))
}
