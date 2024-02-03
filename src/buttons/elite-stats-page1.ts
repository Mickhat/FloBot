import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder } from 'discord.js'
import { EliteGameDataStorage } from '../service/eliteGameDataStorage'
import { createRow } from '../commands/elite-stats'

export default {
  buttonId: /elite-stats-page1/,
  async execute(interaction: ButtonInteraction): Promise<void> {
    const stats = await EliteGameDataStorage.instance().loadWinnersStats(365)
    const rows = Array.from({ length: Math.min(11, stats.length) }, (_, index) => createRow(stats, index))
    await interaction.update({
      embeds: [
        new EmbedBuilder()
          .setTitle('365 days winners')
          .addFields(rows)
          .setFooter({
            text: 'Seite 1/3'
          })
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel('Nächste Seite')
            .setEmoji('▶️')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('elite-stats-page2')
        )
      ]
    })
  }
}
