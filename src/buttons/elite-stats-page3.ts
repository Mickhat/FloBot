import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder } from 'discord.js'
import { EliteGameDataStorage } from '../service/eliteGameDataStorage'

function createRow(stats: any, i: number): any {
  if (stats.length > i) {
    return {
      name: `No. ${i + 1}`,
      value: `<@${stats[i].userId}>`,
      inline: false
    }
  }
}

export default {
  buttonId: /elite-stats-page3/,
  async execute(interaction: ButtonInteraction): Promise<void> {
    const stats = await EliteGameDataStorage.instance().loadTodaysPlayers()
    const rows = Array.from({ length: Math.min(11, stats.length) }, (_, index) => createRow(stats, index))
    await interaction.update({
      embeds: [
        new EmbedBuilder()
          .setTitle('Todays participants')
          .addFields(rows)
          .setFooter({
            text: 'Seite 3/3'
          })
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel('14 days winners')
            .setEmoji('◀️')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('elite-stats-page2')
        )
      ]
    })
  }
}
