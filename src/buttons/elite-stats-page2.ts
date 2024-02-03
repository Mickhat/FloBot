import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder } from 'discord.js'
import { EliteGameDataStorage } from '../service/eliteGameDataStorage'
import { createRow } from '../commands/elite-stats'

export default {
  buttonId: /elite-stats-page2/,
  async execute(interaction: ButtonInteraction): Promise<void> {
    const stats = await EliteGameDataStorage.instance().loadWinnersStats(14)
    const rows = Array.from({ length: Math.min(11, stats.length) }, (_, index) => createRow(stats, index))
    await interaction.update({
      embeds: [
        new EmbedBuilder()
          .setTitle('14 days winners')
          .addFields(rows)
          .setFooter({
            text: 'Seite 2/3'
          })
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel('365 days winners')
            .setEmoji('◀️')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('elite-stats-page1'),
          new ButtonBuilder()
            .setLabel('Todays participants')
            .setEmoji('▶️')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('elite-stats-page3')
        )
      ]
    })
  }
}
