import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder } from 'discord.js'

export default {
  buttonId: /help-page4/,
  async execute(interaction: ButtonInteraction): Promise<void> {
    await interaction.update({
      embeds: [
        new EmbedBuilder()
          .setTitle('Umfragen')
          .setDescription(
            'Umfragen sind etwas wertvolles, wenn man schnell möglichst viele Meinungen braucht. ' +
              'Um eine Umfrage zu erstellen, nutze **/voting**. Gebe dort nun deine Frage ein.\n' +
              'Anschließen musst du deine Antwortmöglichkeiten eingeben. Gebe diese mit Komata getrennt __ohne Leerzeichen__ nach dem Komma ein. Du kannst bis zu 6 Antwortmöglichkeiten eintragen'
          )
          .setFooter({
            text: 'Seite 4/4'
          })
      ],
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel('Vorherige Seite')
            .setEmoji('◀️')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('help-page3')
        )
      ]
    })
  }
}
