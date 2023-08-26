import { ChannelType, CommandInteraction, SlashCommandBuilder } from "discord.js"

export default {
  data: new SlashCommandBuilder().setName('ticket-add')
    .setDescription('Ein Mitglied in den Channel einladen')
    .addUserOption(option => option.setName('target')
      .setDescription('Der Nutzer, der hinzugefügt werden soll')
      .setRequired(true)),

  async execute (interaction: CommandInteraction) {
    const targetId = interaction.options.getUser("target", true).id

    if (!targetId) {
      await interaction.reply({ content: 'Benutzer konnte nicht hinzugefügt werden.', ephemeral: true })
      return
    }

    if (!interaction.channel) {
      await interaction.reply({ content: 'Benutzer konnte nicht hinzugefügt werden', ephemeral: true })
      return
    }

    if (interaction.channel.type !== ChannelType.GuildText) {
      await interaction.reply({ content: 'Benutzer konnte nicht hinzugefügt werden', ephemeral: true })
      return
    }

    if (!/ticket-[0-9]{4}/.test(interaction.channel.name)) {
      await interaction.reply({ content: 'Befehl funktioniert nur in Tickets', ephemeral: true })
      return
    }

    await interaction.channel.permissionOverwrites.create(interaction.user.id, {
      ViewChannel: true,
      ReadMessageHistory: true,
      AttachFiles: true,
      EmbedLinks: true,
      SendMessages: true,
      CreatePublicThreads: false,
      CreatePrivateThreads: false,
      CreateInstantInvite: false
    })

    await interaction.channel.send(`<@${targetId}> wurde von <@${interaction.user.id}> hinzugefügt.`)
  }
}
