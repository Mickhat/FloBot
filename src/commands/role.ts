import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  CommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder
} from 'discord.js'
import { AsyncDatabase } from '../sqlite/sqlite'

export default {
  data: new SlashCommandBuilder()
    .setName('toggle-role')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setDescription('Creates a button that allows anyone with access to the channel to give themselves the role.')
    .addRoleOption((option) => option.setName('role').setDescription('The role to give to the user.').setRequired(true))
    .addStringOption((option) =>
      option.setName('message').setDescription('The message to display in the embed.').setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName('button-label')
        .setDescription("The label of the button. Defaults to 'Rolle geben/entfernen'.")
        .setRequired(false)
        .setMaxLength(50)
    ),
  async execute(interaction: CommandInteraction) {
    const role = interaction.options.get('role', true).role
    if (!role) {
      await interaction.reply({
        content: 'The role you provided was invalid.',
        ephemeral: true
      })
      return
    }

    const message = interaction.options.get('message', false)?.value?.toString()
    const buttonLabel = interaction.options.get('button-label', false)?.value?.toString()

    const channel = interaction.channel
    if (
      !channel ||
      (channel.type !== ChannelType.GuildText &&
        channel.type !== ChannelType.GuildAnnouncement &&
        channel.type !== ChannelType.PublicThread &&
        channel.type !== ChannelType.PrivateThread)
    ) {
      await interaction.reply({
        content: 'An error occurred while trying to get the channel.',
        ephemeral: true
      })
      return
    }

    const messageSend = await channel.send({
      embeds: [
        new EmbedBuilder()
          .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() ?? undefined })
          .setDescription(message ?? `Nutze den Button um dir die Rolle ${role.name} zu geben oder zu entfernen.`)
          .setColor(role.color)
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents([
          new ButtonBuilder()
            .setCustomId('toggle-role')
            .setLabel(buttonLabel ?? 'Rolle geben/entfernen')
            .setDisabled(true) // will be enabled after the message is sent and the button is registered in db to prevent errors
            .setStyle(ButtonStyle.Primary)
        ])
      ]
    })

    try {
      const messageSendId = messageSend.id
      const db = await AsyncDatabase.open()
      if (!db) {
        await messageSend.delete()
        await interaction.reply({
          content: 'An error occurred. Please try again later.',
          ephemeral: true
        })
        return
      }
      await db.runAsync('INSERT INTO role_buttons (message_id, role_id) VALUES (?, ?)', [messageSendId, role.id])

      // now edit the message to enable the button

      await messageSend.edit({
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents([
            new ButtonBuilder()
              .setCustomId('toggle-role')
              .setLabel(buttonLabel ?? 'Rolle geben/entfernen')
              .setStyle(ButtonStyle.Primary)
              .setDisabled(true)
          ])
        ],
        embeds: [
          new EmbedBuilder()
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() ?? undefined })
            .setDescription(message ?? `Nutze den Button um dir die Rolle ${role.name} zu geben oder zu entfernen.`)
            .setColor(role.color)
        ]
      })
    } catch {
      await messageSend.delete()
      await interaction.reply({
        content: 'An error occurred. Please try again later.',
        ephemeral: true
      })
    }
  }
}
