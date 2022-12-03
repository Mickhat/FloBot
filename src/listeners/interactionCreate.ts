import {
  CommandInteraction, Client, Interaction,
  ButtonInteraction, ApplicationCommandType, UserContextMenuCommandInteraction,
  ModalSubmitInteraction, SelectMenuInteraction, MessageContextMenuCommandInteraction,
  InteractionType, ChannelType, GuildBasedChannel,
  ActionRowBuilder, ButtonBuilder, ButtonStyle,
  AutocompleteInteraction
} from 'discord.js'
import { LogManager } from '../logger/logger'
import { codeblocks, metafrage, about, ping } from '../action/infoMessages'
import { createRoleInterface } from '../action/roles_buttons_create'
import { toggleRoles } from '../action/toggleRole'
import startUserReport from '../action/userReport'

import continueReport from '../action/continueReport'
import finishReport from '../action/finishReport'
import messageReport from '../action/messageReport'
import voting from '../action/voting'
import { fourthPage, helpIntroduction, mainHelpPage, secondPage, thirdPage } from '../action/help'
import { createTicket, ticketAdd, ticketClose } from '../action/ticket-system'
import { meme } from '../action/meme'
import kick from '../action/kick'
import ban from '../action/ban'
import unban from '../action/unban'
import timeout from '../action/timeout'
// import warn from '../action/warn'
import { AsyncDatabase } from 'src/sqlite/sqlite'
// import { autocomplete } from "../action/youtube";

export default (client: Client, logger: LogManager, db: AsyncDatabase): void => {
  client.on('interactionCreate', async (interaction: Interaction) => {
    if (interaction.isCommand()) {
      await handleSlashCommand(client, interaction, logger, db)
    }
    if (interaction.isButton()) {
      await handleButtonInteraction(client, interaction, logger)
    }
    if (interaction.isContextMenuCommand() && interaction.commandType === ApplicationCommandType.User) {
      await handleUserContextMenuCommand(client, interaction, logger, db)
    }
    if (interaction.isContextMenuCommand() && interaction.commandType === ApplicationCommandType.Message) {
      await handleMessageContextMenuCommand(client, interaction, logger, db)
    }
    if (interaction.isStringSelectMenu()) {
      await handleSelectMenu(client, interaction, logger, db)
    }
    if (interaction.isModalSubmit()) {
      await handleModalSubmit(client, interaction, logger, db)
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
    case 'metafrage':
      await metafrage(client, interaction, logger.logger('Metafrage'))
      return
    case 'codeblocks':
      await codeblocks(client, interaction, logger.logger('Codeblocks'))
      return
    case 'role':
      await createRoleInterface(interaction, 'once', logger.logger('Toogle-Roles'))
      return
    case 'role-force-button':
      await createRoleInterface(interaction, 'global', logger.logger('Toggle-Roles'))
      return
    case 'about':
      await about(client, interaction, logger.logger('About'))
      return
    case 'voting':
      await voting(client, interaction)
      return
    case 'help':
      await helpIntroduction(interaction)
      return
    case 'ping':
      await ping(client, interaction, logger.logger('Ping'))
      return
    case 'meme':
      await meme(client, interaction, logger.logger('meme'))
      return
    // case 'warn':
    //   await warn(client, interaction, logger.logger('warn-system'), db, 0, "WARN")
    //   return
    // case 'strike':
    //   await warn(client, interaction, logger.logger('warn-system'), db, 1, "STRIKE")
    //   return
    case 'kick':
      await kick(client, interaction, logger.logger('kick'), db)
      return
    case 'ban':
      await ban(client, interaction, logger.logger('ban'), db)
      return
    case 'unban':
      await unban(client, interaction, logger.logger('unban'))
      return
    case 'timeout':
      await timeout(client, interaction, logger.logger('timeout'), db)
      return
    case 'ticket-create':
      if ((interaction.guild == null) || (interaction.member == null) || interaction.member.user.id != null) {
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
      if ((interaction.guild == null) || (interaction.member == null) || interaction.member.user.id != null) {
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
      if ((interaction.guild == null) || (interaction.member == null) || interaction.member.user.id != null) {
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
  }
}

const handleButtonInteraction = async (client: Client, interaction: ButtonInteraction, logger: LogManager): Promise<void> => {
  if (/(addRole-|removeRole-)([0-9]+)/.test(interaction.customId)) {
    await toggleRoles(client, interaction, logger.logger('Toggle-Roles'))
  }
  if (interaction.customId === 'help-page1') {
    await mainHelpPage(interaction)
  }
  if (interaction.customId === 'help-page2') {
    await secondPage(interaction)
  }
  if (interaction.customId === 'help-page3') {
    await thirdPage(interaction)
  }
  if (interaction.customId === 'help-page4') {
    await fourthPage(interaction)
  }
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

const handleSelectMenu = async (client: Client, interaction: SelectMenuInteraction, logger: LogManager, db: AsyncDatabase): Promise<void> => {
  if (/report_.+_category/.test(interaction.customId)) {
    await continueReport(interaction, client, db, logger.logger('Report'))
  }
}

const handleModalSubmit = async (client: Client, interaction: ModalSubmitInteraction, logger: LogManager, db: AsyncDatabase): Promise<void> => {
  if (/report_.+_finish/.test(interaction.customId)) {
    await finishReport(interaction, client, db, logger.logger('Report'))
  }
}

const handleAutoComplete = async (client: Client, interaction: AutocompleteInteraction, logger: LogManager, db: AsyncDatabase): Promise<void> => {
  // autocomplete(client, interaction, db, logger.logger('yt-autocomplete'))
}
