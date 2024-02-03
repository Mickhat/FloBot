import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder
} from 'discord.js'
import { EliteGameDataStorage } from '../service/eliteGameDataStorage'

export function createRow(stats: any, i: number): any {
  if (stats.length > i) {
    return {
      name: `No. ${i + 1} : ${stats[i].count} wins`,
      value: `<@${stats[i].userId}>`,
      inline: false
    }
  }
}

export default {
  data: new SlashCommandBuilder().setName('leet-stats').setDescription('Shows stats for the elite game.'),
  async execute(interaction: CommandInteraction): Promise<void> {
    const stats = await EliteGameDataStorage.instance().loadWinnersStats(365)
    const rows = Array.from({ length: Math.min(11, stats.length) }, (_, index) => createRow(stats, index))
    await interaction.reply({
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
            .setLabel('14 days winners')
            .setEmoji('▶️')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('elite-stats-page2')
        )
      ],
      ephemeral: true
    })
  }
}
