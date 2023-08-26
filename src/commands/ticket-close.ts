import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, CommandInteraction, SlashCommandBuilder } from "discord.js"

export default {
  data: new SlashCommandBuilder().setName('ticket-close')
    .setDescription('Das Ticket schließen'),
  async execute (interaction: CommandInteraction) {
    const channel = interaction.channel

    if (!channel || channel.type !== ChannelType.GuildText) {
      await interaction.reply({ content: 'Ticket konnte nicht geschlossen werden', ephemeral: true })
      return
    }

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
}
