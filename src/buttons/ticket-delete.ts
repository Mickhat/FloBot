import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle } from "discord.js"

export default {
  buttonId: "ticket-delete",

  async execute (interaction: ButtonInteraction): Promise<void> {
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
}
